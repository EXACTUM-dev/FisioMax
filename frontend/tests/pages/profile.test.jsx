/**
 * @fileoverview Unit tests for profile-related backend endpoints
 * @author EXACTUM-dev
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Jest setup already mocks @clerk/clerk-react in jest.setup.js
// We'll mock heavy child components and the membershipData util so the test is focused on the page wiring.

jest.mock('../../src/molecules/appHeader', () => ({
  __esModule: true,
  default: function MockAppHeader({ user }) {
    return <header data-testid="mock-app-header">Header - {user?.firstName || 'NoUser'}</header>;
  },
}));

jest.mock('../../src/molecules/sidebar', () => ({
  __esModule: true,
  default: function MockSidebar() {
    return <nav data-testid="mock-sidebar">Sidebar</nav>;
  },
}));

jest.mock('../../src/organisms/profileInfo', () => ({
  __esModule: true,
  default: function MockProfileInfo() {
    return <section data-testid="mock-profile-info">ProfileInfo</section>;
  },
}));

jest.mock('../../src/organisms/addressCard', () => ({
  __esModule: true,
  default: function MockAddressCard() {
    return <section data-testid="mock-address-card">Address</section>;
  },
}));

jest.mock('../../src/organisms/membershipCard', () => ({
  __esModule: true,
  default: function MockMembershipCard() {
    return <aside data-testid="mock-membership-card">Membership</aside>;
  },
}));

jest.mock('../../src/organisms/ticketsCard', () => ({
  __esModule: true,
  default: function MockTicketsCard() {
    return <aside data-testid="mock-tickets-card">Tickets</aside>;
  },
}));

jest.mock('../../src/organisms/documentsCard', () => ({
  __esModule: true,
  default: function MockDocumentsCard() {
    return <section data-testid="mock-documents-card">Docs</section>;
  },
}));

jest.mock('../../src/utils/membershipData', () => ({
  __esModule: true,
  getMembershipData: () => ({
    nombres: 'Test User',
    correo: 'test@example.com',
    pais: 'México',
    ciudad: 'Ciudad',
  }),
}));

// Import the page after mocks
import ProfilePage from '../../src/pages/profile';

describe('Profile page (unit)', () => {
  test('renders header, sidebar and profile sections', () => {
    render(<ProfilePage />);

    // Title
    expect(screen.getByText(/Mi Perfil/i)).toBeInTheDocument();

    // Header and sidebar mocks
    expect(screen.getByTestId('mock-app-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();

    // Organisms
    expect(screen.getByTestId('mock-profile-info')).toBeInTheDocument();
    expect(screen.getByTestId('mock-address-card')).toBeInTheDocument();
    expect(screen.getByTestId('mock-documents-card')).toBeInTheDocument();
    expect(screen.getByTestId('mock-membership-card')).toBeInTheDocument();
    expect(screen.getByTestId('mock-tickets-card')).toBeInTheDocument();
  });
});
