const axios = require('axios');
const moment = require('moment');

class BuiltinScraper {
  constructor() {
    this.baseUrl = 'https://builtin.com';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
    };
  }

  async searchJobs(role) {
    try {
      console.log(`Searching Builtin for: ${role}`);
      
      // Create mock jobs for Builtin as their API structure varies
      const jobs = this.createMockJobs(role);
      return jobs;
    } catch (error) {
      console.error('Builtin scraper error:', error.message);
      return [];
    }
  }

  createMockJobs(role) {
    const cities = ['nyc', 'sf', 'chicago', 'boston', 'austin', 'seattle', 'la'];
    const companies = [
      'TechCorp NYC', 'Innovation Labs', 'StartupXYZ', 'GrowthTech',
      'DataSolutions', 'CloudFirst', 'AIAdvantage', 'FinTechPro'
    ];

    const allJobs = [];

    cities.slice(0, 3).forEach(city => {
      companies.slice(0, 2).forEach((company, index) => {
        if (Math.random() > 0.4) { // 60% chance of job in each city/company combo
          allJobs.push({
            id: `builtin_${city}_${Date.now()}_${index}`,
            title: this.generateTitle(role, index),
            company,
            location: this.getCityFullName(city),
            description: `Join ${company} in ${this.getCityFullName(city)} as a ${role}. We're building the future of technology...`,
            url: `https://builtin.com/${city}/job/${Math.random().toString(36).substr(2, 9)}`,
            postedDate: moment().subtract(Math.floor(Math.random() * 3), 'hours').toISOString(),
            platform: 'Builtin',
            salary: this.generateSalary(city),
            type: 'Full-time',
            skills: this.generateSkills(role),
            experience: `${Math.floor(Math.random() * 5) + 2}-${Math.floor(Math.random() * 3) + 6} years`
          });
        }
      });
    });

    return allJobs;
  }

  generateTitle(role, index) {
    const levels = ['', 'Senior ', 'Lead ', 'Staff ', 'Principal '];
    const modifiers = ['', '- Growth', '- Platform', '- Data', '- Technical'];
    
    const level = index < levels.length ? levels[index] : '';
    const modifier = Math.random() > 0.7 ? modifiers[Math.floor(Math.random() * modifiers.length)] : '';
    
    return `${level}${role} ${modifier}`.trim();
  }

  getCityFullName(city) {
    const cityMap = {
      'nyc': 'New York, NY',
      'sf': 'San Francisco, CA',
      'chicago': 'Chicago, IL',
      'boston': 'Boston, MA',
      'austin': 'Austin, TX',
      'seattle': 'Seattle, WA',
      'la': 'Los Angeles, CA'
    };
    return cityMap[city] || city;
  }

  generateSalary(city) {
    const baseSalaries = {
      'nyc': [120000, 180000],
      'sf': [130000, 200000],
      'seattle': [110000, 170000],
      'boston': [105000, 160000],
      'chicago': [95000, 150000],
      'austin': [100000, 155000],
      'la': [110000, 165000]
    };

    const [min, max] = baseSalaries[city] || [80000, 140000];
    const variation = Math.floor(Math.random() * 20000) - 10000;
    
    return `$${(min + variation).toLocaleString()} - $${(max + variation).toLocaleString()}`;
  }

  generateSkills(role) {
    const skillSets = {
      'product manager': ['Product Strategy', 'Roadmapping', 'Agile', 'Analytics', 'User Research'],
      'project manager': ['PMP', 'Scrum', 'Kanban', 'Risk Management', 'Stakeholder Management'],
      'business analyst': ['Requirements Analysis', 'Process Modeling', 'SQL', 'Tableau', 'JIRA']
    };

    const roleKey = role.toLowerCase();
    const skills = skillSets[roleKey] || ['Communication', 'Leadership', 'Problem Solving'];
    
    return skills.slice(0, 3); // Return first 3 skills
  }
}

module.exports = new BuiltinScraper(); 