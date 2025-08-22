import { Router } from 'express';
import { ResearchController } from '../controllers/ResearchController';

const router = Router();
const researchController = new ResearchController();

/**
 * @route GET /api/v1/research/search
 * @desc Search for research articles using Solr-style queries
 * @access Public
 * @query {string} query - Search query (required)
 * @query {number} page - Page number (default: 1)
 * @query {number} rows - Results per page (default: 100, max: 100)
 * @query {string} sort - Sort criteria (optional)
 */
router.get('/search', researchController.searchArticles);

/**
 * @route GET /api/v1/research/climate-agriculture
 * @desc Get climate change and agriculture research
 * @access Public
 * @query {number} page - Page number (default: 1)
 */
router.get('/climate-agriculture', researchController.getClimateAgricultureResearch);

/**
 * @route GET /api/v1/research/rice-methane
 * @desc Get rice farming and methane emissions research
 * @access Public
 * @query {number} page - Page number (default: 1)
 */
router.get('/rice-methane', researchController.getRiceMethaneResearch);

/**
 * @route GET /api/v1/research/sustainable-agriculture
 * @desc Get sustainable agriculture practices research
 * @access Public
 * @query {number} page - Page number (default: 1)
 */
router.get('/sustainable-agriculture', researchController.getSustainableAgricultureResearch);

/**
 * @route GET /api/v1/research/mrv-insights
 * @desc Get MRV methodology research insights
 * @access Public
 */
router.get('/mrv-insights', researchController.getMRVResearchInsights);

/**
 * @route GET /api/v1/research/methodology/:component
 * @desc Get research for specific MRV methodology components
 * @access Public
 * @param {string} component - Methodology component (emissions|verification|monitoring|reporting)
 */
router.get('/methodology/:component', researchController.getMethodologyResearch);

/**
 * @route GET /api/v1/research/article/xml/:doi
 * @desc Get article XML by DOI
 * @access Public
 * @param {string} doi - Article DOI
 */
router.get('/article/xml/:doi', researchController.getArticleXML);

/**
 * @route GET /api/v1/research/article/pdf/:doi
 * @desc Get article PDF by DOI
 * @access Public
 * @param {string} doi - Article DOI
 */
router.get('/article/pdf/:doi', researchController.getArticlePDF);

/**
 * @route GET /api/v1/research/articles/urls
 * @desc Get all published article XML URLs
 * @access Public
 */
router.get('/articles/urls', researchController.getAllArticleURLs);

export default router;
