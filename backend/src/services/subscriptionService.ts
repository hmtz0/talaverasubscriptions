import prisma from '../prisma/client';
import { stripeAdapter } from '../adapters/stripe';

export class SubscriptionAlreadyActiveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionAlreadyActiveError';
  }
}

export class InvalidPlanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPlanError';
  }
}

export class SubscriptionNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionNotFoundError';
  }
}

export async function getCurrentSubscription(userId: number) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'active',
    },
    include: {
      plan: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!subscription) {
    throw new SubscriptionNotFoundError('No active subscription found');
  }

  return subscription;
}

export async function createSubscription(userId: number, planId: number) {
  // Check if user already has an active subscription
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'active',
    },
  });

  if (existingSubscription) {
    throw new SubscriptionAlreadyActiveError('User already has an active subscription');
  }

  // Verify plan exists
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new InvalidPlanError('Invalid plan selected');
  }

  // Create payment intent via Stripe mock adapter
  const paymentIntent = await stripeAdapter.createSubscription(userId, planId);

  // Create subscription and invoice in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create subscription
    const subscription = await tx.subscription.create({
      data: {
        userId,
        planId,
        status: 'active',
      },
      include: {
        plan: true,
      },
    });

    // Create invoice
    await tx.invoice.create({
      data: {
        subscriptionId: subscription.id,
        amount: plan.priceMonthly,
        currency: 'usd',
        status: 'paid',
        paymentIntentId: paymentIntent.id,
      },
    });

    return subscription;
  });

  return result;
}

export async function cancelSubscription(userId: number, subscriptionId: number) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new SubscriptionNotFoundError('Subscription not found');
  }

  if (subscription.userId !== userId) {
    throw new Error('Forbidden: You do not own this subscription');
  }

  return await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'cancelled',
      endDate: new Date(),
    },
    include: {
      plan: true,
    },
  });
}

export async function cancelCurrentSubscription(userId: number) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'active',
    },
  });
  if (!subscription) {
    throw new SubscriptionNotFoundError('No active subscription found');
  }
  return await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'cancelled',
      endDate: new Date(),
    },
  });
}
