export interface User {
  id: number;
  email: string;
  name: string | null;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: string;
  user: User;
}

export interface Plan {
  id: number;
  name: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  projectsQuota: number;
  features: string[];
}

export interface Subscription {
  id: number;
  userId: number;
  planId: number;
  plan: {
    id: number;
    name: string;
    displayName: string;
    priceMonthly: number;
    projectsQuota: number;
  };
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string | null;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  name: string;
}
