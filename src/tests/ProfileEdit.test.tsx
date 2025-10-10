import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProfileEdit from '../components/ProfileEdit';
import { AuthProvider } from '../lib/AuthProvider';

// Mock the hooks and utilities
const mockUseProfileMutations = vi.fn();
const mockUseAuth = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../lib/useProfile', () => ({
  useProfileMutations: () => mockUseProfileMutations(),
}));

vi.mock('../lib/useAuth', () => ({
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
  });

  it('renders form with current profile data', () => {
    render(
      <TestWrapper>
        <ProfileEdit profile={mockProfile} onSave={vi.fn()} onCancel={vi.fn()} />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+27123456789')).toBeInTheDocument();
  });

  it('handles form submission with valid data', async () => {
    const mockOnSave = vi.fn();
    mockMutations.updateProfile.mockResolvedValue(mockProfile);

    render(
      <TestWrapper>
        <ProfileEdit profile={mockProfile} onSave={mockOnSave} onCancel={vi.fn()} />
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

    expect(mockOnSave).toHaveBeenCalledWith(mockProfile);
  });

  it('validates required fields', async () => {
    render(
      <TestWrapper>
        <ProfileEdit profile={mockProfile} onSave={vi.fn()} onCancel={vi.fn()} />
      </TestWrapper>
    );

    fireEvent.change(screen.getByDisplayValue('John'), {
      target: { value: '' }
    });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
    });

    expect(mockMutations.updateProfile).not.toHaveBeenCalled();
  });

  it('validates bio length', async () => {
    render(
      <TestWrapper>
        <ProfileEdit profile={mockProfile} onSave={vi.fn()} onCancel={vi.fn()} />
      </TestWrapper>
    );

    fireEvent.change(screen.getByDisplayValue('Test bio'), {
      target: { value: 'x'.repeat(1001) }
    });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Bio cannot exceed 1000 characters')).toBeInTheDocument();
    });

    expect(mockMutations.updateProfile).not.toHaveBeenCalled();
  });

  it('validates phone number format', async () => {
    render(
      <TestWrapper>
        <ProfileEdit profile={mockProfile} onSave={vi.fn()} onCancel={vi.fn()} />
      </TestWrapper>
    );

    fireEvent.change(screen.getByDisplayValue('+27123456789'), {
      target: { value: 'invalid-phone' }
    });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Invalid phone number format')).toBeInTheDocument();
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
        <ProfileEdit profile={mockProfile} onSave={vi.fn()} onCancel={vi.fn()} />
      </TestWrapper>
    );

    const fileInput = screen.getByLabelText('Upload Avatar');
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
        <ProfileEdit profile={mockProfile} onSave={vi.fn()} onCancel={vi.fn()} />
      </TestWrapper>
    );

    const fileInput = screen.getByLabelText('Upload Avatar');
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
        <ProfileEdit profile={mockProfile} onSave={vi.fn()} onCancel={vi.fn()} />
      </TestWrapper>
    );

    const fileInput = screen.getByLabelText('Upload Avatar');
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText('File too large. Maximum size: 5MB')).toBeInTheDocument();
    });
  });

  it('handles privacy toggle changes', () => {
    render(
      <TestWrapper>
        <ProfileEdit profile={mockProfile} onSave={vi.fn()} onCancel={vi.fn()} />
      </TestWrapper>
    );

    const publicToggle = screen.getByLabelText('Make profile public');
    fireEvent.click(publicToggle);

    expect(publicToggle).not.toBeChecked();
  });

  it('handles cancel action', () => {
    const mockOnCancel = vi.fn();

    render(
      <TestWrapper>
        <ProfileEdit profile={mockProfile} onSave={vi.fn()} onCancel={mockOnCancel} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state during save', async () => {
    mockMutations.updateProfile.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <TestWrapper>
        <ProfileEdit profile={mockProfile} onSave={vi.fn()} onCancel={vi.fn()} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Save Changes'));

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });
});