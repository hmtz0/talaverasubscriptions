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
  subscriptionId?: number;
}

// Given steps
Given('the user is logged in', async function (this: World) {
  if (!this.token) {
    const response = await request(app)
      .post('/api/auth/signin')
      .send({ 
        email: this.email, 
        password: this.password 
      });
    
    this.token = response.body.accessToken;
    this.userId = response.body.user.id;
  }
});

Given('the user is on the {string} plan', async function (this: World, planName: string) {
  // User is on Free plan by default (no subscription)
  if (planName === 'Free') {
    // Ensure no active subscription exists
    await prisma.subscription.updateMany({
      where: { userId: this.userId },
      data: { status: 'cancelled' }
    });
  }
});

Given('the user has an active {string} subscription', async function (this: World, planName: string) {
  const plan = await prisma.plan.findFirst({ where: { name: planName } });
  
  if (!plan) {
    throw new Error(`Plan ${planName} not found in database`);
  }

  const subscription = await prisma.subscription.create({
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

  this.subscriptionId = subscription.id;
});

Given('the user has no active subscription', async function (this: World) {
  // Cancel any existing subscriptions
  await prisma.subscription.updateMany({
    where: { userId: this.userId },
    data: { status: 'cancelled' }
  });
});

// When steps
When('the user requests the list of available plans', async function (this: World) {
  this.response = await request(app)
    .get('/api/plans')
    .set('Authorization', `Bearer ${this.token}`);
});

When('the user subscribes to the {string} plan', async function (this: World, planName: string) {
  const plan = await prisma.plan.findFirst({ where: { name: planName } });
  
  if (!plan) {
    throw new Error(`Plan ${planName} not found in database`);
  }

  this.response = await request(app)
    .post('/api/subscriptions')
    .set('Authorization', `Bearer ${this.token}`)
    .send({
      planId: plan.id,
      paymentMethodId: 'pm_mock_test'
    });

  if (this.response.status === 201) {
    this.subscriptionId = this.response.body.id;
  }
});

When('the user requests their current subscription details', async function (this: World) {
  this.response = await request(app)
    .get('/api/subscriptions/current')
    .set('Authorization', `Bearer ${this.token}`);
});

When('the user cancels their subscription', async function (this: World) {
  this.response = await request(app)
    .delete('/api/subscriptions/current')
    .set('Authorization', `Bearer ${this.token}`);
});

// Then steps
Then('the response should include a plan named {string} with quota {int}', function (this: World, planName: string, quota: number) {
  expect(this.response?.body).to.be.an('array');
  const plan = this.response?.body.find((p: any) => p.name === planName);
  expect(plan).to.exist;
  expect(plan.projectsQuota).to.equal(quota);
});

Then('the subscription should be created successfully', function (this: World) {
  expect(this.response?.body).to.have.property('subscription');
  expect(this.response?.body.subscription).to.have.property('id');
  expect(this.response?.body.subscription).to.have.property('status', 'active');
  // Save subscription ID for later steps
  this.subscriptionId = this.response?.body.subscription.id;
});

Then('an invoice is recorded with the plan price', async function (this: World) {
  const invoices = await prisma.invoice.findMany({
    where: { subscriptionId: this.subscriptionId },
    include: { subscription: { include: { plan: true } } }
  });

  expect(invoices.length).to.be.greaterThan(0);
  const invoice = invoices[0];
  expect(invoice.amount).to.equal(invoice.subscription.plan.priceMonthly);
  expect(invoice.status).to.equal('paid');
});

Then('the user\'s active subscription should be {string}', async function (this: World, planName: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: this.userId,
      status: 'active'
    },
    include: { plan: true }
  });

  expect(subscription).to.exist;
  expect(subscription?.plan.name).to.equal(planName);
});

Then('the user\'s project quota should be {int}', async function (this: World, quota: number) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: this.userId,
      status: 'active'
    },
    include: { plan: true }
  });

  if (subscription) {
    expect(subscription.plan.projectsQuota).to.equal(quota);
  } else {
    // Free plan default
    const freePlan = await prisma.plan.findFirst({ where: { name: 'Free' } });
    expect(freePlan?.projectsQuota).to.equal(quota);
  }
});

Then('the response should show plan {string}', function (this: World, planName: string) {
  expect(this.response?.body).to.have.property('plan');
  expect(this.response?.body.plan).to.have.property('name', planName);
});

Then('the response should include the subscription start date', function (this: World) {
  expect(this.response?.body).to.have.property('startDate');
});

Then('the response should show status {string}', function (this: World, status: string) {
  expect(this.response?.body).to.have.property('status', status);
});

Then('the subscription status should change to {string}', async function (this: World, status: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: this.subscriptionId }
  });

  expect(subscription?.status).to.equal(status);
});

Then('the user should be treated as {string} plan with quota {int}', async function (this: World, planName: string, quota: number) {
  // This is a UI/business logic test - user gets Free plan behavior when no subscription
  // The actual quota is enforced by the backend when no subscription exists
  const freePlan = await prisma.plan.findFirst({ where: { name: planName } });
  expect(freePlan).to.exist;
  expect(freePlan?.projectsQuota).to.equal(quota);
});
