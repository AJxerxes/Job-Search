const express = require('express');
const router = express.Router();
const jobSearchService = require('../services/jobSearchService');

// Get all available job sites
router.get('/sites', (req, res) => {
  const sites = [
    'Greenhouse', 'Lever', 'Ashby', 'Remote Rocketship', 'Pinpoint',
    'Workable', 'BreezyHR', 'Wellfound', 'SmartRecruiters', 'LinkedIn',
    'Y Combinator', 'Recruitee', 'Rippling', 'JazzHR', 'Jobvite',
    'iCIMS', 'Dover', 'Notion', 'Builtin', 'ADP'
  ];
  res.json({ sites });
});

// Get available countries
router.get('/countries', (req, res) => {
  try {
    const countries = jobSearchService.getAvailableCountries();
    res.json({ countries });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: error.message, countries: [] });
  }
});

// Get available platforms
router.get('/platforms', (req, res) => {
  try {
    const platforms = jobSearchService.getAvailablePlatforms();
    res.json({ platforms });
  } catch (error) {
    console.error('Error fetching platforms:', error);
    res.status(500).json({ error: error.message, platforms: [] });
  }
});

// Search jobs across all platforms
router.post('/search', async (req, res) => {
  try {
    const { 
      roles = ['product manager', 'project manager', 'business analyst'],
      filters = {},
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.body;
    
    console.log('Starting job search for roles:', roles);
    console.log('Filters:', filters);
    console.log('Sort:', { sortBy, sortOrder });
    
    const results = await jobSearchService.searchAllPlatforms(roles);
    
    // Apply filters and sorting to results
    const filteredAndSortedResults = jobSearchService.sortJobs(
      jobSearchService.filterJobs(results, filters),
      sortBy,
      sortOrder
    );
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalJobs: filteredAndSortedResults.length,
      totalJobsBeforeFilter: results.length,
      filters,
      sortBy,
      sortOrder,
      jobs: filteredAndSortedResults
    });
  } catch (error) {
    console.error('Job search error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      jobs: []
    });
  }
});

// Search specific platform
router.post('/search/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const { 
      roles = ['product manager', 'project manager', 'business analyst'],
      filters = {},
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.body;
    
    const results = await jobSearchService.searchPlatform(platform, roles);
    
    // Apply filters and sorting to results
    const filteredAndSortedResults = jobSearchService.sortJobs(
      jobSearchService.filterJobs(results, filters),
      sortBy,
      sortOrder
    );
    
    res.json({
      success: true,
      platform,
      timestamp: new Date().toISOString(),
      totalJobs: filteredAndSortedResults.length,
      totalJobsBeforeFilter: results.length,
      filters,
      sortBy,
      sortOrder,
      jobs: filteredAndSortedResults
    });
  } catch (error) {
    console.error(`${platform} search error:`, error);
    res.status(500).json({
      success: false,
      platform,
      error: error.message,
      jobs: []
    });
  }
});

// Get cached results with filtering and sorting
router.post('/cached', (req, res) => {
  try {
    const { 
      filters = {},
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.body;
    
    const cachedResults = jobSearchService.getCachedResults(filters, sortBy, sortOrder);
    const allCachedResults = jobSearchService.getCachedResults();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalJobs: cachedResults.length,
      totalJobsBeforeFilter: allCachedResults.length,
      filters,
      sortBy,
      sortOrder,
      jobs: cachedResults
    });
  } catch (error) {
    console.error('Error fetching cached results:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      jobs: []
    });
  }
});

// Get cached results (legacy GET endpoint)
router.get('/cached', (req, res) => {
  try {
    const cachedResults = jobSearchService.getCachedResults();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalJobs: cachedResults.length,
      jobs: cachedResults
    });
  } catch (error) {
    console.error('Error fetching cached results:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      jobs: []
    });
  }
});

module.exports = router; 