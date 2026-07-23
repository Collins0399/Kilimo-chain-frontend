import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

// Mock api
vi.mock('../services/api', () => ({
  api: {
    auth: {
      login: vi.fn(),
      getCurrentUser: vi.fn(() => null),
      getToken: vi.fn(() => null),
      logout: vi.fn(),
    }
  }
}));

import { api } from '../services/api';

describe('Authentication flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form components properly', () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('submits credentials and routes to dashboard on success', async () => {
    const mockLoginResponse = {
      accessToken: 'mock_token',
      userId: 1,
      fullName: 'Cooperative Admin',
      role: 'COOPERATIVE_ADMIN',
    };
    
    api.auth.login.mockResolvedValue(mockLoginResponse);

    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'admin@kilimo.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(api.auth.login).toHaveBeenCalledWith('admin@kilimo.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });
});
