import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import BrowseProduce from '../pages/buyer/BrowseProduce';
import { AuthProvider } from '../context/AuthContext';

// Mock Router Link
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}));

// Mock api
vi.mock('../services/api', () => ({
  api: {
    auth: {
      getCurrentUser: vi.fn(() => ({
        userId: 2,
        fullName: 'Buyer User',
        role: 'BUYER',
        phoneNumber: '254711223344',
      })),
      getToken: vi.fn(() => 'buyer_token'),
    },
    buyer: {
      getListings: vi.fn(),
      createRequest: vi.fn(),
    },
    payments: {
      initiate: vi.fn(),
      simulateCallback: vi.fn(),
    }
  }
}));

import { api } from '../services/api';

describe('Gated payment STK checkout flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes order request and checks STK push dispatch status display on portal without portal PIN dialog', async () => {
    const mockListings = [
      {
        id: 1,
        cropName: 'Grade-A Maize',
        quantity: 1000,
        unit: 'KG',
        unitPrice: 50,
        location: 'Nyeri',
        farmerName: 'Joseph Farmer',
        status: 'AVAILABLE',
      }
    ];

    api.buyer.getListings.mockResolvedValue(mockListings);

    render(
      <AuthProvider>
        <BrowseProduce />
      </AuthProvider>
    );

    // 1. Check produce card renders
    await waitFor(() => {
      expect(screen.getByText('Grade-A Maize')).toBeInTheDocument();
    });

    // 2. Open checkout modal
    fireEvent.click(screen.getByRole('button', { name: /request purchase/i }));
    expect(screen.getByText('Quantity Requested (KG)')).toBeInTheDocument();

    // 3. Submit purchase request
    fireEvent.change(screen.getByLabelText(/quantity requested/i), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText(/delivery location/i), { target: { value: 'Nairobi Depot' } });

    const mockRequestResponse = {
      id: 99,
      totalAmount: 10000,
      cropName: 'Grade-A Maize',
    };
    api.buyer.createRequest.mockResolvedValue(mockRequestResponse);

    fireEvent.click(screen.getByRole('button', { name: /submit request/i }));

    // 4. Wait for STK push screen transition
    await waitFor(() => {
      expect(screen.getByText(/Initiate M-Pesa Payment/i)).toBeInTheDocument();
    }, { timeout: 2500 });

    // 5. Send STK Push
    const mockStkResponse = {
      merchantRequestId: 'MR-12345',
      checkoutRequestId: 'CR-67890',
    };
    api.payments.initiate.mockResolvedValue(mockStkResponse);

    fireEvent.click(screen.getByRole('button', { name: /send m-pesa stk push/i }));

    // 6. Check that STK Push Dispatched confirmation is displayed on the portal
    await waitFor(() => {
      expect(screen.getByText(/STK Push Dispatched/i)).toBeInTheDocument();
      expect(screen.getByText(/An M-Pesa STK Push has been sent to your phone number/i)).toBeInTheDocument();
    });

    // 7. Verify that no PIN entry input field is displayed on the portal
    expect(screen.queryByLabelText(/enter 4-digit pin/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/enter m-pesa pin/i)).not.toBeInTheDocument();

    // 8. Click Done to close modal
    fireEvent.click(screen.getByRole('button', { name: /done/i }));
  });
});
