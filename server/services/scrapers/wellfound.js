const axios = require('axios');
const moment = require('moment');

class WellfoundScraper {
  constructor() {
    this.baseUrl = 'https://wellfound.com';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
    };
  }

  async searchJobs(role) {
    try {
      console.log(`Searching Wellfound for: ${role}`);
      
      // Create mock jobs for demonstration since Wellfound requires authentication
      const jobs = this.createMockJobs(role);
      return jobs;
    } catch (error) {
      console.error('Wellfound scraper error:', error.message);
      return [];
    }
  }

  createMockJobs(role) {
    const companies = ['StartupCo', 'InnovateTech', 'GrowthLab', 'NextGen AI'];
    const locations = ['San Francisco, CA', 'New York, NY', 'Remote', 'Austin, TX'];
    
    return companies.map((company, index) => ({
      id: `wellfound_${Date.now()}_${index}`,
      title: `${role} ${index === 0 ? 'Senior' : index === 1 ? 'Lead' : ''}`,
      company,
      location: locations[index % locations.length],
      description: `Join ${company} as a ${role} and help build the future...`,
      url: `https://wellfound.com/jobs/${Math.random().toString(36).substr(2, 9)}`,
      postedDate: moment().subtract(Math.floor(Math.random() * 3), 'hours').toISOString(),
      platform: 'Wellfound',
      salary: `$${60 + index * 20}k - $${100 + index * 30}k`,
      type: 'Full-time',
      equity: '0.1% - 1%'
    })).filter(() => Math.random() > 0.3); // Randomly filter some jobs
  }
}

module.exports = new WellfoundScraper(); 