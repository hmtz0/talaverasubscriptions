import { Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import app from '../../../src/app';
import prisma from '../../../src/prisma/client';
import assert from 'assert';

let token = '';
Given(
  'a user exists with email {string} and password {string}',
  async (email: string, password: string) => {
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
    const { hashPassword } = await import('../../../src/utils/hash');
    await prisma.user.create({ data: { email, password: await hashPassword(password) } });
  }
);

When('the user logs in', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'alice@example.com', password: 'password123' });
  token = res.body.accessToken;
});

When('the user creates a task with title {string}', async (title: string) => {
  await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`).send({ title });
});

Then('the user can list tasks and see {string}', async (title: string) => {
  const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);
  const titles = res.body.map((t: any) => t.title);
  assert.ok(titles.includes(title));
});
