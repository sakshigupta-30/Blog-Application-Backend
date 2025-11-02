import express from 'express';
import {
  createBlogPost,
  getAllBlogPosts,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
} from '../controllers/blogController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getAllBlogPosts);
router.get('/:id', getBlogPostById);

// Protected routes
router.post('/', authMiddleware, createBlogPost);
router.put('/:id', authMiddleware, updateBlogPost);
router.delete('/:id', authMiddleware, deleteBlogPost);

export default router;