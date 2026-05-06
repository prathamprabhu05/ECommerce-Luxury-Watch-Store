import { registerUser, loginUser } from '../../../lib/firebase/auth';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, getDoc } from 'firebase/firestore';

// Mock Firebase modules
jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('../../../lib/firebase/config', () => ({
  auth: {},
  db: {},
}));

describe('Firebase Auth Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const mockUser = { uid: 'test-uid-123' };
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await registerUser('John Doe', 'john@example.com', 'password123');

      expect(createUserWithEmailAndPassword).toHaveBeenCalled();
      expect(setDoc).toHaveBeenCalled();
      expect(result).toEqual({
        uid: 'test-uid-123',
        name: 'John Doe',
        email: 'john@example.com',
        isAdmin: false,
      });
    });

    it('should mark admin@mywatches.in as admin', async () => {
      const mockUser = { uid: 'admin-uid-123' };
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await registerUser('Admin', 'admin@mywatches.in', 'adminpass');

      expect(result.isAdmin).toBe(true);
    });

    it('should handle registration errors', async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(
        new Error('Email already in use')
      );

      await expect(
        registerUser('Test User', 'test@example.com', 'password')
      ).rejects.toThrow('Email already in use');
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      const mockUser = { uid: 'test-uid-123', email: 'john@example.com' };
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ name: 'John Doe', email: 'john@example.com' }),
      });

      const result = await loginUser('john@example.com', 'password123');

      expect(signInWithEmailAndPassword).toHaveBeenCalled();
      expect(result).toEqual({
        uid: 'test-uid-123',
        name: 'John Doe',
        email: 'john@example.com',
        isAdmin: false,
      });
    });

    it('should handle login errors', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(
        new Error('Invalid credentials')
      );

      await expect(
        loginUser('wrong@example.com', 'wrongpass')
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
