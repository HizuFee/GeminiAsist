# WhatsApp Bot with Gemini AI Integration

This is a Node.js-based bot that connects to WhatsApp using the Baileys library and integrates with Google Gemini AI for generative text responses. It can respond to text commands and process images, generating AI-driven responses from Gemini AI.

## Features
- Connects to WhatsApp via QR code and handles reconnections.
- Receives messages from WhatsApp and responds using Gemini AI.
- Supports text and image messages.
- Maintains a chat history to provide context to AI responses.

## Prerequisites

- Node.js (v14+)
- A valid `.env` file with your Google Gemini API key (`API_KEY`)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/HizuFee/GeminiAsist.git
   cd whatsapp-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your `.env` file with the following variable:
   ```
   API_KEY=your_google_gemini_api_key
   ```

## Usage

1. Run the bot:
   ```bash
   node index.js
   ```

2. Scan the QR code that appears in the terminal to connect the bot to WhatsApp.

3. Use commands by sending a message in WhatsApp:
   - **Reset chat history**: Send `!reset`.
   - **Ask a question or command**: Send `!your_command` or simply a message if it contains an image.

## Code Overview

The main file `index.js` includes the following key components:
- **Environment Configuration**: Loads environment variables using `dotenv`.
- **Baileys Setup**: Connects to WhatsApp, handles QR code generation, and manages reconnections.
- **Gemini AI Integration**: Initializes Gemini AI with the API key and processes commands using AI.
- **Chat History**: Maintains a limited chat history for context in AI responses.
- **Image Downloading**: Downloads image content from messages for AI processing.

## Code Breakdown

### Authentication and Connection Handling
The `connectToWhatsApp` function initializes the connection to WhatsApp, manages QR code display, and reconnects on disconnection.

### Message Processing
Messages are parsed for text commands or images:
- Commands starting with `!` trigger specific actions.
- The `reset` command clears the chat history.

### Gemini AI Integration
Uses the Google Gemini API to generate responses based on message history and image inputs.

### Image Handling
The `downloadImage` function downloads images from WhatsApp messages and converts them into a format that can be sent to Gemini AI for content generation.

## Dependencies

- [Baileys]([https://github.com/adiwajshing/Baileys](https://github.com/WhiskeySockets/Baileys)) - A library to connect to WhatsApp Web APIs.
- [qrcode-terminal](https://www.npmjs.com/package/qrcode-terminal) - Displays QR codes in the terminal.
- [Google Generative AI](https://www.npmjs.com/package/@google/generative-ai) - For integrating Gemini AI.

## Logging

The bot logs different levels of information using functions from a `logger.js` module:
- **logInfo**: General informational messages.
- **logSuccess**: Successful events.
- **logWarning**: Warnings, like connection issues.
- **logError**: Errors in processing or connectivity.

## License
MIT License.

## Contact
For questions or contributions, contact [sanditri145@gmail.com].
```
