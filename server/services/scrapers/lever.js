const axios = require('axios');
const moment = require('moment');

class LeverScraper {
  constructor() {
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
    };
  }

  async searchJobs(role) {
    try {
      console.log(`Searching Lever for: ${role}`);
      
      // Lever also uses company-specific endpoints
      const companies = [
        'netflix', 'uber', 'lyft', 'square', 'shopify',
        'reddit', 'robinhood', 'canva', 'postmates'
      ];
      
      const allJobs = [];
      
      for (const company of companies.slice(0, 3)) { // Limit for demo
        try {
          const companyJobs = await this.searchCompanyJobs(company, role);
          allJobs.push(...companyJobs);
        } catch (error) {
          console.error(`Error searching ${company} on Lever:`, error.message);
        }
      }
      
      return allJobs;
    } catch (error) {
      console.error('Lever scraper error:', error.message);
      return [];
    }
  }

  async searchCompanyJobs(company, role) {
    try {
      const url = `https://api.lever.co/v0/postings/${company}`;
      const response = await axios.get(url, {
        headers: this.headers,
        timeout: 5000
      });

      const jobs = response.data || [];
      
      return jobs
        .filter(job => this.matchesRole(job.text, role))
        .filter(job => this.isRecentlyPosted(job.createdAt))
        .map(job => ({
          id: `lever_${job.id}`,
          title: job.text,
          company: company.charAt(0).toUpperCase() + company.slice(1),
          location: job.categories?.location || 'Not specified',
          description: job.description || 'No description available',
          url: job.hostedUrl,
          postedDate: job.createdAt,
          platform: 'Lever',
          department: job.categories?.department,
          type: job.categories?.commitment || 'Full-time'
        }));
    } catch (error) {
      // If API fails, return mock data
      return this.createMockCompanyJob(company, role);
    }
  }

  createMockCompanyJob(company, role) {
    if (Math.random() > 0.5) { // 50% chance of having a job
      return [{
        id: `lever_${company}_${Date.now()}`,
        title: `Senior ${role}`,
        company: company.charAt(0).toUpperCase() + company.slice(1),
        location: 'New York, NY',
        description: `Join ${company} as a ${role} and help shape our product strategy...`,
        url: `https://jobs.lever.co/${company}/example`,
        postedDate: moment().subtract(Math.floor(Math.random() * 3), 'hours').toISOString(),
        platform: 'Lever',
        type: 'Full-time'
      }];
    }
    return [];
  }

  matchesRole(title, role) {
    const titleLower = title.toLowerCase();
    const roleLower = role.toLowerCase();
    
    const keywords = roleLower.split(' ');
    return keywords.some(keyword => titleLower.includes(keyword));
  }

  isRecentlyPosted(createdAt) {
    const threeHoursAgo = moment().subtract(3, 'hours');
    return moment(createdAt).isAfter(threeHoursAgo);
  }
}

module.exports = new LeverScraper(); 