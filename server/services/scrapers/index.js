const linkedinScraper = require('./linkedin');
const wellfoundScraper = require('./wellfound');
const greenhouseScraper = require('./greenhouse');
const leverScraper = require('./lever');
const workableScraper = require('./workable');
const smartrecruitersSecraper = require('./smartrecruiters');
const builtinScraper = require('./builtin');
const notionScraper = require('./notion');
const ycombinatorScraper = require('./ycombinator');
const workdayScraper = require('./workday');

module.exports = {
  linkedin: linkedinScraper,
  wellfound: wellfoundScraper,
  greenhouse: greenhouseScraper,
  lever: leverScraper,
  workable: workableScraper,
  smartrecruiters: smartrecruitersSecraper,
  builtin: builtinScraper,
  notion: notionScraper,
  ycombinator: ycombinatorScraper,
  workday: workdayScraper
}; 