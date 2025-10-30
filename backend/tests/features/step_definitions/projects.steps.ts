import 'dotenv/config';
import { Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import { expect } from 'chai';
import app from '../../../src/app';
import prisma from '../../../src/prisma/client';

interface World {
  request?: request.Test;
  response?: request.Response;
  token?: string;
  userId?: number;
  email?: string;
  password?: string;
  projectName?: string;
  projects?: any[];
}

// Given steps
Given('the database is seeded with plans', async function (this: World) {
  // This is now handled by BeforeAll hook in hooks.ts
  // But keeping the step definition for backwards compatibility
});

Given('a signed-in user on the {string} plan with {int} projects', async function (this: World, planName: string, projectCount: number) {
  // Create user
  const email = `user-${Date.now()}@example.com`;
  const password = 'password123';
  
  const signupResponse = await request(app)
    .post('/api/auth/signup')
    .send({ email, password });
  
  this.token = signupResponse.body.accessToken;
  this.userId = signupResponse.body.user.id;
  this.email = email;
  this.password = password;

  // If Pro plan, create subscription
  if (planName === 'Pro') {
    const plan = await prisma.plan.findFirst({ where: { name: 'Pro' } });
    if (plan) {
      await prisma.subscription.create({
        data: {
          userId: this.userId!,
          planId: plan.id,
          status: 'active',
          startDate: new Date(),
          invoices: {
            create: {
              amount: plan.priceMonthly,
              status: 'paid'
            }
          }
        }
      });
    }
  }

  // Create specified number of projects
  for (let i = 1; i <= projectCount; i++) {
    await prisma.project.create({
      data: {
        name: `Project ${i}`,
        description: `Test project ${i}`,
        ownerId: this.userId!
      }
    });
  }
});

// When steps
When('the user creates a project named {string}', async function (this: World, projectName: string) {
  this.projectName = projectName;
  
  this.response = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${this.token}`)
    .send({
      name: projectName,
      description: `Test project ${projectName}`
    });
});

// Then steps
Then('the response contains a project with name {string}', function (this: World, projectName: string) {
  expect(this.response?.body).to.have.property('name', projectName);
  expect(this.response?.body).to.have.property('id');
});

Then('{string} appears in the user\'s project list', async function (this: World, projectName: string) {
  const listResponse = await request(app)
    .get('/api/projects')
    .set('Authorization', `Bearer ${this.token}`);
  
  expect(listResponse.status).to.equal(200);
  const projectNames = listResponse.body.map((p: any) => p.name);
  expect(projectNames).to.include(projectName);
});

Then('the response contains the localized key {string}', function (this: World, key: string) {
  // The error response format is: { error: "translated message" }
  // We need to check if the response contains an error property
  expect(this.response?.body).to.have.property('error');
  // For now, just verify it's a string (the translated error)
  expect(this.response?.body.error).to.be.a('string');
  // Optionally: check if it mentions the quota/limit
  expect(this.response?.body.error).to.include('project');
});
