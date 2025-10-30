import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as projectService from './projectService';
import prisma from '../prisma/client';
import * as subscriptionService from './subscriptionService';

// Mock Prisma client
vi.mock('../prisma/client', () => ({
  default: {
    project: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    subscription: {
      findFirst: vi.fn(),
    },
  },
}));

// Mock subscription service
vi.mock('./subscriptionService', () => ({
  getCurrentSubscription: vi.fn(),
}));

describe('ProjectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listUserProjects', () => {
    it('should return all projects for a user', async () => {
      const mockProjects = [
        { id: 1, name: 'Project 1', description: 'Test', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, name: 'Project 2', description: 'Test', createdAt: new Date(), updatedAt: new Date() },
      ];

      vi.mocked(prisma.project.findMany).mockResolvedValue(mockProjects);

      const result = await projectService.listUserProjects(1);

      expect(result).toEqual(mockProjects);
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { ownerId: 1 },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should return empty array when user has no projects', async () => {
      vi.mocked(prisma.project.findMany).mockResolvedValue([]);

      const result = await projectService.listUserProjects(999);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('createProject', () => {
    it('should create project when user is under quota (Free plan)', async () => {
      // getCurrentSubscription throws error for Free users
      vi.mocked(subscriptionService.getCurrentSubscription).mockRejectedValue(
        new Error('No active subscription found')
      );
      vi.mocked(prisma.project.count).mockResolvedValue(2); // 2 existing projects
      
      const mockNewProject = {
        id: 3,
        name: 'New Project',
        description: 'Description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.project.create).mockResolvedValue(mockNewProject as any);

      const result = await projectService.createProject(1, {
        name: 'New Project',
        description: 'Description',
      });

      expect(result).toEqual(mockNewProject);
      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          name: 'New Project',
          description: 'Description',
          ownerId: 1,
        },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should create project when user is under quota (Pro plan)', async () => {
      const mockSubscription = {
        id: 1,
        userId: 1,
        planId: 2,
        status: 'active' as const,
        startDate: new Date(),
        endDate: null,
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
      
      vi.mocked(subscriptionService.getCurrentSubscription).mockResolvedValue(mockSubscription);
      vi.mocked(prisma.project.count).mockResolvedValue(9); // 9 existing projects

      const mockNewProject = {
        id: 10,
        name: 'New Project',
        description: 'Description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.project.create).mockResolvedValue(mockNewProject as any);

      const result = await projectService.createProject(1, {
        name: 'New Project',
        description: 'Description',
      });

      expect(result).toEqual(mockNewProject);
    });

    it('should throw QuotaExceededError when Free user at limit (3 projects)', async () => {
      vi.mocked(subscriptionService.getCurrentSubscription).mockRejectedValue(
        new Error('No active subscription found')
      );
      vi.mocked(prisma.project.count).mockResolvedValue(3); // Already at limit

      await expect(
        projectService.createProject(1, {
          name: 'Over Quota',
          description: 'This should fail',
        })
      ).rejects.toThrow(projectService.QuotaExceededError);

      expect(prisma.project.create).not.toHaveBeenCalled();
    });

    it('should throw QuotaExceededError when Pro user at limit (10 projects)', async () => {
      const mockSubscription = {
        id: 1,
        userId: 1,
        planId: 2,
        status: 'active' as const,
        startDate: new Date(),
        endDate: null,
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

      vi.mocked(subscriptionService.getCurrentSubscription).mockResolvedValue(mockSubscription);
      vi.mocked(prisma.project.count).mockResolvedValue(10); // Already at limit

      await expect(
        projectService.createProject(1, {
          name: 'Over Quota',
          description: 'This should fail',
        })
      ).rejects.toThrow(projectService.QuotaExceededError);

      expect(prisma.project.create).not.toHaveBeenCalled();
    });

    it('should use default Free quota when subscription status is cancelled', async () => {
      // If getCurrentSubscription throws, should fall back to Free quota
      vi.mocked(subscriptionService.getCurrentSubscription).mockRejectedValue(
        new Error('No active subscription found')
      );
      vi.mocked(prisma.project.count).mockResolvedValue(3); // 3 projects = at Free limit

      // Should fall back to Free plan quota (3) and throw error
      await expect(
        projectService.createProject(1, {
          name: 'Over Free Quota',
          description: 'Should fail with Free quota',
        })
      ).rejects.toThrow(projectService.QuotaExceededError);
    });
  });

  describe('deleteProject', () => {
    it('should delete project when user owns it', async () => {
      const mockProject = {
        id: 1,
        name: 'Project to Delete',
        description: 'Test',
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject);
      vi.mocked(prisma.project.delete).mockResolvedValue(mockProject);

      const result = await projectService.deleteProject(1, 1);

      expect(result).toBe(true); // deleteProject returns true on success
      expect(prisma.project.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null when project does not exist', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null);

      const result = await projectService.deleteProject(1, 999);

      expect(result).toBeNull();
      expect(prisma.project.delete).not.toHaveBeenCalled();
    });

    it('should throw error when user does not own the project', async () => {
      const mockProject = {
        id: 1,
        name: 'Someone Elses Project',
        description: 'Test',
        ownerId: 999, // Different owner
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject);

      await expect(
        projectService.deleteProject(1, 1)
      ).rejects.toThrow('Forbidden: You do not own this project');

      expect(prisma.project.delete).not.toHaveBeenCalled();
    });
  });

  describe('QuotaExceededError', () => {
    it('should be an instance of Error', () => {
      const error = new projectService.QuotaExceededError('Test message');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test message');
      expect(error.name).toBe('QuotaExceededError');
    });
  });
});
