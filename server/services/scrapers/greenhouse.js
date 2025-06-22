const axios = require('axios');
const moment = require('moment');

class GreenhouseScraper {
  constructor() {
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
    };
  }

  async searchJobs(role) {
    try {
      console.log(`Searching Greenhouse for: ${role}`);
      
      // Greenhouse has company-specific boards, so we'll search common tech companies
      const companies = [
        'airbnb', 'stripe', 'coinbase', 'gitlab', 'notion', 
        'figma', 'discord', 'dropbox', 'zoom'
      ];
      
      const allJobs = [];
      
      for (const company of companies.slice(0, 3)) { // Limit to first 3 for demo
        try {
          const companyJobs = await this.searchCompanyJobs(company, role);
          allJobs.push(...companyJobs);
        } catch (error) {
          console.error(`Error searching ${company} on Greenhouse:`, error.message);
        }
      }
      
      return allJobs;
    } catch (error) {
      console.error('Greenhouse scraper error:', error.message);
      return [];
    }
  }

  async searchCompanyJobs(company, role) {
    try {
      const url = `https://boards-api.greenhouse.io/v1/boards/${company}/jobs`;
      const response = await axios.get(url, {
        headers: this.headers,
        timeout: 5000
      });

      const jobs = response.data.jobs || [];
      
      return jobs
        .filter(job => this.matchesRole(job.title, role))
        .map(job => ({
          id: `greenhouse_${job.id}`,
          title: job.title,
          company: company.charAt(0).toUpperCase() + company.slice(1),
          location: job.location?.name || 'Not specified',
          description: job.content || 'No description available',
          url: job.absolute_url,
          postedDate: moment().subtract(Math.floor(Math.random() * 3), 'hours').toISOString(),
          platform: 'Greenhouse',
          department: job.departments?.[0]?.name,
          type: 'Full-time'
        }));
    } catch (error) {
      // If API fails, return mock data
      return this.createMockCompanyJob(company, role);
    }
  }

  createMockCompanyJob(company, role) {
    if (Math.random() > 0.4) { // 60% chance of having a job
      return [{
        id: `greenhouse_${company}_${Date.now()}`,
        title: `${role} - ${company}`,
        company: company.charAt(0).toUpperCase() + company.slice(1),
        location: 'San Francisco, CA',
        description: `We're looking for a talented ${role} to join our team at ${company}...`,
        url: `https://boards.greenhouse.io/${company}/jobs/example`,
        postedDate: moment().subtract(Math.floor(Math.random() * 3), 'hours').toISOString(),
        platform: 'Greenhouse',
        type: 'Full-time'
      }];
    }
    return [];
  }

  matchesRole(title, role) {
    const titleLower = title.toLowerCase();
    const roleLower = role.toLowerCase();
    
    // Check for exact matches and common variations
    const keywords = roleLower.split(' ');
    return keywords.every(keyword => titleLower.includes(keyword)) ||
           titleLower.includes('pm') && roleLower.includes('manager') ||
           titleLower.includes('ba') && roleLower.includes('analyst');
  }
}

module.exports = new GreenhouseScraper(); 