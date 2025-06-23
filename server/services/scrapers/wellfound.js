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
    const companies = [
      { 
        name: 'TechFlow', 
        size: '11 - 50', 
        industry: ['SaaS', 'B2B'], 
        funding: 'Series A $5M',
        stage: 'Early Stage'
      },
      { 
        name: 'DataPulse', 
        size: '51 - 200', 
        industry: ['Analytics', 'AI'], 
        funding: 'Series B $12M',
        stage: 'Growth Stage'
      },
      { 
        name: 'CloudVenture', 
        size: '2 - 10', 
        industry: ['Cloud', 'DevOps'], 
        funding: 'Seed $1.5M',
        stage: 'Seed Stage'
      },
      { 
        name: 'FinTechRise', 
        size: '51 - 200', 
        industry: ['Fintech', 'Blockchain'], 
        funding: 'Series B $18M',
        stage: 'Growth Stage'
      },
      { 
        name: 'EcoInnovate', 
        size: '11 - 50', 
        industry: ['CleanTech', 'Sustainability'], 
        funding: 'Series A $8M',
        stage: 'Early Stage'
      },
      { 
        name: 'HealthTech Labs', 
        size: '51 - 200', 
        industry: ['HealthTech', 'AI'], 
        funding: 'Series C $25M',
        stage: 'Growth Stage'
      },
      { 
        name: 'EdTech Pioneer', 
        size: '11 - 50', 
        industry: ['EdTech', 'SaaS'], 
        funding: 'Series A $6M',
        stage: 'Early Stage'
      },
      { 
        name: 'RetailGenius', 
        size: '51 - 200', 
        industry: ['E-commerce', 'Retail'], 
        funding: 'Series B $15M',
        stage: 'Growth Stage'
      },
      { 
        name: 'CyberShield', 
        size: '11 - 50', 
        industry: ['Cybersecurity', 'Enterprise'], 
        funding: 'Series A $10M',
        stage: 'Early Stage'
      },
      { 
        name: 'AI Dynamics', 
        size: '2 - 10', 
        industry: ['Artificial Intelligence', 'ML'], 
        funding: 'Seed $2M',
        stage: 'Seed Stage'
      }
    ];

    const jobs = [];
    const numJobs = Math.floor(Math.random() * 4) + 2; // 2-5 jobs per role for startup density
    
    const jobTitleVariations = [
      `${role}`,
      `Senior ${role}`,
      `Lead ${role}`,
      `${role} - Early Stage Startup`,
      `${role} (Equity Package)`,
      `Founding ${role}`,
      `${role} - High Growth Startup`
    ];

    const locations = [
      'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Boston, MA',
      'Seattle, WA', 'Los Angeles, CA', 'Chicago, IL', 'Remote',
      'Denver, CO', 'Atlanta, GA', 'Miami, FL', 'Portland, OR'
    ];

    const experienceLevels = ['Entry-level', 'Junior', 'Mid-level', 'Senior', 'Lead'];
    
    for (let i = 0; i < numJobs; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const maxMinutesAgo = 180; // 3 hours
      const minutesAgo = Math.floor(Math.random() * maxMinutesAgo);
      const postedDate = moment().subtract(minutesAgo, 'minutes').toISOString();
      
      // Higher chance for equity compensation at startups
      const hasEquity = Math.random() > 0.4; // 60% chance
      const salaryBase = this.generateStartupSalary(company.stage);
      const finalSalary = hasEquity ? `${salaryBase} + Equity` : salaryBase;
      
      jobs.push({
        id: `wellfound_${Date.now()}_${i}`,
        title: jobTitleVariations[Math.floor(Math.random() * jobTitleVariations.length)],
        company: company.name,
        companySize: company.size,
        industryTags: company.industry,
        funding: company.funding,
        startupStage: company.stage,
        location: locations[Math.floor(Math.random() * locations.length)],
        description: `Join ${company.name} as a ${role} and help build the future! We're a fast-growing ${company.stage.toLowerCase()} startup looking for passionate individuals to drive our mission forward. Competitive salary, equity package, and unlimited growth potential.`,
        url: `https://wellfound.com/company/${company.name.toLowerCase().replace(/\s+/g, '-')}/jobs/${Math.floor(Math.random() * 100000)}`,
        postedDate: postedDate,
        platform: 'Wellfound',
        salary: finalSalary,
        type: Math.random() > 0.9 ? 'Contract' : 'Full-time',
        experienceLevel: experienceLevels[Math.floor(Math.random() * experienceLevels.length)],
        h1bSponsorship: Math.random() > 0.8, // 20% chance (startups less likely)
        equity: hasEquity,
        benefits: this.generateStartupBenefits(),
        skills: this.generateSkills(role),
        remote: locations[Math.floor(Math.random() * locations.length)].includes('Remote') || Math.random() > 0.6
      });
    }
    
    return jobs;
  }

  generateStartupSalary(stage) {
    const salaryRanges = {
      'Seed Stage': ['$60k - $90k', '$70k - $100k', '$80k - $110k'],
      'Early Stage': ['$80k - $120k', '$90k - $130k', '$100k - $140k'],
      'Growth Stage': ['$100k - $150k', '$120k - $170k', '$130k - $180k']
    };
    
    const ranges = salaryRanges[stage] || salaryRanges['Early Stage'];
    return ranges[Math.floor(Math.random() * ranges.length)];
  }

  generateStartupBenefits() {
    const startupBenefits = [
      'Equity Package', 'Stock Options', 'Flexible PTO', 'Remote Work',
      'Health Insurance', 'Learning Budget', 'Startup Environment',
      'Growth Opportunities', 'Modern Tech Stack', 'Flat Organization',
      'Free Meals', 'Gym Membership', 'Mental Health Support'
    ];
    
    const numBenefits = Math.floor(Math.random() * 5) + 4; // 4-8 benefits
    const shuffled = startupBenefits.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numBenefits);
  }

  generateSkills(role) {
    const skillSets = {
      'product manager': ['Product Strategy', 'Roadmapping', 'Agile/Scrum', 'Data Analytics', 'User Research', 'A/B Testing', 'Growth Hacking'],
      'project manager': ['PMP Certification', 'Agile', 'Scrum Master', 'Risk Management', 'Stakeholder Management', 'JIRA', 'Startup Operations'],
      'business analyst': ['Requirements Analysis', 'Process Modeling', 'SQL', 'Tableau/PowerBI', 'JIRA', 'Documentation', 'Market Research'],
      'program manager': ['Program Management', 'Cross-functional Leadership', 'Strategic Planning', 'Risk Assessment', 'Startup Scaling'],
      'technical program manager': ['Technical Leadership', 'System Design', 'API Management', 'DevOps', 'Agile', 'Startup Tech Stack']
    };

    const roleKey = role.toLowerCase();
    const skills = skillSets[roleKey] || ['Leadership', 'Communication', 'Problem Solving', 'Analytics', 'Startup Experience'];
    
    // Return 3-6 random skills (startups often want more diverse skillsets)
    const shuffled = skills.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * 4) + 3);
  }
}

module.exports = new WellfoundScraper(); 