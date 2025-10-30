import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as subscriptionService from './subscriptionService';
import prisma from '../prisma/client';
import { stripeAdapter } from '../adapters/stripe';

// Mock Prisma client
vi.mock('../prisma/client', () => ({
  default: {
    subscription: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    plan: {
      findUnique: vi.fn(),
    },
    invoice: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Mock Stripe adapter
vi.mock('../adapters/stripe', () => ({
  stripeAdapter: {
    createSubscription: vi.fn(),
  },
}));

describe('SubscriptionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentSubscription', () => {
    it('should return active subscription with plan details', async () => {
      const mockSubscription = {
        id: 1,
        userId: 1,
        planId: 2,
        status: 'active' as const,
        startDate: new Date(),
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        plan: {
          id: 2,
          name: 'Pro',
          displayName: 'Pro Plan',
          priceMonthly: 999,
          projectsQuota: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(mockSubscription);

      const result = await subscriptionService.getCurrentSubscription(1);

      expect(result).toEqual(mockSubscription);
      expect(prisma.subscription.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 1,
          status: 'active',
        },
        include: {
          plan: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should throw SubscriptionNotFoundError when no active subscription', async () => {
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null);

      await expect(
        subscriptionService.getCurrentSubscription(1)
      ).rejects.toThrow(subscriptionService.SubscriptionNotFoundError);

      await expect(
        subscriptionService.getCurrentSubscription(1)
      ).rejects.toThrow('No active subscription found');
    });
  });

  describe('createSubscription', () => {
    it('should create subscription and invoice successfully', async () => {
      const mockPlan = {
        id: 2,
        name: 'Pro',
        displayName: 'Pro Plan',
        priceMonthly: 999,
        projectsQuota: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSubscription = {
        id: 1,
        userId: 1,
        planId: 2,
        status: 'active' as const,
        startDate: new Date(),
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        plan: mockPlan,
      };

      const mockPaymentIntent = {
        id: 'pi_test_123',
        status: 'succeeded' as const,
        amount: 999,
        currency: 'usd',
      };

      // No existing subscription
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null);
      // Plan exists
      vi.mocked(prisma.plan.findUnique).mockResolvedValue(mockPlan);
      // Stripe payment succeeds
      vi.mocked(stripeAdapter.createSubscription).mockResolvedValue(mockPaymentIntent);
      // Transaction succeeds
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return await callback({
          subscription: {
            create: vi.fn().mockResolvedValue(mockSubscription),
          },
          invoice: {
            create: vi.fn().mockResolvedValue({}),
          },
        });
      });

      const result = await subscriptionService.createSubscription(1, 2);

      expect(result).toEqual(mockSubscription);
      expect(stripeAdapter.createSubscription).toHaveBeenCalledWith(1, 2);
    });

    it('should throw SubscriptionAlreadyActiveError when user has active subscription', async () => {
      const mockExistingSubscription = {
        id: 1,
        userId: 1,
        planId: 1,
        status: 'active' as const,
        startDate: new Date(),
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(mockExistingSubscription);

      await expect(
        subscriptionService.createSubscription(1, 2)
      ).rejects.toThrow(subscriptionService.SubscriptionAlreadyActiveError);

      await expect(
        subscriptionService.createSubscription(1, 2)
      ).rejects.toThrow('User already has an active subscription');

      // Should not proceed to create subscription
      expect(prisma.plan.findUnique).not.toHaveBeenCalled();
      expect(stripeAdapter.createSubscription).not.toHaveBeenCalled();
    });

    it('should throw InvalidPlanError when plan does not exist', async () => {
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.plan.findUnique).mockResolvedValue(null);

      await expect(
        subscriptionService.createSubscription(1, 999)
      ).rejects.toThrow(subscriptionService.InvalidPlanError);

      await expect(
        subscriptionService.createSubscription(1, 999)
      ).rejects.toThrow('Invalid plan selected');

      expect(stripeAdapter.createSubscription).not.toHaveBeenCalled();
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription when user owns it', async () => {
      const mockSubscription = {
        id: 1,
        userId: 1,
        planId: 2,
        status: 'active' as const,
        startDate: new Date(),
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCancelledSubscription = {
        ...mockSubscription,
        status: 'cancelled' as const,
        endDate: new Date(),
        plan: {
          id: 2,
          name: 'Pro',
          displayName: 'Pro Plan',
          priceMonthly: 999,
          projectsQuota: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      vi.mocked(prisma.subscription.findUnique).mockResolvedValue(mockSubscription);
      vi.mocked(prisma.subscription.update).mockResolvedValue(mockCancelledSubscription);

      const result = await subscriptionService.cancelSubscription(1, 1);

      expect(result.status).toBe('cancelled');
      expect(result.endDate).not.toBeNull();
      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          status: 'cancelled',
          endDate: expect.any(Date),
        },
        include: {
          plan: true,
        },
      });
    });

    it('should throw SubscriptionNotFoundError when subscription does not exist', async () => {
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue(null);

      await expect(
        subscriptionService.cancelSubscription(1, 999)
      ).rejects.toThrow(subscriptionService.SubscriptionNotFoundError);

      await expect(
        subscriptionService.cancelSubscription(1, 999)
      ).rejects.toThrow('Subscription not found');

      expect(prisma.subscription.update).not.toHaveBeenCalled();
    });

    it('should throw error when user does not own the subscription', async () => {
      const mockSubscription = {
        id: 1,
        userId: 999, // Different user
        planId: 2,
        status: 'active' as const,
        startDate: new Date(),
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.subscription.findUnique).mockResolvedValue(mockSubscription);

      await expect(
        subscriptionService.cancelSubscription(1, 1)
      ).rejects.toThrow('Forbidden: You do not own this subscription');

      expect(prisma.subscription.update).not.toHaveBeenCalled();
    });
  });

  describe('cancelCurrentSubscription', () => {
    it('should cancel current active subscription', async () => {
      const mockSubscription = {
        id: 1,
        userId: 1,
        planId: 2,
        status: 'active' as const,
        startDate: new Date(),
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCancelledSubscription = {
        ...mockSubscription,
        status: 'cancelled' as const,
        endDate: new Date(),
      };

      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(mockSubscription);
      vi.mocked(prisma.subscription.update).mockResolvedValue(mockCancelledSubscription);

      const result = await subscriptionService.cancelCurrentSubscription(1);

      expect(result.status).toBe('cancelled');
      expect(result.endDate).not.toBeNull();
      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          status: 'cancelled',
          endDate: expect.any(Date),
        },
      });
    });

    it('should throw SubscriptionNotFoundError when no active subscription', async () => {
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null);

      await expect(
        subscriptionService.cancelCurrentSubscription(1)
      ).rejects.toThrow(subscriptionService.SubscriptionNotFoundError);

      await expect(
        subscriptionService.cancelCurrentSubscription(1)
      ).rejects.toThrow('No active subscription found');

      expect(prisma.subscription.update).not.toHaveBeenCalled();
    });
  });

  describe('Error Classes', () => {
    it('SubscriptionAlreadyActiveError should be an instance of Error', () => {
      const error = new subscriptionService.SubscriptionAlreadyActiveError('Test');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('SubscriptionAlreadyActiveError');
      expect(error.message).toBe('Test');
    });

    it('InvalidPlanError should be an instance of Error', () => {
      const error = new subscriptionService.InvalidPlanError('Test');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('InvalidPlanError');
      expect(error.message).toBe('Test');
    });

    it('SubscriptionNotFoundError should be an instance of Error', () => {
      const error = new subscriptionService.SubscriptionNotFoundError('Test');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('SubscriptionNotFoundError');
      expect(error.message).toBe('Test');
    });
  });
});
