import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as planService from './planService';
import prisma from '../prisma/client';

// Mock Prisma client
vi.mock('../prisma/client', () => ({
  default: {
    plan: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('PlanService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllPlans', () => {
    it('should return all plans ordered by price ascending', async () => {
      const mockPlans = [
        {
          id: 1,
          name: 'Free',
          displayName: 'Free Plan',
          priceMonthly: 0,
          projectsQuota: 3,
        },
        {
          id: 2,
          name: 'Pro',
          displayName: 'Pro Plan',
          priceMonthly: 999,
          projectsQuota: 10,
        },
      ];

      vi.mocked(prisma.plan.findMany).mockResolvedValue(mockPlans);

      const result = await planService.getAllPlans();

      expect(result).toEqual(mockPlans);
      expect(prisma.plan.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          displayName: true,
          priceMonthly: true,
          projectsQuota: true,
        },
        orderBy: { priceMonthly: 'asc' },
      });
    });

    it('should return empty array when no plans exist', async () => {
      vi.mocked(prisma.plan.findMany).mockResolvedValue([]);

      const result = await planService.getAllPlans();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('getPlanById', () => {
    it('should return plan when found by ID', async () => {
      const mockPlan = {
        id: 2,
        name: 'Pro',
        displayName: 'Pro Plan',
        priceMonthly: 999,
        projectsQuota: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.plan.findUnique).mockResolvedValue(mockPlan);

      const result = await planService.getPlanById(2);

      expect(result).toEqual(mockPlan);
      expect(prisma.plan.findUnique).toHaveBeenCalledWith({
        where: { id: 2 },
      });
    });

    it('should return null when plan not found by ID', async () => {
      vi.mocked(prisma.plan.findUnique).mockResolvedValue(null);

      const result = await planService.getPlanById(999);

      expect(result).toBeNull();
    });
  });

  describe('getPlanByName', () => {
    it('should return plan when found by name', async () => {
      const mockPlan = {
        id: 1,
        name: 'Free',
        displayName: 'Free Plan',
        priceMonthly: 0,
        projectsQuota: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.plan.findUnique).mockResolvedValue(mockPlan);

      const result = await planService.getPlanByName('Free');

      expect(result).toEqual(mockPlan);
      expect(prisma.plan.findUnique).toHaveBeenCalledWith({
        where: { name: 'Free' },
      });
    });

    it('should return null when plan not found by name', async () => {
      vi.mocked(prisma.plan.findUnique).mockResolvedValue(null);

      const result = await planService.getPlanByName('NonExistent');

      expect(result).toBeNull();
    });

    it('should be case-sensitive when searching by name', async () => {
      vi.mocked(prisma.plan.findUnique).mockResolvedValue(null);

      const result = await planService.getPlanByName('free'); // lowercase

      expect(result).toBeNull();
      expect(prisma.plan.findUnique).toHaveBeenCalledWith({
        where: { name: 'free' },
      });
    });
  });
});
