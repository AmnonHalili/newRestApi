import request from 'supertest';
import app from '../server';
import { Server } from 'http';

let server: Server;

beforeAll(() => {
    server = app.listen(4000); // הפעלת השרת פעם אחת לפני כל הטסטים
});

afterAll(async () => {
    await new Promise((resolve) => server.close(resolve)); // סגירת השרת אחרי שהטסטים נגמרים
});

describe('REST API Tests', () => {
    test('should return a list of users', async () => {
        const response = await request(app).get('/api/users');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('should create a new user', async () => {
        const newUser = { name: 'Alice' };
        const response = await request(app).post('/api/users').send(newUser);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('Alice');
    });

    test('should return 400 if name is missing', async () => {
        const response = await request(app).post('/api/users').send({});
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Name is required');
    });
});
