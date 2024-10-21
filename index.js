// index.js
require('dotenv').config();
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, downloadContentFromMessage } = require('baileys');
const { Boom } = require('@hapi/boom');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const qrcode = require('qrcode-terminal');
const fs = require('fs').promises;
const { logInfo, logSuccess, logWarning, logError } = require('./logger');

// Initialize Gemini AI with API key from .env
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Initialize chat history
let chatHistory = [];

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
      
        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect.error instanceof Boom &&
            lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut);
      
          logWarning('Connection closed due to ' + lastDisconnect.error);
          logInfo('Reconnecting: ' + (shouldReconnect ? 'Yes' : 'No'));
      
          if (shouldReconnect) {
            // Retry the connection after a short delay
            setTimeout(() => {
              connectToWhatsApp();
            }, 5000);
          } else {
            logError('Connection closed due to unknown error: ' + lastDisconnect.error);
          }
        } else if (connection === 'error') {
          logError('Connection error: ' + update.error);
        }
      });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;

        let messageContent = '';
        let hasImage = false;
        let imageBuffer = null;

        // Check for text in various message types
        if (m.message.conversation) {
            messageContent = m.message.conversation;
        } else if (m.message.extendedTextMessage) {
            messageContent = m.message.extendedTextMessage.text;
        } else if (m.message.imageMessage) {
            messageContent = m.message.imageMessage.caption || '';
            hasImage = true;
        }

        logInfo('Message received: ' + messageContent);

        // Process message even if it doesn't start with '!' when there's an image
        if (messageContent.startsWith('!') || hasImage) {
            const command = messageContent.startsWith('!') ? messageContent.slice(1).trim().toLowerCase() : messageContent.trim().toLowerCase();

            if (command === 'reset') {
                chatHistory = [];
                await sock.sendMessage(m.key.remoteJid, { text: 'Chat history has been reset.' });
                return;
            }

            try {
                logInfo('Processing query: ' + command);
                
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                if (hasImage) {
                    imageBuffer = await downloadImage(m.message.imageMessage);
                    logInfo('Image downloaded successfully');
                }

                let result;
                if (imageBuffer) {
                    const imagePart = {
                        inlineData: {
                            data: imageBuffer.toString('base64'),
                            mimeType: 'image/jpeg'
                        }
                    };
                    result = await model.generateContent([imagePart, { text: command }]);
                } else {
                    result = await model.generateContent([...chatHistory, { text: command }]);
                }

                const response = result.response;
                const text = response.text();

                // Update chat history
                chatHistory.push({ text: command });
                chatHistory.push({ text: text });
                // Keep only the last 10 messages in the history
                if (chatHistory.length > 10) {
                    chatHistory = chatHistory.slice(-10);
                }

                logSuccess('Generated response: ' + text);
                
                await sock.sendMessage(m.key.remoteJid, { text });
            } catch (error) {
                logError('Error generating response: ' + error);
                await sock.sendMessage(m.key.remoteJid, { text: 'Sorry, I encountered an error while processing your request.' });
            }
        }
    });
}

async function downloadImage(imageMessage) {
    try {
        const stream = await downloadContentFromMessage(imageMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        logInfo('Image downloaded, size: ' + buffer.length + ' bytes');
        return buffer;
    } catch (error) {
        logError('Error downloading image: ' + error);
        return null;
    }
}

connectToWhatsApp();