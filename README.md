# Job Search Application

A comprehensive job search application that searches multiple job platforms for Product Manager, Project Manager, and Business Analyst roles posted within the last 3 hours.

## Features

- **Multi-platform search**: Searches across LinkedIn, Wellfound, Greenhouse, Lever, Workable, SmartRecruiters, Builtin, Notion, and Y Combinator
- **Real-time filtering**: Only shows jobs posted within the last 3 hours
- **Advanced filtering**: Filter by country, location, salary, job type, and platform
- **Smart sorting**: Sort by date, salary, company, location, or platform
- **Modern UI**: Vibrant, responsive React interface with Material-UI components
- **Job details**: View comprehensive job information including salary, location, skills, and descriptions
- **Auto-refresh**: Automatic searches every 15 minutes to keep results fresh
- **Duplicate detection**: Intelligent filtering to remove duplicate job postings
- **Country detection**: Automatic country extraction from job locations
- **Enhanced job cards**: Rich job information with platform-specific styling
- **Performance optimized**: Debounced filtering, memoized calculations, and efficient re-rendering
- **Real-time feedback**: Loading indicators for search and filter operations

## Architecture

### Backend (Node.js/Express)
- **API Server**: RESTful API with job search endpoints
- **Web Scrapers**: Modular scrapers for each job platform
- **Scheduler**: Automated periodic job searches
- **Caching**: Results caching for improved performance

### Frontend (React)
- **Material-UI**: Modern, responsive design components
- **Real-time updates**: Live job search results
- **Interactive filters**: Customizable job role selection
- **Job details modal**: Detailed job information display

## Job Platforms Supported

1. **LinkedIn** - Global professional network
2. **Wellfound** (AngelList) - Startup jobs platform
3. **Greenhouse** - Company-specific job boards (Airbnb, Stripe, etc.)
4. **Lever** - Company-specific job boards (Netflix, Uber, etc.)
5. **Workable** - European tech companies
6. **SmartRecruiters** - Enterprise companies (Visa, SAP, etc.)
7. **Builtin** - Tech jobs by city (NYC, SF, Chicago, etc.)
8. **Notion** - Productivity company careers
9. **Y Combinator** - Startup jobs from YC alumni

## Installation

### Prerequisites
- Node.js 16+ and npm
- Git

### Setup Instructions

1. **Clone and Navigate**
   ```bash
   cd "APP search"
   ```

2. **Install Dependencies**
   ```bash
   npm run install-all
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - React frontend on http://localhost:3000

### Individual Services

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## API Endpoints

### Job Search
- `POST /api/jobs/search` - Search all platforms (supports filtering & sorting)
- `POST /api/jobs/search/:platform` - Search specific platform (supports filtering & sorting)
- `POST /api/jobs/cached` - Get filtered/sorted cached results
- `GET /api/jobs/cached` - Get all cached results (legacy)
- `GET /api/jobs/sites` - Get available job sites
- `GET /api/jobs/countries` - Get available countries
- `GET /api/jobs/platforms` - Get available platforms

### Health Check
- `GET /api/health` - Server health status

## Usage

1. **Start the application** using the installation steps above
2. **Open your browser** to http://localhost:3000
3. **Select job roles** you want to search for (Product Manager, Project Manager, Business Analyst)
4. **Click "Search Jobs"** to find recent postings
5. **Use filters** to narrow results by country, location, salary, job type, or platform
6. **Sort results** by date, salary, company, location, or platform
7. **Browse results** and click on job cards for detailed information
8. **Visit job listings** directly on the original platforms

### Advanced Features
- **Filtering**: Use the collapsible filters section to narrow down results
- **Sorting**: Click on sorting options to organize jobs by your preference
- **Auto-refresh**: The app automatically updates with new jobs every 15 minutes
- **Real-time statistics**: View live stats about filtered vs total jobs

## Configuration

### Search Parameters
- **Time Filter**: Jobs posted within last 3 hours
- **Default Roles**: Product Manager, Project Manager, Business Analyst
- **Search Frequency**: Every 15 minutes (configurable in scheduler.js)
- **Filtering Options**: Country, location, salary, job type, platform
- **Sorting Options**: Date, salary, company, location, platform

### Customization
- Add new job platforms by creating scrapers in `server/services/scrapers/`
- Modify search roles in the frontend component
- Adjust time filters in `jobSearchService.js`

## Technical Details

### Web Scraping
- Uses Axios for HTTP requests and Cheerio for HTML parsing
- Implements rate limiting and error handling
- Falls back to mock data when APIs are unavailable

### Data Processing
- Filters jobs by posting time (last 3 hours)
- Removes duplicates based on title, company, and location
- Caches results for improved performance

### Error Handling
- Graceful fallback for failed platform searches
- Comprehensive error logging
- User-friendly error messages

### Performance Optimizations
- **Debounced location input**: 500ms delay to reduce API calls
- **Memoized calculations**: Expensive operations cached using React.useMemo
- **Optimized filter handling**: Separate loading states for different operations
- **Reduced re-renders**: useCallback hooks prevent unnecessary component updates
- **Efficient job statistics**: Real-time stats calculated only when data changes
- **Smart loading indicators**: Different colors for search vs filter operations

## Development

### Adding New Scrapers
1. Create a new scraper file in `server/services/scrapers/`
2. Implement the required `searchJobs(role)` method
3. Add the scraper to the index file
4. Update the platforms list in the job search service

### Environment Variables
- `PORT`: Server port (default: 5000)
- Add other configuration as needed

## Production Deployment

### Build Frontend
```bash
cd client && npm run build
```

### Start Production Server
```bash
npm start
```

## Limitations

- Some platforms require authentication or have anti-scraping measures
- Rate limiting may affect the number of simultaneous searches
- Mock data is used when real APIs are unavailable
- Search results depend on platform availability

## Future Enhancements

- [ ] Authentication for platforms requiring login
- [ ] Email/Slack notifications for new jobs
- [ ] Advanced filtering (salary, location, company size)
- [ ] Job application tracking
- [ ] Save favorite jobs functionality
- [ ] Resume matching recommendations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
1. Check the console logs for error details
2. Verify all dependencies are installed correctly
3. Ensure ports 3000 and 5000 are available
4. Review the API responses for debugging information 