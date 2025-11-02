import { Request, Response } from 'express';
import BlogPost from '../models/BlogPost';

// Create a new blog post
export const createBlogPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, image } = req.body;
    const userId = req.user?.userId;

    if (!title || !content) {
      res.status(400).json({ message: 'Title and content are required' });
      return;
    }

    const blogPost = new BlogPost({
      title,
      content,
      author: userId,
      image,
    });

    await blogPost.save();
    await blogPost.populate('author', 'username email');

    res.status(201).json({ message: 'Blog post created', data: blogPost });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create blog post', error });
  }
};

// Get all blog posts
export const getAllBlogPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const blogPosts = await BlogPost.find()
      .populate('author', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({ data: blogPosts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch blog posts', error });
  }
};

// Get a single blog post
export const getBlogPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const blogPost = await BlogPost.findById(id).populate('author', 'username email');

    if (!blogPost) {
      res.status(404).json({ message: 'Blog post not found' });
      return;
    }

    res.status(200).json({ data: blogPost });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch blog post', error });
  }
};

// Update a blog post
export const updateBlogPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, image } = req.body;
    const userId = req.user?.userId;

    const blogPost = await BlogPost.findById(id);

    if (!blogPost) {
      res.status(404).json({ message: 'Blog post not found' });
      return;
    }

    // Check if user is the author
    if (blogPost.author.toString() !== userId) {
      res.status(403).json({ message: 'Not authorized to update this post' });
      return;
    }

    blogPost.title = title || blogPost.title;
    blogPost.content = content || blogPost.content;
    if (image) blogPost.image = image;

    await blogPost.save();
    await blogPost.populate('author', 'username email');

    res.status(200).json({ message: 'Blog post updated', data: blogPost });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update blog post', error });
  }
};

// Delete a blog post
export const deleteBlogPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const blogPost = await BlogPost.findById(id);

    if (!blogPost) {
      res.status(404).json({ message: 'Blog post not found' });
      return;
    }

    // Check if user is the author
    if (blogPost.author.toString() !== userId) {
      res.status(403).json({ message: 'Not authorized to delete this post' });
      return;
    }

    await BlogPost.findByIdAndDelete(id);

    res.status(200).json({ message: 'Blog post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete blog post', error });
  }
};