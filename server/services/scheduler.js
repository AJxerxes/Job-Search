const cron = require('node-cron');
const jobSearchService = require('./jobSearchService');

class Scheduler {
  constructor() {
    this.isRunning = false;
  }

  startPeriodicSearch() {
    console.log('Starting periodic job search scheduler...');
    
    // Run every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      if (this.isRunning) {
        console.log('Previous search still running, skipping...');
        return;
      }

      try {
        this.isRunning = true;
        console.log('Starting scheduled job search...');
        
        const roles = ['product manager', 'project manager', 'business analyst'];
        await jobSearchService.searchAllPlatforms(roles);
        
        console.log('Scheduled job search completed');
      } catch (error) {
        console.error('Scheduled job search failed:', error.message);
      } finally {
        this.isRunning = false;
      }
    });

    // Initial search on startup (delayed by 10 seconds)
    setTimeout(async () => {
      try {
        console.log('Running initial job search...');
        const roles = ['product manager', 'project manager', 'business analyst'];
        await jobSearchService.searchAllPlatforms(roles);
        console.log('Initial job search completed');
      } catch (error) {
        console.error('Initial job search failed:', error.message);
      }
    }, 10000);
  }
}

module.exports = new Scheduler(); 