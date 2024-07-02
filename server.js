require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function fetchPrivacyPolicy(url) {
    try {
        console.log(`Fetching privacy policy from: ${url}`);
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        const policyText = $('body').text();
        
        console.log(`Policy text length: ${policyText.length} characters`);
        return policyText;
    } catch (error) {
        console.error('Error fetching privacy policy:', error);
        throw new Error(`Failed to fetch privacy policy: ${error.message}`);
    }
}

async function summarizeText(text) {
    try {
        console.log('Summarizing text...');
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `Summarize this privacy policy:\n\n${text.substring(0, 3000)}\n\nSummary:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();

        console.log(`Generated summary: ${summary}`);
        return summary;
    } catch (error) {
        console.error('Error summarizing text:', error);
        throw new Error(`Failed to summarize privacy policy: ${error.message}`);
    }
}

app.post('/summarize', async (req, res) => {
    try {
        const { url } = req.body;
        console.log(`Received request to summarize: ${url}`);
        
        if (!url) {
            throw new Error('No URL provided');
        }

        const policyText = await fetchPrivacyPolicy(url);
        
        if (!policyText) {
            throw new Error('No policy text fetched');
        }

        const summary = await summarizeText(policyText);
        
        if (!summary) {
            throw new Error('Summary is undefined');
        }
        
        res.json({ summary });
    } catch (error) {
        console.error('Error in /summarize endpoint:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:3000`);
});