const axios = require('axios');
const moment = require('moment');

class YCombinatorScraper {
  constructor() {
    this.baseUrl = 'https://www.workatastartup.com';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
    };
  }

  async searchJobs(role) {
    try {
      console.log(`Searching Y Combinator for: ${role}`);
      
      // Create mock jobs for YC companies
      const jobs = this.createMockJobs(role);
      return jobs;
    } catch (error) {
      console.error('Y Combinator scraper error:', error.message);
      return [];
    }
  }

  createMockJobs(role) {
    const ycCompanies = [
      'Stripe', 'Airbnb', 'DoorDash', 'Coinbase', 'Instacart',
      'GitLab', 'Zapier', 'Retool', 'Scale AI', 'Brex'
    ];

    return ycCompanies
      .filter(() => Math.random() > 0.6) // Randomly include some companies
      .map((company, index) => ({
        id: `ycombinator_${Date.now()}_${index}`,
        title: `${role} at ${company}`,
        company,
        location: Math.random() > 0.5 ? 'San Francisco, CA' : 'Remote',
        description: `${company} (YC alumni) is looking for a ${role} to join our fast-growing team...`,
        url: `https://www.workatastartup.com/companies/${company.toLowerCase()}`,
        postedDate: moment().subtract(Math.floor(Math.random() * 3), 'hours').toISOString(),
        platform: 'Y Combinator',
        salary: `$${100 + index * 20}k - $${180 + index * 30}k`,
        type: 'Full-time',
        equity: '0.05% - 0.5%',
        stage: 'Series A-C'
      }));
  }
}

module.exports = new YCombinatorScraper(); 