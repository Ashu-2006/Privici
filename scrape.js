const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeText(url) {
  try {
    // Fetch the HTML content of the URL
    const response = await axios.get(url);
    const html = response.data;

    // Load the HTML content into cheerio
    const $ = cheerio.load(html);

    // Array to store the scraped text
    const scrapedText = [];

    // Function to recursively extract text from an element and its children
    function extractText(element) {
      $(element).contents().each((_, node) => {
        if (node.type === 'text') {
          const text = $(node).text().trim();
          if (text) scrapedText.push(text);
        } else if (node.type === 'tag') {
          extractText(node);
        }
      });
    }

    // Extract text from body, maintaining order
    extractText('body');

    // Join the scraped text array into a single string
    return scrapedText.join('\n');
  } catch (error) {
    console.error('Error scraping the website:', error);
    return null;
  }
}

// Usage example
const url = 'https://www.example.com';
scrapeText(url).then((text) => {
  if (text) {
    console.log('Scraped text:');
    console.log(text);
  } else {
    console.log('Failed to scrape the website.');
  }
});