import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PostModel } from '../models/post.model';
import { CommentModel } from '../models/comment.model';

export class PostController {
    // Create a new post
    static async createPost(req: AuthRequest, res: Response) {
        try {
            const { text, imageUrl } = req.body;
            const userId = req.userId;

            const post = await PostModel.create({
                userId,
                text,
                imageUrl
            });

            res.status(201).json(post);
        } catch (error) {
            res.status(500).json({ message: 'Error creating post' });
        }
    }

    // Get posts with pagination
    static async getPosts(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const posts = await PostModel.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'username profileImage');

            const total = await PostModel.countDocuments();

            res.json({
                posts,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching posts' });
        }
    }

    // Get posts by user ID
    static async getUserPosts(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const posts = await PostModel.find({ userId })
                .sort({ createdAt: -1 })
                .populate('userId', 'username profileImage');

            res.json(posts);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user posts' });
        }
    }

    // Update a post
    static async updatePost(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const { text, imageUrl } = req.body;
            const userId = req.userId;

            const post = await PostModel.findOne({ _id: id, userId });
            if (!post) {
                return res.status(404).json({ message: 'Post not found or unauthorized' });
            }

            post.text = text;
            if (imageUrl) {
                post.imageUrl = imageUrl;
            }
            await post.save();

            res.json(post);
        } catch (error) {
            res.status(500).json({ message: 'Error updating post' });
        }
    }

    // Delete a post
    static async deletePost(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.userId;

            const post = await PostModel.findOneAndDelete({ _id: id, userId });
            if (!post) {
                return res.status(404).json({ message: 'Post not found or unauthorized' });
            }

            // Delete all comments associated with the post
            await CommentModel.deleteMany({ postId: id });

            res.json({ message: 'Post deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting post' });
        }
    }

    // Toggle like on a post
    static async toggleLike(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.userId;

            const post = await PostModel.findById(id);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            const likeIndex = post.likes.indexOf(userId!);
            if (likeIndex === -1) {
                post.likes.push(userId!);
            } else {
                post.likes.splice(likeIndex, 1);
            }

            await post.save();
            res.json(post);
        } catch (error) {
            res.status(500).json({ message: 'Error toggling like' });
        }
    }
}