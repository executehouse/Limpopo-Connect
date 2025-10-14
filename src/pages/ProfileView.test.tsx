import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { AuthProvider } from '../lib/AuthProvider';
import ProfileView from './ProfileView';
import * as profileHooks from '../lib/useProfile';
import { axe, toHaveNoViolations } from 'jest-axe';

import { vi } from 'vitest';

expect.extend(toHaveNoViolations);

vi.mock('../lib/useProfile', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useProfile: vi.fn(),
    canViewProfile: vi.fn(),
  };
});
const mockedUseProfile = profileHooks.useProfile as vi.Mock;
const mockedCanViewProfile = profileHooks.canViewProfile as vi.Mock;

const renderWithProviders = (ui: React.ReactElement, { route = '/', path = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <HelmetProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path={path} element={ui} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </HelmetProvider>
  );
};

describe('ProfileView', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the loading skeleton while loading', () => {
    mockedUseProfile.mockReturnValue({ loading: true, profile: null });
    renderWithProviders(<ProfileView />, { route: '/profile/view/1', path: '/profile/view/:userId' });
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders the private profile CTA for private profiles', () => {
    const mockProfile = { id: '1', is_public_profile: false };
    mockedUseProfile.mockReturnValue({ profile: mockProfile, loading: false });
    mockedCanViewProfile.mockReturnValue(false);
    renderWithProviders(<ProfileView />, { route: '/profile/view/1', path: '/profile/view/:userId' });
    expect(screen.getByText(/Profile is Private/i)).toBeInTheDocument();
  });

  it('renders public profile information', () => {
    const mockProfile = {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      role: 'citizen',
      is_public_profile: true,
      bio: 'A short bio',
      created_at: new Date().toISOString(),
    };
    mockedUseProfile.mockReturnValue({ profile: mockProfile, stats: {}, loading: false });
    mockedCanViewProfile.mockReturnValue(true);
    renderWithProviders(<ProfileView />, { route: '/profile/view/1', path: '/profile/view/:userId' });
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/A short bio/i)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const mockProfile = {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      role: 'citizen',
      is_public_profile: true,
      bio: 'A short bio',
      created_at: new Date().toISOString(),
    };
    mockedUseProfile.mockReturnValue({ profile: mockProfile, stats: {}, loading: false });
    mockedCanViewProfile.mockReturnValue(true);
    const { container } = renderWithProviders(<ProfileView />, { route: '/profile/view/1', path: '/profile/view/:userId' });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
