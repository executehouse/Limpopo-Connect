import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProfileView from '../components/ProfileView';
import { AuthProvider } from '../lib/AuthProvider';

// Mock the hooks and utilities
const mockUseProfile = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('../lib/useProfile', () => ({
  useProfile: () => mockUseProfile(),
}));

vi.mock('../lib/useAuth', () => ({
  useAuthContext: () => mockUseAuth(),
}));

const mockProfile = {
  id: 'user-123',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  bio: 'Test bio',
  phone: '+27123456789',
  avatar_url: 'https://example.com/avatar.jpg',
  role: 'citizen',
  is_public_profile: true,
  show_contact: true,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

const mockAuthUser = {
  user: { id: 'user-123' },
  profile: mockProfile,
  isAuthenticated: true,
  isAdmin: false,
  isCitizen: true,
  isBusiness: false,
  isVisitor: false,
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('ProfileView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(mockAuthUser);
  });

  it('renders profile information correctly for own profile', async () => {
    mockUseProfile.mockReturnValue({
      profile: mockProfile,
      loading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <ProfileView userId="user-123" />
      </TestWrapper>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test bio')).toBeInTheDocument();
    expect(screen.getByText('+27123456789')).toBeInTheDocument();
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
  });

  it('renders limited information for other users when profile is private', async () => {
    const privateProfile = {
      ...mockProfile,
      id: 'other-user',
      is_public_profile: false,
      show_contact: false,
    };

    mockUseProfile.mockReturnValue({
      profile: privateProfile,
      loading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <ProfileView userId="other-user" />
      </TestWrapper>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
    expect(screen.queryByText('+27123456789')).not.toBeInTheDocument();
    expect(screen.getByText('This profile is private')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseProfile.mockReturnValue({
      profile: null,
      loading: true,
      error: null,
    });

    render(
      <TestWrapper>
        <ProfileView userId="user-123" />
      </TestWrapper>
    );

    expect(screen.getByTestId('profile-loading')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseProfile.mockReturnValue({
      profile: null,
      loading: false,
      error: new Error('Failed to load profile'),
    });

    render(
      <TestWrapper>
        <ProfileView userId="user-123" />
      </TestWrapper>
    );

    expect(screen.getByText('Failed to load profile')).toBeInTheDocument();
  });

  it('shows admin controls for admin users', () => {
    mockUseAuth.mockReturnValue({
      ...mockAuthUser,
      isAdmin: true,
    });

    mockUseProfile.mockReturnValue({
      profile: mockProfile,
      loading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <ProfileView userId="other-user" />
      </TestWrapper>
    );

    expect(screen.getByText('Admin Controls')).toBeInTheDocument();
  });

  it('handles role badges correctly', () => {
    const businessProfile = {
      ...mockProfile,
      role: 'business',
    };

    mockUseProfile.mockReturnValue({
      profile: businessProfile,
      loading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <ProfileView userId="user-123" />
      </TestWrapper>
    );

    expect(screen.getByText('Business')).toBeInTheDocument();
  });
});