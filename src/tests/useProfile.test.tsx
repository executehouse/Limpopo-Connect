import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProfile, useProfileMutations } from '../lib/useProfile';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  })),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      getPublicUrl: vi.fn(),
      remove: vi.fn(),
    })),
  },
};

vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase,
}));

const mockUseAuth = vi.fn();
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

describe('useProfile hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      profile: mockProfile,
      isAuthenticated: true,
    });
  });

  it('fetches profile successfully', async () => {
    const mockSelect = vi.fn().mockResolvedValue({
      data: mockProfile,
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSelect,
        }),
      }),
    });

    const { result } = renderHook(() => useProfile('user-123'));

    expect(result.current.loading).toBe(true);

    // Wait for the async operation
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    expect(result.current.loading).toBe(false);
    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.error).toBe(null);
  });

  it('handles profile fetch error', async () => {
    const mockError = new Error('Profile not found');
    const mockSelect = vi.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSelect,
        }),
      }),
    });

    const { result } = renderHook(() => useProfile('nonexistent'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.profile).toBe(null);
    expect(result.current.error).toEqual(mockError.message);
  });

  it('uses current user ID when no userId provided', async () => {
    const mockSelect = vi.fn().mockResolvedValue({
      data: mockProfile,
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSelect,
        }),
      }),
    });

    renderHook(() => useProfile());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should use the current user's ID from auth context
    expect(mockSelect).toHaveBeenCalled();
  });
});

describe('useProfileMutations hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      profile: mockProfile,
      isAuthenticated: true,
    });
  });

  it('updates profile successfully', async () => {
    // Update succeeds scenario
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn(() => ({ eq: mockEq }));
    mockSupabase.from.mockReturnValue({ update: mockUpdate });

    const { result } = renderHook(() => useProfileMutations());

    await act(async () => {
      await result.current.updateProfile({
        first_name: 'Jane',
        last_name: 'Doe',
      });
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    expect(result.current.error).toBe(null);
  });

  it('handles profile update error', async () => {
    const mockError = new Error('Update failed');
    const mockUpdate = vi.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: mockUpdate,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useProfileMutations());

    await act(async () => {
      try {
        await result.current.updateProfile({ first_name: 'Jane' });
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('uploads avatar successfully', async () => {
    const mockFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
    const mockUpload = vi.fn().mockResolvedValue({ error: null });
    const mockGetPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: 'https://example.com/avatar.jpg' },
    });

    mockSupabase.storage.from.mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    });

    const { result } = renderHook(() => useProfileMutations());

    await act(async () => {
      await result.current.uploadAvatar(mockFile);
    });

    expect(mockSupabase.storage.from).toHaveBeenCalledWith('avatars');
    expect(mockUpload).toHaveBeenCalled();
    expect(mockGetPublicUrl).toHaveBeenCalled();
  });

  it('handles avatar upload error', async () => {
    const mockFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
    const mockError = new Error('Upload failed');
    const mockUpload = vi.fn().mockResolvedValue({ error: mockError });

    mockSupabase.storage.from.mockReturnValue({
      upload: mockUpload,
    });

    const { result } = renderHook(() => useProfileMutations());

    await act(async () => {
      try {
        await result.current.uploadAvatar(mockFile);
      } catch (error) {
        expect((error as Error).message).toEqual('Failed to upload avatar');
      }
    });
  });

  it('deletes avatar successfully', async () => {
    const mockRemove = vi.fn().mockResolvedValue({ error: null });

    mockSupabase.storage.from.mockReturnValue({
      remove: mockRemove,
    });

    const { result } = renderHook(() => useProfileMutations());

    await act(async () => {
      await result.current.deleteAvatar();
    });

    expect(mockSupabase.storage.from).toHaveBeenCalledWith('avatars');
    expect(mockRemove).toHaveBeenCalled();
  });
});