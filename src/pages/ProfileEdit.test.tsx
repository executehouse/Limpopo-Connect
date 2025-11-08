import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProfileEdit from './ProfileEdit';
import { AuthProvider } from '../lib/AuthProvider';
import { BrowserRouter } from 'react-router-dom';

// Mock the hooks
vi.mock('../lib/useProfile', () => ({
  useProfileMutations: () => ({
    updateProfile: vi.fn(),
    uploadAvatar: vi.fn(),
    deleteAvatar: vi.fn(),
    loading: false,
    error: null
  }),
  validateProfileData: vi.fn(() => [])
}));

vi.mock('../lib/AuthProvider', () => ({
  useAuthContext: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    profile: {
      id: 'test-user',
      first_name: 'John',
      last_name: 'Doe',
      email: 'test@example.com',
      role: 'citizen',
      is_public_profile: true,
      bio: 'Test bio',
      phone: '+27123456789',
      avatar_url: null,
      show_contact: true,
      created_at: new Date().toISOString()
    },
    refreshProfile: vi.fn()
  })
}));

const renderProfileEdit = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ProfileEdit />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('ProfileEdit Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the profile edit form', () => {
    renderProfileEdit();

    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderProfileEdit();

    const firstNameInput = screen.getByLabelText('First Name *');
    const lastNameInput = screen.getByLabelText('Last Name *');

    // Clear required fields
    fireEvent.change(firstNameInput, { target: { value: '' } });
    fireEvent.change(lastNameInput, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('First name must be at least 2 characters long')).toBeInTheDocument();
      expect(screen.getByText('Last name must be at least 2 characters long')).toBeInTheDocument();
    });
  });

  it('validates phone number format', async () => {
    renderProfileEdit();

    const phoneInput = screen.getByLabelText('Phone');
    fireEvent.change(phoneInput, { target: { value: 'invalid-phone' } });

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Phone number must be a valid South African number')).toBeInTheDocument();
    });
  });

  it('validates bio length', async () => {
    renderProfileEdit();

    const bioTextarea = screen.getByLabelText('Bio');
    const longBio = 'a'.repeat(1001);
    fireEvent.change(bioTextarea, { target: { value: longBio } });

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Bio must be 1000 characters or less')).toBeInTheDocument();
    });
  });

  it('shows character count for bio', () => {
    renderProfileEdit();

    const bioTextarea = screen.getByLabelText('Bio');
    fireEvent.change(bioTextarea, { target: { value: 'Test bio content' } });

    expect(screen.getByText('17/1000 characters')).toBeInTheDocument();
  });

  it('handles avatar upload', async () => {
    const mockUploadAvatar = vi.fn().mockResolvedValue('new-avatar-url');
    vi.mocked(require('../lib/useProfile').useProfileMutations).mockReturnValue({
      updateProfile: vi.fn(),
      uploadAvatar: mockUploadAvatar,
      deleteAvatar: vi.fn(),
      loading: false,
      error: null
    });

    renderProfileEdit();

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText('Upload new avatar');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockUploadAvatar).toHaveBeenCalledWith(file);
    });
  });

  it('validates avatar file type', async () => {
    renderProfileEdit();

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText('Upload new avatar');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('File must be an image')).toBeInTheDocument();
    });
  });

  it('validates avatar file size', async () => {
    renderProfileEdit();

    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText('Upload new avatar');
    fireEvent.change(input, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText('Image must be less than 5MB')).toBeInTheDocument();
    });
  });

  it('handles form submission with valid data', async () => {
    const mockUpdateProfile = vi.fn().mockResolvedValue(undefined);
    vi.mocked(require('../lib/useProfile').useProfileMutations).mockReturnValue({
      updateProfile: mockUpdateProfile,
      uploadAvatar: vi.fn(),
      deleteAvatar: vi.fn(),
      loading: false,
      error: null
    });

    renderProfileEdit();

    const firstNameInput = screen.getByLabelText('First Name *');
    const lastNameInput = screen.getByLabelText('Last Name *');
    const phoneInput = screen.getByLabelText('Phone');
    const bioTextarea = screen.getByLabelText('Bio');

    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
    fireEvent.change(phoneInput, { target: { value: '+27123456789' } });
    fireEvent.change(bioTextarea, { target: { value: 'Updated bio' } });

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+27123456789',
        bio: 'Updated bio'
      });
    });
  });

  it('displays success message after successful update', async () => {
    const mockUpdateProfile = vi.fn().mockResolvedValue(undefined);
    vi.mocked(require('../lib/useProfile').useProfileMutations).mockReturnValue({
      updateProfile: mockUpdateProfile,
      uploadAvatar: vi.fn(),
      deleteAvatar: vi.fn(),
      loading: false,
      error: null
    });

    renderProfileEdit();

    const firstNameInput = screen.getByLabelText('First Name *');
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });
  });

  it('displays error message on update failure', async () => {
    const mockUpdateProfile = vi.fn().mockRejectedValue(new Error('Update failed'));
    vi.mocked(require('../lib/useProfile').useProfileMutations).mockReturnValue({
      updateProfile: mockUpdateProfile,
      uploadAvatar: vi.fn(),
      deleteAvatar: vi.fn(),
      loading: false,
      error: null
    });

    renderProfileEdit();

    const firstNameInput = screen.getByLabelText('First Name *');
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('handles keyboard navigation for avatar upload', () => {
    renderProfileEdit();

    const uploadButton = screen.getByLabelText('Upload new avatar');
    uploadButton.focus();

    expect(document.activeElement).toBe(uploadButton);
  });

  it('shows loading state during submission', async () => {
    vi.mocked(require('../lib/useProfile').useProfileMutations).mockReturnValue({
      updateProfile: vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100))),
      uploadAvatar: vi.fn(),
      deleteAvatar: vi.fn(),
      loading: true,
      error: null
    });

    renderProfileEdit();

    const submitButton = screen.getByRole('button', { name: /saving/i });
    expect(submitButton).toBeDisabled();
  });
});
