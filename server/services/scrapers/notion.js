const axios = require('axios');
const moment = require('moment');

class NotionScraper {
  constructor() {
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
    };
  }

  async searchJobs(role) {
    try {
      console.log(`Searching Notion for: ${role}`);
      
      // Create mock jobs for Notion careers
      const jobs = this.createMockJobs(role);
      return jobs;
    } catch (error) {
      console.error('Notion scraper error:', error.message);
      return [];
    }
  }

  createMockJobs(role) {
    if (Math.random() > 0.7) { // 30% chance of having a job at Notion
      return [{
        id: `notion_${Date.now()}`,
        title: `${role} - Notion`,
        company: 'Notion',
        location: 'San Francisco, CA / Remote',
        description: `Join Notion as a ${role} and help us build the future of productivity tools...`,
        url: 'https://notion.so/careers',
        postedDate: moment().subtract(Math.floor(Math.random() * 3), 'hours').toISOString(),
        platform: 'Notion',
        salary: '$150,000 - $220,000',
        type: 'Full-time',
        equity: 'Yes'
      }];
    }
    return [];
  }
}

module.exports = new NotionScraper(); 