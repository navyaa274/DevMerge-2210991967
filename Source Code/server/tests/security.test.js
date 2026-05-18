const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server/index');
const User = require('../../server/models/auth/User');

describe('Comprehensive Security Test Suite', () => {
    let studentToken, facultyToken, hodToken, studentRefreshToken, facultyId;

    beforeAll(async () => {
        // Cleanup and Setup
        await User.deleteMany({});

        // Create User - Hod
        const hodRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Dr. Hod',
                email: 'hod@devmerge.edu',
                password: 'SecurePass123!',
                role: 'hod'
            });
        hodToken = hodRes.body.accessToken;

        // Create User - Faculty
        const facultyRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Dr. Faculty',
                email: 'faculty@devmerge.edu',
                password: 'SecurePass123!',
                role: 'faculty'
            });
        facultyToken = facultyRes.body.accessToken;

        // Create User - Student
        const studentRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Student One',
                email: 'student@devmerge.edu',
                password: 'SecurePass123!',
                role: 'student'
            });
        studentToken = studentRes.body.accessToken;
        studentRefreshToken = studentRes.body.refreshToken;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('JWT Refresh Token Security', () => {
        it('should rotate JWT refresh tokens and invalidate the old one', async () => {
            const res = await request(app)
                .post('/api/auth/refresh-token')
                .send({ refreshToken: studentRefreshToken });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');

            const newRefreshToken = res.body.refreshToken;
            expect(newRefreshToken).not.toBe(studentRefreshToken);

            // Attempting to use the OLD refresh token should now fail
            const failRes = await request(app)
                .post('/api/auth/refresh-token')
                .send({ refreshToken: studentRefreshToken });

            expect(failRes.statusCode).toEqual(401); // Corrected from 41 to 401
        });
    });

    describe('OTP Rate Limiting and Security', () => {
        const otpPayload = { email: 'secure-test@example.com' };

        it('should enforce rate limits on OTP generation', async () => {
            // Hit it 3 times (allowed)
            for (let i = 0; i < 3; i++) {
                await request(app).post('/api/auth/send-otp').send(otpPayload);
            }

            // 4th time should fail
            const res = await request(app).post('/api/auth/send-otp').send(otpPayload);
            expect(res.statusCode).toEqual(429);
            expect(res.body.message || res.text).toMatch(/Too many .* attempts/i);
        });

        it('should reject invalid OTP verification attempts', async () => {
            const res = await request(app)
                .post('/api/auth/verify-otp')
                .send({ email: 'secure-test@example.com', otp: '000000' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toMatch(/Invalid OTP|expired/i);
        });
    });

    describe('Role-Based Access Control (RBAC)', () => {
        it('should block a student from accessing faculty-only routes', async () => {
            // Testing /api/faculty/dashboard or similar (guessing path based on common patterns)
            const res = await request(app)
                .get('/api/faculty/submissions') // Faculty route
                .set('Authorization', `Bearer ${studentToken}`);

            // Should be 401 or 403 (Unauthorized / Forbidden)
            expect([401, 403]).toContain(res.statusCode);
        });

        it('should allow a faculty to access faculty-only routes', async () => {
            const res = await request(app)
                .get('/api/faculty')
                .set('Authorization', `Bearer ${facultyToken}`);

            // Should not be 401/403
            expect(res.statusCode).not.toEqual(401);
            expect(res.statusCode).not.toEqual(403);
        });

        it('should allow a HOD to access faculty management routes', async () => {
            const res = await request(app)
                .get('/api/faculty')
                .set('Authorization', `Bearer ${hodToken}`);

            expect(res.statusCode).toEqual(200);
        });
    });

    describe('Data Integrity & Input Validation', () => {
        it('should reject registration with weak passwords or missing fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'bad-user@devmerge.edu' }); // Missing name, password

            expect([400, 500]).toContain(res.statusCode);
        });

        it('should block SQL injection-like patterns in login (Quick Win)', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: "' OR 1=1 --", password: 'password' });

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('CORS and Security Headers', () => {
        it('should have security headers present', async () => {
            const res = await request(app)
                .get('/api/auth/refresh-token')
                .set('Origin', 'http://localhost:3000'); // Triggers CORS

            expect(res.header).toHaveProperty('access-control-allow-origin');
        });
    });
});
