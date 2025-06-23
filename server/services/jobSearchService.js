const moment = require('moment');
const scrapers = require('./scrapers');

class JobSearchService {
  constructor() {
    this.cachedResults = [];
    this.lastSearchTime = null;
    this.searchInterval = 10 * 60 * 1000; // 10 minutes
  }

  // Filter jobs posted within the last 3 hours
  filterRecentJobs(jobs) {
    const threeHoursAgo = moment().subtract(3, 'hours');
    return jobs.filter(job => {
      if (!job.postedDate) return false;
      
      const jobDate = moment(job.postedDate);
      return jobDate.isAfter(threeHoursAgo);
    });
  }

  // Extract country from location string
  extractCountry(location) {
    if (!location) return 'Unknown';
    
    // Common patterns for extracting country
    const countryPatterns = {
      'United States': ['US', 'USA', 'United States', 'CA', 'NY', 'TX', 'FL', 'WA', 'IL', 'MA', 'GA', 'NC', 'VA', 'NJ', 'PA', 'OH', 'MI', 'TN', 'AZ', 'IN', 'MO', 'MD', 'WI', 'MN', 'CO', 'AL', 'SC', 'LA', 'KY', 'OR', 'OK', 'CT', 'UT', 'IA', 'NV', 'AR', 'MS', 'KS', 'NM', 'NE', 'WV', 'ID', 'HI', 'NH', 'ME', 'MT', 'RI', 'DE', 'SD', 'ND', 'AK', 'VT', 'WY'],
      'United Kingdom': ['UK', 'United Kingdom', 'England', 'Scotland', 'Wales', 'Northern Ireland', 'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Sheffield', 'Bradford', 'Liverpool', 'Edinburgh'],
      'Canada': ['Canada', 'Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton', 'Mississauga', 'Winnipeg', 'Quebec'],
      'Germany': ['Germany', 'Deutschland', 'Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne', 'Stuttgart', 'Düsseldorf'],
      'France': ['France', 'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg'],
      'Netherlands': ['Netherlands', 'Holland', 'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
      'Australia': ['Australia', 'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast'],
      'India': ['India', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'],
      'Singapore': ['Singapore'],
      'Ireland': ['Ireland', 'Dublin', 'Cork', 'Limerick', 'Galway'],
      'Spain': ['Spain', 'España', 'Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao'],
      'Sweden': ['Sweden', 'Stockholm', 'Gothenberg', 'Malmö'],
      'Switzerland': ['Switzerland', 'Zurich', 'Geneva', 'Basel', 'Bern'],
      'Italy': ['Italy', 'Italia', 'Rome', 'Milan', 'Naples', 'Turin', 'Florence'],
      'Japan': ['Japan', 'Tokyo', 'Osaka', 'Kyoto', 'Nagoya', 'Yokohama'],
      'South Korea': ['South Korea', 'Korea', 'Seoul', 'Busan', 'Incheon'],
      'China': ['China', 'Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'],
      'Brazil': ['Brazil', 'São Paulo', 'Rio de Janeiro', 'Brasília'],
      'Mexico': ['Mexico', 'Mexico City', 'Guadalajara', 'Monterrey'],
      'Argentina': ['Argentina', 'Buenos Aires', 'Córdoba', 'Rosario'],
      'Chile': ['Chile', 'Santiago', 'Valparaíso'],
      'Colombia': ['Colombia', 'Bogotá', 'Medellín', 'Cali'],
      'Norway': ['Norway', 'Oslo', 'Bergen', 'Trondheim'],
      'Denmark': ['Denmark', 'Copenhagen', 'Aarhus', 'Odense'],
      'Finland': ['Finland', 'Helsinki', 'Tampere', 'Turku'],
      'Belgium': ['Belgium', 'Brussels', 'Antwerp', 'Ghent'],
      'Austria': ['Austria', 'Vienna', 'Salzburg', 'Innsbruck'],
      'Poland': ['Poland', 'Warsaw', 'Krakow', 'Gdansk'],
      'Czech Republic': ['Czech Republic', 'Prague', 'Brno'],
      'Portugal': ['Portugal', 'Lisbon', 'Porto'],
      'Israel': ['Israel', 'Tel Aviv', 'Jerusalem', 'Haifa'],
      'United Arab Emirates': ['UAE', 'United Arab Emirates', 'Dubai', 'Abu Dhabi'],
      'South Africa': ['South Africa', 'Cape Town', 'Johannesburg', 'Durban'],
      'New Zealand': ['New Zealand', 'Auckland', 'Wellington', 'Christchurch'],
      'Russia': ['Russia', 'Moscow', 'St. Petersburg', 'Novosibirsk'],
      'Turkey': ['Turkey', 'Istanbul', 'Ankara', 'Izmir'],
      'Thailand': ['Thailand', 'Bangkok', 'Chiang Mai'],
      'Vietnam': ['Vietnam', 'Ho Chi Minh City', 'Hanoi'],
      'Philippines': ['Philippines', 'Manila', 'Cebu', 'Davao'],
      'Indonesia': ['Indonesia', 'Jakarta', 'Surabaya', 'Bandung'],
      'Malaysia': ['Malaysia', 'Kuala Lumpur', 'Penang', 'Johor Bahru'],
      'Egypt': ['Egypt', 'Cairo', 'Alexandria'],
      'Nigeria': ['Nigeria', 'Lagos', 'Abuja', 'Kano'],
      'Kenya': ['Kenya', 'Nairobi', 'Mombasa'],
      'Ghana': ['Ghana', 'Accra', 'Kumasi']
    };

    // Check for "Remote" first
    if (location.toLowerCase().includes('remote') || location.toLowerCase().includes('worldwide')) {
      return 'Remote';
    }

    // Find matching country
    for (const [country, patterns] of Object.entries(countryPatterns)) {
      for (const pattern of patterns) {
        if (location.includes(pattern)) {
          return country;
        }
      }
    }

    return 'Other';
  }

  // Get all available countries (static list)
  getAllCountries() {
    return [
      'Remote',
      'United States',
      'United Kingdom', 
      'Canada',
      'Germany',
      'France',
      'Netherlands',
      'Australia',
      'India',
      'Singapore',
      'Ireland',
      'Spain',
      'Sweden',
      'Switzerland',
      'Italy',
      'Japan',
      'South Korea',
      'China',
      'Brazil',
      'Mexico',
      'Argentina',
      'Chile',
      'Colombia',
      'Norway',
      'Denmark',
      'Finland',
      'Belgium',
      'Austria',
      'Poland',
      'Czech Republic',
      'Portugal',
      'Israel',
      'United Arab Emirates',
      'South Africa',
      'New Zealand',
      'Russia',
      'Turkey',
      'Thailand',
      'Vietnam',
      'Philippines',
      'Indonesia',
      'Malaysia',
      'Egypt',
      'Nigeria',
      'Kenya',
      'Ghana',
      'Other'
    ];
  }

  // Parse salary from string to numeric value for sorting
  parseSalary(salaryString) {
    if (!salaryString) return 0;
    
    // Extract numbers from salary string
    const numbers = salaryString.match(/[\d,]+/g);
    if (!numbers) return 0;
    
    // Take the first number (usually minimum salary)
    const salary = parseInt(numbers[0].replace(/,/g, ''), 10);
    
    // Convert to USD if needed (basic conversion)
    if (salaryString.includes('€')) {
      return salary * 1.1; // Rough EUR to USD conversion
    } else if (salaryString.includes('£')) {
      return salary * 1.25; // Rough GBP to USD conversion
    }
    
    return salary;
  }

  // Filter jobs based on criteria
  filterJobs(jobs, filters) {
    let filteredJobs = [...jobs];

    // Filter by country
    if (filters.country && filters.country !== 'all') {
      filteredJobs = filteredJobs.filter(job => 
        this.extractCountry(job.location) === filters.country
      );
    }

    // Filter by location (city/state level)
    if (filters.location && filters.location.trim()) {
      const locationFilter = filters.location.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.location && job.location.toLowerCase().includes(locationFilter)
      );
    }

    // Filter by minimum salary
    if (filters.minSalary && filters.minSalary > 0) {
      filteredJobs = filteredJobs.filter(job => {
        const salary = this.parseSalary(job.salary);
        return salary >= filters.minSalary;
      });
    }

    // Filter by job type
    if (filters.jobType && filters.jobType !== 'all') {
      filteredJobs = filteredJobs.filter(job => 
        job.type && job.type.toLowerCase().includes(filters.jobType.toLowerCase())
      );
    }

    // Filter by platform
    if (filters.platform && filters.platform !== 'all') {
      filteredJobs = filteredJobs.filter(job => 
        job.platform === filters.platform
      );
    }

    return filteredJobs;
  }

  // Sort jobs based on criteria
  sortJobs(jobs, sortBy, sortOrder = 'desc') {
    const sortedJobs = [...jobs];

    switch (sortBy) {
      case 'date':
        sortedJobs.sort((a, b) => {
          const dateA = moment(a.postedDate);
          const dateB = moment(b.postedDate);
          
          // Ensure valid dates - invalid dates go to the end
          if (!dateA.isValid() && !dateB.isValid()) return 0;
          if (!dateA.isValid()) return 1; // A goes to end
          if (!dateB.isValid()) return -1; // B goes to end
          
          // Compare timestamps for valid dates
          const timestampA = dateA.valueOf();
          const timestampB = dateB.valueOf();
          
          if (sortOrder === 'desc') {
            // Most recent first (newest to oldest)
            return timestampB - timestampA;
          } else {
            // Oldest first
            return timestampA - timestampB;
          }
        });
        break;

      case 'salary':
        sortedJobs.sort((a, b) => {
          const salaryA = this.parseSalary(a.salary);
          const salaryB = this.parseSalary(b.salary);
          return sortOrder === 'desc' ? salaryB - salaryA : salaryA - salaryB;
        });
        break;

      case 'company':
        sortedJobs.sort((a, b) => {
          const companyA = (a.company || '').toLowerCase();
          const companyB = (b.company || '').toLowerCase();
          return sortOrder === 'desc' ? companyB.localeCompare(companyA) : companyA.localeCompare(companyB);
        });
        break;

      case 'location':
        sortedJobs.sort((a, b) => {
          const locationA = (a.location || '').toLowerCase();
          const locationB = (b.location || '').toLowerCase();
          return sortOrder === 'desc' ? locationB.localeCompare(locationA) : locationA.localeCompare(locationB);
        });
        break;

      case 'platform':
        sortedJobs.sort((a, b) => {
          const platformA = (a.platform || '').toLowerCase();
          const platformB = (b.platform || '').toLowerCase();
          return sortOrder === 'desc' ? platformB.localeCompare(platformA) : platformA.localeCompare(platformB);
        });
        break;

      default:
        // Default sort by date (newest first) - improved logic
        sortedJobs.sort((a, b) => {
          const dateA = moment(a.postedDate);
          const dateB = moment(b.postedDate);
          
          // Handle invalid dates
          if (!dateA.isValid() && !dateB.isValid()) return 0;
          if (!dateA.isValid()) return 1; // A goes to end
          if (!dateB.isValid()) return -1; // B goes to end
          
          // Most recent first (newest to oldest)
          return dateB.valueOf() - dateA.valueOf();
        });
    }

    return sortedJobs;
  }

  // Search all platforms
  async searchAllPlatforms(roles) {
    const results = [];
    const platforms = [
      'linkedin', 'wellfound', 'greenhouse', 'lever', 'workable', 
      'smartrecruiters', 'builtin', 'notion', 'ycombinator', 'workday'
    ];

    console.log(`Searching ${platforms.length} platforms for roles:`, roles);

    // Search platforms in parallel with controlled concurrency
    const searchPromises = platforms.map(async (platform) => {
      try {
        console.log(`Searching ${platform}...`);
        const platformResults = await this.searchPlatform(platform, roles);
        console.log(`Found ${platformResults.length} jobs on ${platform}`);
        return platformResults;
      } catch (error) {
        console.error(`Error searching ${platform}:`, error.message);
        return [];
      }
    });

    const platformResults = await Promise.allSettled(searchPromises);
    
    // Combine all results
    platformResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(...result.value);
      } else {
        console.error(`Platform ${platforms[index]} failed:`, result.reason);
      }
    });

    // Filter for recent jobs (past 3 hours)
    const recentJobs = this.filterRecentJobs(results);
    
    // Remove duplicates based on title and company
    const uniqueJobs = this.removeDuplicates(recentJobs);
    
    // Enhance jobs with country information
    const enhancedJobs = uniqueJobs.map(job => ({
      ...job,
      country: this.extractCountry(job.location),
      salaryNumeric: this.parseSalary(job.salary)
    }));
    
    // Update cache
    this.cachedResults = enhancedJobs;
    this.lastSearchTime = new Date();

    console.log(`Total unique recent jobs found: ${enhancedJobs.length}`);
    return enhancedJobs;
  }

  // Search specific platform
  async searchPlatform(platform, roles) {
    const scraper = scrapers[platform];
    if (!scraper) {
      throw new Error(`Scraper not implemented for platform: ${platform}`);
    }

    const allJobs = [];
    
    // Search for each role
    for (const role of roles) {
      try {
        const jobs = await scraper.searchJobs(role);
        allJobs.push(...jobs);
      } catch (error) {
        console.error(`Error searching ${role} on ${platform}:`, error.message);
      }
    }

    return allJobs;
  }

  // Remove duplicate jobs
  removeDuplicates(jobs) {
    const seen = new Set();
    return jobs.filter(job => {
      const key = `${job.title}-${job.company}-${job.location}`.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Get available countries
  getAvailableCountries() {
    // Return static list of countries instead of dynamic extraction
    return this.getAllCountries();
  }

  // Get available platforms
  getAvailablePlatforms() {
    return ['LinkedIn', 'Wellfound', 'Greenhouse', 'Lever', 'Workable', 'SmartRecruiters', 'Builtin', 'Notion', 'Y Combinator', 'Workday'];
  }

  // Get cached results with optional filtering and sorting
  getCachedResults(filters = {}, sortBy = 'date', sortOrder = 'desc') {
    let results = [...this.cachedResults];
    
    // Apply filters
    results = this.filterJobs(results, filters);
    
    // Apply sorting
    results = this.sortJobs(results, sortBy, sortOrder);
    
    return results;
  }

  // Check if cache is fresh
  isCacheFresh() {
    if (!this.lastSearchTime) return false;
    const now = new Date();
    const timeDiff = now - this.lastSearchTime;
    return timeDiff < this.searchInterval;
  }
}

module.exports = new JobSearchService(); 