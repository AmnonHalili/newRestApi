import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PostModel } from '../models/post.model';
import { CommentModel } from '../models/comment.model';

export class CommentController {
    // Create a comment
    static async createComment(req: AuthRequest, res: Response) {
        try {
            const { postId, text } = req.body;
            const userId = req.userId;

            const post = await PostModel.findById(postId);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            const comment = await CommentModel.create({
                postId,
                userId,
                text
            });

            // Increment comments count
            post.commentsCount += 1;
            await post.save();

            res.status(201).json(comment);
        } catch (error) {
            res.status(500).json({ message: 'Error creating comment' });
        }
    }

    // Get comments for a post
    static async getPostComments(req: Request, res: Response) {
        try {
            const { postId } = req.params;
            const comments = await CommentModel.find({ postId })
                .sort({ createdAt: -1 })
                .populate('userId', 'username profileImage');

            res.json(comments);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching comments' });
        }
    }
}

