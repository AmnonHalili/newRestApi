import mongoose from 'mongoose';
import { Post } from '../types/post';

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    commentsCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export const PostModel = mongoose.model('Post', postSchema);