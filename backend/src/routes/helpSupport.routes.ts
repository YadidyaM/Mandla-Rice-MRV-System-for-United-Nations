import express from 'express';
import helpSupportController from '../controllers/HelpSupportController';

const router = express.Router();

/**
 * Help & Support Routes - User Assistance and Documentation
 */

// Get help categories and topics
router.get('/categories', helpSupportController.getHelpCategories);

// Get help article by topic ID
router.get('/articles/:topicId', helpSupportController.getHelpArticle);

// Search help articles
router.get('/search', helpSupportController.searchHelp);

// Get FAQ categories and questions
router.get('/faqs', helpSupportController.getFAQs);

// Get contact information and support channels
router.get('/contact', helpSupportController.getContactInfo);

// Submit support ticket
router.post('/tickets', helpSupportController.submitSupportTicket);

export default router;
