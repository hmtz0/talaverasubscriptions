import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './LoginPage';
import * as useAuthModule from '../hooks/useAuth';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'auth.login': 'Login',
        'auth.dontHaveAccount': "Don't have an account?",
        'auth.signup': 'Sign up',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.loginButton': 'Sign in',
        'general.loading': 'Loading...',
        'general.error': 'An error occurred',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  let queryClient: QueryClient;
  
  // Default mock for useLogin
  const mockMutateAsync = vi.fn();
  const mockLoginMutation = {
    mutateAsync: mockMutateAsync,
    isPending: false,
    isError: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock useLogin hook
    vi.spyOn(useAuthModule, 'useLogin').mockReturnValue(mockLoginMutation as any);
  });

  const renderLoginPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should render login form with email and password fields', () => {
    renderLoginPage();

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit login form/i })).toBeInTheDocument();
  });

  it('should render signup link', () => {
    renderLoginPage();

    const signupLink = screen.getByRole('link', { name: /sign up/i });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute('href', '/signup');
  });

  it('should submit form with email and password', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValueOnce({ token: 'fake-token' });

    renderLoginPage();

    // Fill in form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    // Submit form
    await user.click(screen.getByRole('button', { name: /submit login form/i }));

    // Verify mutation was called with correct data
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    // Verify navigation happened
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/projects');
    });
  });

  it('should display error message on login failure', async () => {
    const mockError = {
      response: {
        data: {
          error: 'Invalid credentials',
        },
      },
    };

    vi.spyOn(useAuthModule, 'useLogin').mockReturnValue({
      ...mockLoginMutation,
      isError: true,
      error: mockError,
    } as any);

    renderLoginPage();

    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent('Invalid credentials');
  });

  it('should disable submit button during login', () => {
    vi.spyOn(useAuthModule, 'useLogin').mockReturnValue({
      ...mockLoginMutation,
      isPending: true,
    } as any);

    renderLoginPage();

    const submitButton = screen.getByRole('button', { name: /submit login form/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/loading/i);
  });

  it('should show loading text when mutation is pending', () => {
    vi.spyOn(useAuthModule, 'useLogin').mockReturnValue({
      ...mockLoginMutation,
      isPending: true,
    } as any);

    renderLoginPage();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should handle form submission with Enter key', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValueOnce({ token: 'fake-token' });

    renderLoginPage();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123{Enter}');

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
