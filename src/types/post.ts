export interface Post {
    id: string;
    userId: string;
    text: string;
    imageUrl?: string;
    likes: string[];  // Array of user IDs who liked the post
    commentsCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Comment {
    id: string;
    postId: string;
    userId: string;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}