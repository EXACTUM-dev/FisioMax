/**
 * @fileoverview Unit tests for profile-related backend endpoints
 * @author EXACTUM-dev
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from 'react-router-dom';

// Jest setup already mocks @clerk/clerk-react in jest.setup.js
// We'll mock heavy child components and the membershipData util so the test is focused on the page wiring.

jest.mock("../../src/molecules/appHeader", () => ({
  __esModule: true,
  default: function MockAppHeader({ user }) {
    return (
      <header data-testid="mock-app-header">
        Header - {user?.firstName || "NoUser"}
      </header>
    );
  },
}));

jest.mock("../../src/molecules/sidebar", () => ({
  __esModule: true,
  default: function MockSidebar() {
    return <nav data-testid="mock-sidebar">Sidebar</nav>;
  },
}));

jest.mock("../../src/organisms/profileInfo", () => ({
  __esModule: true,
  default: function MockProfileInfo() {
    return <section data-testid="mock-profile-info">ProfileInfo</section>;
  },
}));

// Mock ProfileFormSection to avoid importing files that use import.meta in tests
jest.mock("../../src/organisms/profileFormSection", () => ({
  __esModule: true,
  default: function MockProfileFormSection() {
    return (
      <section data-testid="mock-profile-form-section">Profile Form</section>
    );
  },
}));

jest.mock("../../src/organisms/addressCard", () => ({
  __esModule: true,
  default: function MockAddressCard() {
    return <section data-testid="mock-address-card">Address</section>;
  },
}));

jest.mock("../../src/organisms/membershipCard", () => ({
  __esModule: true,
  default: function MockMembershipCard() {
    return <aside data-testid="mock-membership-card">Membership</aside>;
  },
}));

jest.mock("../../src/organisms/ticketsCard", () => ({
  __esModule: true,
  default: function MockTicketsCard() {
    return <aside data-testid="mock-tickets-card">Tickets</aside>;
  },
}));

jest.mock("../../src/organisms/certificateCard", () => ({
  __esModule: true,
  default: function MockCertificateCard() {
    return <aside data-testid="mock-certificate-card">Certificate</aside>;
  },
}));

jest.mock("../../src/organisms/documentsCard", () => ({
  __esModule: true,
  default: function MockDocumentsCard() {
    return <section data-testid="mock-documents-card">Docs</section>;
  },
}));

jest.mock("../../src/organisms/historyCard", () => ({
  __esModule: true,
  default: function MockHistoryCard() {
    return <section data-testid="mock-history-card">History</section>;
  },
}));

jest.mock("../../src/utils/membershipData", () => ({
  __esModule: true,
  getMembershipData: () => ({
    nombres: "Test User",
    correo: "test@example.com",
    pais: "México",
    ciudad: "Ciudad",
  }),
}));

// Mock API config to avoid `import.meta` usage in tests
jest.mock('../../src/config/api', () => ({
  API_CONFIG: { BASE_URL: 'http://localhost:5000' },
  buildApiUrl: (endpoint) => `http://localhost:5000${endpoint}`,
}));

// Import the page after mocks
import ProfilePage from "../../src/pages/profile";

describe("Profile page (unit)", () => {
  test('renders header, sidebar and profile sections', async () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    // Title - wait for async fetch to complete
    expect(await screen.findByText(/Mi Perfil/i)).toBeInTheDocument();

    // Header and sidebar mocks
    expect(screen.getByTestId("mock-app-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();

    // Organisms (profile form section replaces legacy profileInfo)
    expect(screen.getByTestId("mock-profile-form-section")).toBeInTheDocument();
    expect(screen.getByTestId("mock-address-card")).toBeInTheDocument();
    expect(screen.getByTestId("mock-documents-card")).toBeInTheDocument();
    expect(screen.getByTestId("mock-membership-card")).toBeInTheDocument();
    expect(screen.getByTestId("mock-tickets-card")).toBeInTheDocument();
  });
});
