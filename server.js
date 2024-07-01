require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const OpenAI = require('openai');

const app = express();
const port = 3005;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function fetchPrivacyPolicy(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        // This is a simple example. You might need to adjust the selector
        // based on the specific structure of the websites you're targeting.
        const policyText = $('body').text();
        
        return policyText;
    } catch (error) {
        console.error('Error fetching privacy policy:', error);
        throw new Error('Failed to fetch privacy policy');
    }
}

async function summarizeText(text) {
    try {
        const response = await openai.completions.create({
            model: "gpt-3.5-turbo",
            prompt: `Summarize this privacy policy:\n\n${text}\n\nSummary:`,
            max_tokens: 150,
            temperature: 0.5,
        });

        return response.choices[0].text.trim();
    } catch (error) {
        console.error('Error summarizing text:', error);
        throw new Error('Failed to summarize privacy policy');
    }
}

app.post('/summarize', async (req, res) => {
    try {
        const { url } = req.body;
        const policyText = await fetchPrivacyPolicy(url);
        const summary = await summarizeText(policyText);
        res.json({ summary });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve the index.html file for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:3005`);
});