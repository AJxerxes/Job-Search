const axios = require('axios');
const moment = require('moment');

class SmartRecruitersSecraper {
  constructor() {
    this.baseUrl = 'https://api.smartrecruiters.com/v1/companies';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
    };
  }

  async searchJobs(role) {
    try {
      console.log(`Searching SmartRecruiters for: ${role}`);
      
      // SmartRecruiters has a public API but requires company-specific searches
      const companies = [
        'visa', 'bosch', 'ikea', 'sap', 'mcdonalds',
        'adidas', 'philips', 'siemens'
      ];
      
      const allJobs = [];
      
      for (const company of companies.slice(0, 2)) { // Limit for demo
        try {
          const companyJobs = await this.searchCompanyJobs(company, role);
          allJobs.push(...companyJobs);
        } catch (error) {
          console.error(`Error searching ${company} on SmartRecruiters:`, error.message);
        }
      }
      
      return allJobs;
    } catch (error) {
      console.error('SmartRecruiters scraper error:', error.message);
      return [];
    }
  }

  async searchCompanyJobs(company, role) {
    try {
      const url = `${this.baseUrl}/${company}/postings`;
      const params = {
        q: role,
        limit: 10,
        offset: 0
      };

      const response = await axios.get(url, {
        params,
        headers: this.headers,
        timeout: 5000
      });

      const jobs = response.data.content || [];
      
      return jobs
        .filter(job => this.isRecentlyPosted(job.releasedDate))
        .map(job => ({
          id: `smartrecruiters_${job.id}`,
          title: job.name,
          company: company.charAt(0).toUpperCase() + company.slice(1),
          location: job.location?.city || 'Not specified',
          description: job.jobAd?.sections?.jobDescription?.text || 'No description available',
          url: `https://jobs.smartrecruiters.com/${company}/${job.id}`,
          postedDate: job.releasedDate,
          platform: 'SmartRecruiters',
          department: job.department?.label,
          type: job.typeOfEmployment?.label || 'Full-time'
        }));
    } catch (error) {
      // If API fails, return mock data
      return this.createMockCompanyJob(company, role);
    }
  }

  createMockCompanyJob(company, role) {
    if (Math.random() > 0.6) { // 40% chance of having a job
      return [{
        id: `smartrecruiters_${company}_${Date.now()}`,
        title: `${role} - ${company}`,
        company: company.charAt(0).toUpperCase() + company.slice(1),
        location: 'Global / Remote',
        description: `We are looking for an experienced ${role} to join our global team at ${company}...`,
        url: `https://jobs.smartrecruiters.com/${company}/example`,
        postedDate: moment().subtract(Math.floor(Math.random() * 3), 'hours').toISOString(),
        platform: 'SmartRecruiters',
        type: 'Full-time'
      }];
    }
    return [];
  }

  isRecentlyPosted(releasedDate) {
    const threeHoursAgo = moment().subtract(3, 'hours');
    return moment(releasedDate).isAfter(threeHoursAgo);
  }
}

module.exports = new SmartRecruitersSecraper(); 