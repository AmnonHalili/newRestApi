export const config = {
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    JWT_EXPIRATION: '1h',
    JWT_REFRESH_EXPIRATION: '7d',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/social-app',
    PORT: process.env.PORT || 3000
};