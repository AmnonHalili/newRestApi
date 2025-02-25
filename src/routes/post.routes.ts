import express from 'express';
import { PostController } from '../controllers/post.controller';
import { CommentController } from '../controllers/comment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Post routes
router.post('/', authMiddleware, PostController.createPost);
router.get('/', PostController.getPosts);
router.get('/user/:userId', PostController.getUserPosts);
router.put('/:id', authMiddleware, PostController.updatePost);
router.delete('/:id', authMiddleware, PostController.deletePost);
router.post('/:id/like', authMiddleware, PostController.toggleLike);

// Comment routes
router.post('/comment', authMiddleware, CommentController.createComment);
router.get('/:postId/comments', CommentController.getPostComments);

export default router;