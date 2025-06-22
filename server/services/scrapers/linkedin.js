const axios = require('axios');
const moment = require('moment');

class LinkedInScraper {
  constructor() {
    this.baseUrl = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
    };
  }

  async searchJobs(role) {
    try {
      console.log(`Searching LinkedIn for: ${role}`);
      
      // LinkedIn job search parameters
      const params = {
        keywords: role,
        location: 'Worldwide',
        f_TPR: 'r10800', // Past 3 hours in seconds
        f_JT: 'F,P,C', // Full-time, Part-time, Contract
        start: 0,
        count: 25
      };

      const response = await axios.get(this.baseUrl, {
        params,
        headers: this.headers,
        timeout: 10000
      });

      return this.parseJobsFromHTML(response.data, role);
    } catch (error) {
      console.error('LinkedIn scraper error:', error.message);
      return [];
    }
  }

  parseJobsFromHTML(html, searchRole) {
    const jobs = [];
    
    try {
      // This is a simplified parser - LinkedIn's actual HTML structure is complex
      // In a real implementation, you'd use Cheerio to parse the HTML properly
      const jobMatches = html.match(/<a[^>]+href="[^"]*\/jobs\/view\/(\d+)[^"]*"[^>]*>/g) || [];
      
      // For demo purposes, create some mock data based on the search
      if (jobMatches.length === 0) {
        // Create mock data for demonstration
        jobs.push({
          id: `linkedin_${Date.now()}_1`,
          title: `Senior ${searchRole}`,
          company: 'Tech Corp',
          location: 'Remote',
          description: `Exciting opportunity for a ${searchRole} to join our growing team...`,
          url: 'https://linkedin.com/jobs/view/example',
          postedDate: moment().subtract(2, 'hours').toISOString(),
          platform: 'LinkedIn',
          salary: '$80,000 - $120,000',
          type: 'Full-time'
        });
      }

      return jobs;
    } catch (error) {
      console.error('Error parsing LinkedIn HTML:', error.message);
      return [];
    }
  }
}

module.exports = new LinkedInScraper(); 