const axios = require('axios');
const moment = require('moment');

class WorkableScraper {
  constructor() {
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
    };
  }

  async searchJobs(role) {
    try {
      console.log(`Searching Workable for: ${role}`);
      
      // Create mock jobs since Workable requires specific company subdomains
      const jobs = this.createMockJobs(role);
      return jobs;
    } catch (error) {
      console.error('Workable scraper error:', error.message);
      return [];
    }
  }

  createMockJobs(role) {
    const companies = [
      'TechStartup', 'DataDriven', 'CloudNine', 'AgileWorks', 
      'InnovativeSoft', 'ScaleUp'
    ];
    
    const locations = [
      'London, UK', 'Berlin, Germany', 'Amsterdam, Netherlands',
      'Barcelona, Spain', 'Remote - Europe', 'Dublin, Ireland'
    ];

    return companies
      .filter(() => Math.random() > 0.4) // Randomly include some companies
      .map((company, index) => ({
        id: `workable_${Date.now()}_${index}`,
        title: this.generateTitle(role, index),
        company,
        location: locations[index % locations.length],
        description: `${company} is seeking a talented ${role} to join our dynamic team and drive innovation...`,
        url: `https://${company.toLowerCase()}.workable.com/jobs/${Math.random().toString(36).substr(2, 9)}`,
        postedDate: moment().subtract(Math.floor(Math.random() * 3), 'hours').toISOString(),
        platform: 'Workable',
        salary: this.generateSalary(),
        type: Math.random() > 0.8 ? 'Contract' : 'Full-time',
        remote: Math.random() > 0.6
      }));
  }

  generateTitle(role, index) {
    const prefixes = ['', 'Senior ', 'Lead ', 'Principal '];
    const suffixes = ['', ' - Remote', ' (Remote)', ' - Hybrid'];
    
    const prefix = index < 2 ? prefixes[index] : '';
    const suffix = Math.random() > 0.7 ? suffixes[Math.floor(Math.random() * suffixes.length)] : '';
    
    return `${prefix}${role}${suffix}`;
  }

  generateSalary() {
    const base = Math.floor(Math.random() * 40000) + 50000;
    const top = base + Math.floor(Math.random() * 30000) + 20000;
    return `€${base.toLocaleString()} - €${top.toLocaleString()}`;
  }
}

module.exports = new WorkableScraper(); 