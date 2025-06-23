import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Box,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Launch as LaunchIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Clear as ClearIcon,
  SwapVert as SwapVertIcon
} from '@mui/icons-material';
import moment from 'moment';
import axios from 'axios';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const defaultRoles = ['product manager', 'project manager', 'business analyst'];

function JobSearchApp() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRoles, setSelectedRoles] = useState(defaultRoles);
  const [availableSites, setAvailableSites] = useState([]);
  const [lastSearchTime, setLastSearchTime] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    country: 'all',
    location: '',
    minSalary: 0,
    jobType: 'all',
    platform: 'all'
  });
  
  // Sorting states
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Available options for filters
  const [availableCountries, setAvailableCountries] = useState([
    'Remote', 'United States', 'United Kingdom', 'Canada', 'Germany', 'France', 
    'Netherlands', 'Australia', 'India', 'Singapore', 'Ireland', 'Spain', 
    'Sweden', 'Switzerland', 'Italy', 'Japan', 'South Korea', 'China', 'Brazil', 
    'Mexico', 'Argentina', 'Chile', 'Colombia', 'Norway', 'Denmark', 'Finland', 
    'Belgium', 'Austria', 'Poland', 'Czech Republic', 'Portugal', 'Israel', 
    'United Arab Emirates', 'South Africa', 'New Zealand', 'Russia', 'Turkey', 
    'Thailand', 'Vietnam', 'Philippines', 'Indonesia', 'Malaysia', 'Egypt', 
    'Nigeria', 'Kenya', 'Ghana', 'Other'
  ]);
  const [availablePlatforms, setAvailablePlatforms] = useState([
    'LinkedIn', 'Wellfound', 'Greenhouse', 'Lever', 'Workable', 'SmartRecruiters', 
    'Builtin', 'Notion', 'Y Combinator', 'Workday'
  ]);
  
  // UI states
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [totalJobsBeforeFilter, setTotalJobsBeforeFilter] = useState(0);
  const [filterLoading, setFilterLoading] = useState(false);
  
  // Debouncing states
  const [locationDebounced, setLocationDebounced] = useState('');

  useEffect(() => {
    fetchAvailableSites();
    fetchAvailableCountries();
    fetchAvailablePlatforms();
    loadCachedResults();
    
    // Debug logging
    console.log('JobSearchApp initialized');
  }, []);

  // Auto-refresh every 15 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !filterLoading) {
        loadCachedResults();
      }
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, [loading, filterLoading]);

  // Debounce location input
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocationDebounced(filters.location);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.location]);

  // Apply filters when debounced location changes
  useEffect(() => {
    if (locationDebounced !== filters.location) {
      return; // Skip if debounced value doesn't match current
    }
    
    if (jobs.length > 0) {
      debouncedApplyFilters();
    }
  }, [locationDebounced, filters.country, filters.jobType, filters.platform, filters.minSalary]);

  const fetchAvailableSites = async () => {
    try {
      const response = await axios.get('/api/jobs/sites');
      setAvailableSites(response.data.sites);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const fetchAvailableCountries = async () => {
    try {
      console.log('Fetching available countries...');
      const response = await axios.get('/api/jobs/countries');
      console.log('Countries response:', response.data);
      if (response.data.countries && response.data.countries.length > 0) {
        setAvailableCountries(response.data.countries);
        console.log('Updated available countries:', response.data.countries);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      console.log('Using fallback countries list');
      // Keep the default fallback countries list
    }
  };

  const fetchAvailablePlatforms = async () => {
    try {
      const response = await axios.get('/api/jobs/platforms');
      if (response.data.platforms && response.data.platforms.length > 0) {
        setAvailablePlatforms(response.data.platforms);
      }
    } catch (error) {
      console.error('Error fetching platforms:', error);
      // Keep the default fallback platforms list
    }
  };

  const loadCachedResults = async () => {
    try {
      const response = await axios.post('/api/jobs/cached', {
        filters,
        sortBy,
        sortOrder
      });
      if (response.data.success) {
        setJobs(response.data.jobs);
        setTotalJobsBeforeFilter(response.data.totalJobsBeforeFilter || response.data.jobs.length);
        if (response.data.jobs.length > 0) {
          setLastSearchTime(response.data.timestamp);
        }
        // Update available options
        fetchAvailableCountries();
        fetchAvailablePlatforms();
      }
    } catch (error) {
      console.error('Error loading cached results:', error);
      // Fallback to legacy endpoint
      try {
        const fallbackResponse = await axios.get('/api/jobs/cached');
        if (fallbackResponse.data.success) {
          setJobs(fallbackResponse.data.jobs);
          setTotalJobsBeforeFilter(fallbackResponse.data.jobs.length);
          if (fallbackResponse.data.jobs.length > 0) {
            setLastSearchTime(fallbackResponse.data.timestamp);
          }
        }
      } catch (fallbackError) {
        console.error('Error with fallback cached results:', fallbackError);
      }
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Starting search with:', { roles: selectedRoles, filters, sortBy, sortOrder });
      const response = await axios.post('/api/jobs/search', {
        roles: selectedRoles,
        filters,
        sortBy,
        sortOrder
      });

      if (response.data.success) {
        console.log('Search completed. Jobs found:', response.data.jobs.length);
        console.log('First few jobs dates:', response.data.jobs.slice(0, 3).map(job => ({ 
          title: job.title, 
          date: job.postedDate,
          dateFormatted: moment(job.postedDate).format('MMM DD, HH:mm')
        })));
        
        setJobs(response.data.jobs);
        setTotalJobsBeforeFilter(response.data.totalJobsBeforeFilter || response.data.jobs.length);
        setLastSearchTime(response.data.timestamp);
        setSuccess(`Found ${response.data.totalJobs} recent jobs!`);
        
        // Update available options after search
        fetchAvailableCountries();
        fetchAvailablePlatforms();
      } else {
        setError(response.data.error || 'Search failed');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = useCallback((event) => {
    const value = event.target.value;
    setSelectedRoles(typeof value === 'string' ? value.split(',') : value);
  }, []);

  // Memoized filter application
  const debouncedApplyFilters = useCallback(async () => {
    if (filterLoading) return;
    
    setFilterLoading(true);
    try {
      const currentFilters = { ...filters, location: locationDebounced };
      const response = await axios.post('/api/jobs/cached', {
        filters: currentFilters,
        sortBy,
        sortOrder
      });

      if (response.data.success) {
        setJobs(response.data.jobs);
        setTotalJobsBeforeFilter(response.data.totalJobsBeforeFilter || response.data.jobs.length);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setFilterLoading(false);
    }
  }, [filters, locationDebounced, sortBy, sortOrder, filterLoading]);

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    
    // For non-location filters, apply immediately
    if (filterName !== 'location' && jobs.length > 0) {
      const newFilters = { ...filters, [filterName]: value };
      applyFiltersAndSort(newFilters, sortBy, sortOrder);
    }
  }, [filters, sortBy, sortOrder, jobs.length]);

  const handleSortChange = useCallback((newSortBy, newSortOrder = sortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    
    // Apply sorting to current results
    if (jobs.length > 0) {
      applyFiltersAndSort(filters, newSortBy, newSortOrder);
    }
  }, [filters, sortOrder, jobs.length]);

  const applyFiltersAndSort = useCallback(async (currentFilters, currentSortBy, currentSortOrder) => {
    if (filterLoading) return;
    
    setFilterLoading(true);
    try {
      const response = await axios.post('/api/jobs/cached', {
        filters: currentFilters,
        sortBy: currentSortBy,
        sortOrder: currentSortOrder
      });

      if (response.data.success) {
        setJobs(response.data.jobs);
        setTotalJobsBeforeFilter(response.data.totalJobsBeforeFilter || response.data.jobs.length);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setFilterLoading(false);
    }
  }, [filterLoading]);

  const clearFilters = useCallback(() => {
    const defaultFilters = {
      country: 'all',
      location: '',
      minSalary: 0,
      jobType: 'all',
      platform: 'all'
    };
    setFilters(defaultFilters);
    setLocationDebounced('');
    if (jobs.length > 0) {
      applyFiltersAndSort(defaultFilters, sortBy, sortOrder);
    }
  }, [sortBy, sortOrder, jobs.length, applyFiltersAndSort]);

  const toggleSortOrder = useCallback(() => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    handleSortChange(sortBy, newOrder);
  }, [sortBy, sortOrder, handleSortChange]);

  const openJobDialog = useCallback((job) => {
    setSelectedJob(job);
    setDialogOpen(true);
  }, []);

  const closeJobDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedJob(null);
  }, []);

  const getPlatformColor = (platform) => {
    const colors = {
      'LinkedIn': 'primary',
      'Wellfound': 'secondary',
      'Greenhouse': 'success',
      'Lever': 'warning',
      'Workable': 'info',
      'SmartRecruiters': 'error',
      'Builtin': 'default',
      'Notion': 'primary',
      'Y Combinator': 'secondary'
    };
    return colors[platform] || 'default';
  };

  // Memoized filter checks
  const hasActiveFilters = useMemo(() => {
    return filters.country !== 'all' || 
           filters.location !== '' || 
           filters.minSalary > 0 || 
           filters.jobType !== 'all' || 
           filters.platform !== 'all';
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.country !== 'all') count++;
    if (filters.location !== '') count++;
    if (filters.minSalary > 0) count++;
    if (filters.jobType !== 'all') count++;
    if (filters.platform !== 'all') count++;
    return count;
  }, [filters]);

  // Memoized job statistics
  const jobStats = useMemo(() => {
    const platforms = [...new Set(jobs.map(job => job.platform))];
    const companies = [...new Set(jobs.map(job => job.company))];
    const countries = [...new Set(jobs.map(job => job.country || 'Unknown'))];
    const oneHourAgo = moment().subtract(1, 'hour');
    const recentJobs = jobs.filter(job => 
      moment(job.postedDate).isAfter(oneHourAgo)
    );

    return {
      totalJobs: jobs.length,
      totalBeforeFilter: totalJobsBeforeFilter,
      platforms: platforms.length,
      companies: companies.length,
      countries: countries.length,
      recentJobs: recentJobs.length,
      filtered: hasActiveFilters
    };
  }, [jobs, totalJobsBeforeFilter, hasActiveFilters]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box className="search-header" sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
          🚀 Job Search Dashboard
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
          Search for Product Manager, Project Manager & Business Analyst roles posted in the last 3 hours
        </Typography>

        {/* Search Controls */}
        <div className="search-controls">
          <div className="role-selector-group">
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'white', 
                fontWeight: 600, 
                mb: 2, 
                textAlign: 'left',
                fontSize: '1rem',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                letterSpacing: '0.5px'
              }}
            >
              Job Roles
            </Typography>
            <FormControl className="role-selector">
              <Select
                multiple
                value={selectedRoles}
                onChange={handleRoleChange}
                renderValue={(selected) => selected.join(', ')}
                MenuProps={MenuProps}
                displayEmpty
              >
                {['product manager', 'project manager', 'business analyst', 'program manager', 'technical program manager'].map((role) => (
                  <MenuItem key={role} value={role}>
                    <Checkbox checked={selectedRoles.indexOf(role) > -1} />
                    <ListItemText primary={role} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          
          <div className="search-button-group">
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'transparent', 
                fontWeight: 600, 
                mb: 2, 
                fontSize: '1rem',
                userSelect: 'none'
              }}
            >
              Action
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleSearch}
              disabled={loading || filterLoading}
              startIcon={(loading || filterLoading) ? <RefreshIcon /> : <SearchIcon />}
              className="search-button"
            >
              {loading ? 'Searching...' : filterLoading ? 'Filtering...' : 'Search Jobs'}
            </Button>
          </div>
        </div>

        {lastSearchTime && (
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 2 }}>
            Last updated: {moment(lastSearchTime).format('MMM DD, YYYY - HH:mm')} • Auto-refreshes every 15 minutes
          </Typography>
        )}
      </Box>

      {/* Filters and Sorting Section */}
      <Box className="filters-section">
        <Accordion 
          expanded={filtersExpanded} 
          onChange={(e, isExpanded) => setFiltersExpanded(isExpanded)}
          sx={{ background: 'transparent', boxShadow: 'none' }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
            sx={{ color: 'white' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterListIcon />
              <Typography variant="h6">
                Filters & Sorting
                {hasActiveFilters && (
                  <Chip 
                    label={`${activeFilterCount} active`}
                    size="small"
                    className="filter-chip"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
            </Box>
          </AccordionSummary>
          
          <AccordionDetails>
            {/* Filter Controls */}
            <Box className="filter-controls">
              <div className="filter-group">
                <Typography className="filter-label">
                  Country
                </Typography>
                <FormControl size="small">
                  <Select
                    value={filters.country}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="all">All Countries</MenuItem>
                    {availableCountries.map((country) => (
                      <MenuItem key={country} value={country}>{country}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <div className="filter-group">
                <Typography className="filter-label">
                  Location
                </Typography>
                <TextField
                  size="small"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="City, State..."
                />
              </div>

              <div className="filter-group">
                <Typography className="filter-label">
                  Job Type
                </Typography>
                <FormControl size="small">
                  <Select
                    value={filters.jobType}
                    onChange={(e) => handleFilterChange('jobType', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="full-time">Full-time</MenuItem>
                    <MenuItem value="part-time">Part-time</MenuItem>
                    <MenuItem value="contract">Contract</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div className="filter-group">
                <Typography className="filter-label">
                  Platform
                </Typography>
                <FormControl size="small">
                  <Select
                    value={filters.platform}
                    onChange={(e) => handleFilterChange('platform', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="all">All Platforms</MenuItem>
                    {availablePlatforms.map((platform) => (
                      <MenuItem key={platform} value={platform}>{platform}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <div className="filter-group" style={{ minWidth: '200px' }}>
                <Typography className="filter-label">
                  Min Salary: ${filters.minSalary.toLocaleString()}
                </Typography>
                <Box sx={{ px: 1, py: 2, background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <Slider
                    value={filters.minSalary}
                    onChange={(e, value) => handleFilterChange('minSalary', value)}
                    min={0}
                    max={300000}
                    step={10000}
                    sx={{ color: 'white' }}
                  />
                </Box>
              </div>

              {hasActiveFilters && (
                <div className="filter-group">
                  <Typography className="filter-label" style={{ opacity: 0 }}>
                    Actions
                  </Typography>
                  <Button
                    onClick={clearFilters}
                    startIcon={<ClearIcon />}
                    className="clear-filters-btn"
                    size="small"
                    fullWidth
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </Box>

            {/* Sorting Controls */}
            <Box className="sorting-controls">
              <div className="sort-section">
                <Typography className="sort-label">
                  <SortIcon />
                  Sort Jobs By
                </Typography>
                
                <div className="sort-controls-row">
                  <FormControl size="small">
                    <Select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="date">Date Posted</MenuItem>
                      <MenuItem value="salary">Salary</MenuItem>
                      <MenuItem value="company">Company</MenuItem>
                      <MenuItem value="location">Location</MenuItem>
                      <MenuItem value="platform">Platform</MenuItem>
                    </Select>
                  </FormControl>

                  <Tooltip title={`Sort ${sortOrder === 'desc' ? 'Ascending' : 'Descending'}`}>
                    <IconButton 
                      onClick={toggleSortOrder}
                      sx={{ 
                        color: 'white',
                        background: 'rgba(255,255,255,0.1)',
                        '&:hover': { background: 'rgba(255,255,255,0.2)' },
                        border: '1px solid rgba(255,255,255,0.3)'
                      }}
                      size="small"
                    >
                      <SwapVertIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    {sortBy === 'date' 
                      ? (sortOrder === 'desc' ? 'Newest First' : 'Oldest First')
                      : (sortOrder === 'desc' ? 'High to Low' : 'Low to High')
                    }
                  </Typography>
                </div>
              </div>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Loading Progress */}
      {(loading || filterLoading) && (
        <LinearProgress 
          sx={{ 
            mb: 2,
            '& .MuiLinearProgress-bar': {
              background: filterLoading 
                ? 'linear-gradient(45deg, #FF9800, #F57C00)' 
                : 'linear-gradient(45deg, #667eea, #764ba2)'
            }
          }} 
        />
      )}

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Enhanced Job Statistics inspired by Remote Rocketship */}
      {jobs.length > 0 && (
        <Card className="job-stats">
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}>
                🚀 Job Discovery Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Real-time insights from our enhanced job search platform
              </Typography>
            </Box>
            
            <Grid container spacing={2} textAlign="center">
              <Grid item xs={6} md={2} className="stat-item">
                <div className="stat-value">{jobStats.totalJobs}</div>
                <div className="stat-label">
                  {jobStats.filtered ? 'Filtered Jobs' : 'Total Jobs'}
                </div>
              </Grid>
              {jobStats.filtered && (
                <Grid item xs={6} md={2} className="stat-item">
                  <div className="stat-value" style={{ color: '#9E9E9E' }}>{jobStats.totalBeforeFilter}</div>
                  <div className="stat-label">Before Filter</div>
                </Grid>
              )}
              <Grid item xs={6} md={2} className="stat-item">
                <div className="stat-value" style={{ color: '#FF9800' }}>{jobStats.platforms}</div>
                <div className="stat-label">Platforms</div>
              </Grid>
              <Grid item xs={6} md={2} className="stat-item">
                <div className="stat-value" style={{ color: '#4CAF50' }}>{jobStats.companies}</div>
                <div className="stat-label">Companies</div>
              </Grid>
              <Grid item xs={6} md={2} className="stat-item">
                <div className="stat-value" style={{ color: '#2196F3' }}>{jobStats.countries}</div>
                <div className="stat-label">Countries</div>
              </Grid>
              <Grid item xs={6} md={2} className="stat-item">
                <div className="stat-value" style={{ color: '#E91E63' }}>{jobStats.recentJobs}</div>
                <div className="stat-label">Last Hour</div>
              </Grid>
            </Grid>

            {/* Premium Features Preview */}
            <Box sx={{ 
              mt: 3, 
              pt: 3, 
              borderTop: '1px solid rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
              borderRadius: '12px',
              p: 2
            }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    ✨ Enhanced with Remote Rocketship Features
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip label="💰 Funding Info" size="small" className="funding-badge" />
                    <Chip label="🦅 H1B Indicators" size="small" className="h1b-indicator" />
                    <Chip label="🏢 Company Insights" size="small" sx={{ 
                      background: 'linear-gradient(45deg, #9C27B0, #7B1FA2)',
                      color: 'white',
                      fontWeight: 500
                    }} />
                    <Chip label="📊 Tech Stack Tags" size="small" sx={{ 
                      background: 'linear-gradient(45deg, #FF5722, #D84315)',
                      color: 'white',
                      fontWeight: 500
                    }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Advanced job metadata • Real-time updates • Enhanced filtering • Company profiles
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ 
                    color: '#4CAF50',
                    fontWeight: 600,
                    display: 'block',
                    mb: 1
                  }}>
                    🎉 FREE TIER ACTIVE
                  </Typography>
                  <Button 
                    variant="contained"
                    size="small"
                    sx={{
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '20px',
                      px: 3
                    }}
                    onClick={() => window.open('https://github.com/AJxerxes/Job-Search', '_blank')}
                  >
                    View on GitHub ⭐
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Job Results */}
      <Grid container spacing={3}>
        {jobs.map((job) => (
          <Grid item xs={12} md={6} lg={4} key={job.id}>
            <Card 
              className="job-card job-card-enhanced" 
              onClick={() => openJobDialog(job)}
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                {/* Header with time and platform */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ 
                      color: '#4CAF50', 
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}>
                      {moment(job.postedDate).fromNow().replace(' ago', '')} ago
                    </Typography>
                    {job.h1bSponsorship && (
                      <Chip 
                        label="🦅 H1B" 
                        size="small"
                        sx={{ 
                          fontSize: '0.65rem', 
                          height: 20,
                          background: 'linear-gradient(45deg, #FF9800, #F57C00)',
                          color: 'white',
                          fontWeight: 500
                        }}
                      />
                    )}
                  </Box>
                  <Chip 
                    label={job.platform} 
                    className={`platform-chip ${job.platform.toLowerCase().replace(' ', '')}`}
                    size="small"
                  />
                </Box>

                {/* Job Title */}
                <Typography variant="h6" component="h2" sx={{ 
                  flexGrow: 1, 
                  mr: 1, 
                  fontWeight: 600,
                  mb: 2,
                  lineHeight: 1.3
                }}>
                  {job.title}
                </Typography>

                {/* Company with metadata */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                  <WorkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {job.company}
                  </Typography>
                  {job.companySize && (
                    <Chip 
                      label={job.companySize}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.65rem', height: 20 }}
                    />
                  )}
                  {job.industryTags && job.industryTags.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {job.industryTags.slice(0, 2).map((tag, index) => (
                        <span key={index} style={{
                          background: 'linear-gradient(45deg, #E3F2FD, #BBDEFB)',
                          color: '#1565C0',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '0.65rem',
                          fontWeight: 500
                        }}>
                          {tag}
                        </span>
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Funding information */}
                {job.funding && (
                  <Box sx={{ mb: 1 }}>
                    <Chip 
                      label={`💰 ${job.funding}`}
                      size="small"
                      sx={{ 
                        background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 500
                      }}
                    />
                  </Box>
                )}

                {/* Location with country */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
                  <LocationIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {job.location}
                  </Typography>
                  {job.country && job.country !== 'Unknown' && (
                    <span className="country-chip">{job.country}</span>
                  )}
                </Box>

                {/* Time and job type */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {moment(job.postedDate).format('MMM DD, HH:mm')}
                  </Typography>
                  {job.type && (
                    <span className="location-chip">{job.type}</span>
                  )}
                  {job.experienceLevel && (
                    <Chip 
                      label={job.experienceLevel}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.65rem', height: 20 }}
                    />
                  )}
                </Box>

                {/* Enhanced salary display */}
                {job.salary && (
                  <Box sx={{ mb: 2 }}>
                    <span className="salary-highlight">
                      💵 {job.salary}
                    </span>
                  </Box>
                )}

                {/* Job description */}
                <Typography variant="body2" className="job-description" sx={{ mb: 2 }}>
                  {job.description?.substring(0, 120)}...
                </Typography>

                {/* Enhanced skills with tech stack styling */}
                {(job.skills && job.skills.length > 0) && (
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {job.skills.slice(0, 4).map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        size="small"
                        sx={{ 
                          fontSize: '0.7rem', 
                          height: 22,
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          color: 'white',
                          fontWeight: 500,
                          '&:hover': {
                            background: 'linear-gradient(45deg, #764ba2, #667eea)'
                          }
                        }}
                      />
                    ))}
                    {job.skills.length > 4 && (
                      <Chip
                        label={`+${job.skills.length - 4} more`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                    )}
                  </Box>
                )}
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  size="small" 
                  href={job.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  startIcon={<LaunchIcon />}
                  onClick={(e) => e.stopPropagation()}
                  variant="contained"
                  sx={{ 
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    '&:hover': { background: 'linear-gradient(45deg, #764ba2, #667eea)' },
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Apply
                </Button>
                <Button 
                  size="small"
                  variant="outlined"
                  onClick={(e) => e.stopPropagation()}
                  sx={{ 
                    textTransform: 'none',
                    borderColor: '#667eea',
                    color: '#667eea',
                    '&:hover': {
                      borderColor: '#764ba2',
                      color: '#764ba2',
                      background: 'rgba(102, 126, 234, 0.04)'
                    }
                  }}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {jobs.length === 0 && !loading && !filterLoading && (
        <Box className="no-jobs-container">
          <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
            {hasActiveFilters ? 'No jobs match your filters' : 'No recent jobs found'}
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
            {hasActiveFilters 
              ? 'Try adjusting your filters or search for new jobs'
              : 'Click "Search Jobs" to find the latest job postings from the past 3 hours'
            }
          </Typography>
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              startIcon={<ClearIcon />}
              className="clear-filters-btn"
              sx={{ mt: 2 }}
            >
              Clear All Filters
            </Button>
          )}
        </Box>
      )}

      {/* Enhanced Job Detail Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={closeJobDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedJob && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {selectedJob.title}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    <Chip 
                      label={selectedJob.platform} 
                      className={`platform-chip ${selectedJob.platform.toLowerCase().replace(' ', '')}`}
                      size="small"
                    />
                    {selectedJob.h1bSponsorship && (
                      <Chip label="🦅 H1B Sponsor" size="small" className="h1b-indicator" />
                    )}
                    {selectedJob.experienceLevel && (
                      <Chip 
                        label={selectedJob.experienceLevel}
                        size="small"
                        className="experience-chip"
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                {/* Company Information Section */}
                <Grid item xs={12}>
                  <Box sx={{ 
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
                    borderRadius: '12px',
                    p: 2,
                    mb: 2
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      🏢 Company Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Company"
                          value={selectedJob.company}
                          fullWidth
                          InputProps={{ readOnly: true }}
                          size="small"
                        />
                      </Grid>
                      {selectedJob.companySize && (
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Company Size"
                            value={selectedJob.companySize}
                            fullWidth
                            InputProps={{ readOnly: true }}
                            size="small"
                          />
                        </Grid>
                      )}
                      {selectedJob.funding && (
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Funding"
                            value={selectedJob.funding}
                            fullWidth
                            InputProps={{ readOnly: true }}
                            size="small"
                          />
                        </Grid>
                      )}
                      {selectedJob.industryTags && selectedJob.industryTags.length > 0 && (
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Industry
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                              {selectedJob.industryTags.map((tag, index) => (
                                <Chip
                                  key={index}
                                  label={tag}
                                  size="small"
                                  className="industry-tag"
                                />
                              ))}
                            </Box>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Grid>

                {/* Job Details Section */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Location"
                    value={selectedJob.location}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    margin="normal"
                    size="small"
                  />
                </Grid>
                {selectedJob.country && selectedJob.country !== 'Unknown' && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Country"
                      value={selectedJob.country}
                      fullWidth
                      InputProps={{ readOnly: true }}
                      margin="normal"
                      size="small"
                    />
                  </Grid>
                )}
                {selectedJob.salary && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Salary"
                      value={selectedJob.salary}
                      fullWidth
                      InputProps={{ readOnly: true }}
                      margin="normal"
                      size="small"
                    />
                  </Grid>
                )}
                {selectedJob.type && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Job Type"
                      value={selectedJob.type}
                      fullWidth
                      InputProps={{ readOnly: true }}
                      margin="normal"
                      size="small"
                    />
                  </Grid>
                )}
                {selectedJob.equity && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Equity"
                      value="Yes - Equity Package Included"
                      fullWidth
                      InputProps={{ readOnly: true }}
                      margin="normal"
                      size="small"
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    label="Posted"
                    value={`${moment(selectedJob.postedDate).format('MMMM DD, YYYY - HH:mm')} (${moment(selectedJob.postedDate).fromNow()})`}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    margin="normal"
                    size="small"
                  />
                </Grid>

                {/* Skills and Benefits */}
                {selectedJob.skills && selectedJob.skills.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        💻 Required Skills
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedJob.skills.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            className="skill-tag"
                          />
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                )}

                {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        🎁 Benefits
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedJob.benefits.slice(0, 6).map((benefit, index) => (
                          <Chip
                            key={index}
                            label={benefit}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              borderColor: '#667eea',
                              color: '#667eea',
                              '&:hover': { background: 'rgba(102, 126, 234, 0.1)' }
                            }}
                          />
                        ))}
                        {selectedJob.benefits.length > 6 && (
                          <Chip
                            label={`+${selectedJob.benefits.length - 6} more`}
                            size="small"
                            variant="outlined"
                            sx={{ borderColor: '#9E9E9E', color: '#9E9E9E' }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Grid>
                )}

                {/* Job Description */}
                <Grid item xs={12}>
                  <TextField
                    label="📋 Job Description"
                    value={selectedJob.description || 'No description available'}
                    fullWidth
                    multiline
                    rows={4}
                    InputProps={{ readOnly: true }}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 2 }}>
              <Button 
                onClick={closeJobDialog}
                variant="outlined"
                sx={{ borderRadius: '12px', textTransform: 'none' }}
              >
                Close
              </Button>
              <Button 
                variant="contained"
                href={selectedJob.url} 
                target="_blank" 
                rel="noopener noreferrer"
                startIcon={<LaunchIcon />}
                className="enhanced-apply-btn"
              >
                Apply on {selectedJob.platform}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}

export default JobSearchApp; 