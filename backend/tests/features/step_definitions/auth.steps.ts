import 'dotenv/config';
import { Given, When, Then, Before, After } from '@cucumber/cucumber';
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
}

// Hooks
Before(async function (this: World) {
  // Clean up test data before each scenario (but preserve plans)
  await prisma.invoice.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});
  // Don't delete plans - they should persist across scenarios
});

After(async function (this: World) {
  // Clean up test data after each scenario (but preserve plans)
  await prisma.invoice.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});
  // Don't delete plans - they should persist across scenarios
});

// Given steps
Given('a user exists with email {string} and password {string}', async function (this: World, email: string, password: string) {
  this.email = email;
  this.password = password;
  
  const response = await request(app)
    .post('/api/auth/signup')
    .send({ email, password });
  
  this.userId = response.body.user?.id;
});

// When steps
When('a new user registers with email {string} and password {string}', async function (this: World, email: string, password: string) {
  this.email = email;
  this.password = password;
  
  this.response = await request(app)
    .post('/api/auth/signup')
    .send({ email, password });
});

When('the user logs in', async function (this: World) {
  this.response = await request(app)
    .post('/api/auth/signin')
    .send({ 
      email: this.email, 
      password: this.password 
    });
  
  if (this.response.status === 200) {
    this.token = this.response.body.accessToken;
  }
});

When('the user logs in with email {string} and password {string}', async function (this: World, email: string, password: string) {
  this.response = await request(app)
    .post('/api/auth/signin')
    .send({ email, password });
  
  if (this.response.status === 200) {
    this.token = this.response.body.accessToken;
  }
});

// Then steps
Then('the registration should succeed', function (this: World) {
  expect(this.response?.status).to.equal(201);
  expect(this.response?.body).to.have.property('accessToken');
  expect(this.response?.body).to.have.property('user');
  expect(this.response?.body.user).to.have.property('email', this.email);
});

Then('the response status is {int}', function (this: World, statusCode: number) {
  expect(this.response?.status).to.equal(statusCode);
});

Then('the login should succeed', function (this: World) {
  expect(this.response?.status).to.equal(200);
  expect(this.response?.body).to.have.property('accessToken');
  expect(this.response?.body.user).to.have.property('email', this.email);
});

Then('the login should fail with status {int}', function (this: World, statusCode: number) {
  expect(this.response?.status).to.equal(statusCode);
  expect(this.response?.body.accessToken).to.be.undefined;
});

Then('the response contains an error message', function (this: World) {
  expect(this.response?.body).to.have.property('error');
});

Then('the user should receive an access token', function (this: World) {
  expect(this.response?.body).to.have.property('accessToken');
  expect(this.response?.body.accessToken).to.be.a('string');
  expect(this.response?.body.accessToken.length).to.be.greaterThan(0);
});

Then('no access token should be provided', function (this: World) {
  expect(this.response?.body.accessToken).to.be.undefined;
});
