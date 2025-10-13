import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProfileEdit from '@/pages/ProfileEdit';
import { AuthProvider } from '@/lib/AuthProvider';

// Mock the hooks and utilities
const mockUseProfileMutations = vi.fn();
const mockUseAuth = vi.fn();
const mockNavigate = vi.fn();
const mockValidateProfileData = vi.fn();

vi.mock('@/lib/useProfile', () => {
  const mockValidateProfileData = vi.fn();
  return {
    useProfileMutations: () => mockUseProfileMutations(),
    validateProfileData: mockValidateProfileData,
  };
});

vi.mock('@/lib/useAuth', () => ({
  useAuth: () => mockUseAuth(),
  useAuthContext: () => mockUseAuth(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

const mockMutations = {
  updateProfile: vi.fn(),
  uploadAvatar: vi.fn(),
  deleteAvatar: vi.fn(),
  loading: false,
  error: null,
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

describe('ProfileEdit Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue(mockAuthUser);
    mockUseProfileMutations.mockReturnValue(mockMutations);
    mockValidateProfileData.mockReturnValue([]);
  });

  it('renders form with current profile data', () => {
    render(
      <TestWrapper>
        <ProfileEdit />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+27123456789')).toBeInTheDocument();
  });

  it('handles form submission with valid data', async () => {
    mockMutations.updateProfile.mockResolvedValue(mockProfile);

    render(
      <TestWrapper>
        <ProfileEdit />
      </TestWrapper>
    );

    fireEvent.change(screen.getByDisplayValue('John'), {
      target: { value: 'Jane' }
    });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockMutations.updateProfile).toHaveBeenCalledWith({
        first_name: 'Jane',
        last_name: 'Doe',
        bio: 'Test bio',
        phone: '+27123456789',
        is_public_profile: true,
        show_contact: true,
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  it('validates required fields', async () => {
    mockValidateProfileData.mockReturnValue(['First name must be at least 2 characters long']);

    render(
      <TestWrapper>
        <ProfileEdit />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('First name must be at least 2 characters long')).toBeInTheDocument();
    });

    expect(mockMutations.updateProfile).not.toHaveBeenCalled();
  });

  it('validates bio length', async () => {
    mockValidateProfileData.mockReturnValue(['Bio must be 1000 characters or less']);

    render(
      <TestWrapper>
        <ProfileEdit />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Bio must be 1000 characters or less')).toBeInTheDocument();
    });

    expect(mockMutations.updateProfile).not.toHaveBeenCalled();
  });

  it('validates phone number format', async () => {
    mockValidateProfileData.mockReturnValue(['Phone number must be a valid South African number']);

    render(
      <TestWrapper>
        <ProfileEdit />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Phone number must be a valid South African number')).toBeInTheDocument();
    });

    expect(mockMutations.updateProfile).not.toHaveBeenCalled();
  });

  it('handles avatar upload', async () => {
    const mockFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
    mockMutations.uploadAvatar.mockResolvedValue({
      url: 'https://example.com/new-avatar.jpg'
    });

    render(
      <TestWrapper>
        <ProfileEdit />
      </TestWrapper>
    );

    const fileInput = screen.getByLabelText('Choose Photo');
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(mockMutations.uploadAvatar).toHaveBeenCalledWith(mockFile);
    });
  });

  it('handles avatar upload errors', async () => {
    const mockFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
    mockMutations.uploadAvatar.mockRejectedValue(new Error('Upload failed'));

    render(
      <TestWrapper>
        <ProfileEdit />
      </TestWrapper>
    );

    const fileInput = screen.getByLabelText('Choose Photo');
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument();
    });
  });

  it('validates file size and type', async () => {
    // Test oversized file
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });

    render(
      <TestWrapper>
        <ProfileEdit />
      </TestWrapper>
    );

    const fileInput = screen.getByLabelText('Choose Photo');
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText('Image must be less than 5MB')).toBeInTheDocument();
    });
  });

  it('handles privacy toggle changes', () => {
    render(
      <TestWrapper>
        <ProfileEdit />
      </TestWrapper>
    );

    const publicToggle = screen.getByLabelText('Public Profile');
    fireEvent.click(publicToggle);

    expect(publicToggle).not.toBeChecked();
  });

  it('handles cancel action', () => {
    render(
      <TestWrapper>
        <ProfileEdit />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('shows loading state during save', async () => {
    mockMutations.updateProfile.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <TestWrapper>
        <ProfileEdit />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Save Changes'));

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });
});