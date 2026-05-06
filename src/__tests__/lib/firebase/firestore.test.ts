import { addAddress, getAddresses, addPaymentCard, getPaymentCards } from '../../../lib/firebase/firestore';
import { setDoc, getDocs, query, collection, where } from 'firebase/firestore';

jest.mock('firebase/firestore');
jest.mock('../../../lib/firebase/config', () => ({
  db: {},
}));
jest.mock('../../../lib/crypto', () => ({
  encryptData: jest.fn((data) => Promise.resolve(`encrypted_${data}`)),
  decryptData: jest.fn((data) => Promise.resolve(data.replace('encrypted_', ''))),
}));

describe('Firestore Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Address Operations', () => {
    it('should add address successfully', async () => {
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const address = {
        label: 'Home',
        street: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
      };

      const result = await addAddress('user-123', address);

      expect(setDoc).toHaveBeenCalled();
      expect(result).toMatchObject(address);
      expect(result.id).toBeDefined();
    });

    it('should get addresses for user', async () => {
      const mockAddresses = [
        {
          id: 'addr_1',
          data: () => ({
            label: 'Home',
            street: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
            createdAt: new Date(),
          }),
        },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (callback: any) => mockAddresses.forEach(callback),
      });

      const addresses = await getAddresses('user-123');

      expect(getDocs).toHaveBeenCalled();
      expect(addresses).toHaveLength(1);
      expect(addresses[0].label).toBe('Home');
    });

    it('should return empty array for invalid userId', async () => {
      const addresses = await getAddresses('');
      expect(addresses).toEqual([]);
    });
  });

  describe('Payment Card Operations', () => {
    it('should add payment card with encryption', async () => {
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const card = {
        type: 'Visa',
        cardNumber: '4111111111111111',
        cvv: '123',
        cardHolder: 'John Doe',
        expiryMonth: '12',
        expiryYear: '2025',
        lastFour: '1111',
      };

      const result = await addPaymentCard('user-123', card);

      expect(setDoc).toHaveBeenCalled();
      expect(result).toMatchObject({
        type: 'Visa',
        cardHolder: 'John Doe',
        lastFour: '1111',
      });
    });

    it('should throw error for invalid userId', async () => {
      const card = {
        type: 'Visa',
        cardNumber: '4111111111111111',
        cvv: '123',
        cardHolder: 'John Doe',
        expiryMonth: '12',
        expiryYear: '2025',
        lastFour: '1111',
      };

      await expect(addPaymentCard('', card)).rejects.toThrow('Invalid user ID');
    });

    it('should get payment cards with decryption', async () => {
      const mockCards = [
        {
          id: 'card_1',
          data: () => ({
            type: 'Visa',
            lastFour: '1111',
            cardHolder: 'John Doe',
            expiryMonth: '12',
            expiryYear: '2025',
            encryptedCardNumber: 'encrypted_4111111111111111',
            encryptedCVV: 'encrypted_123',
            createdAt: new Date(),
          }),
        },
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        docs: mockCards,
      });

      const cards = await getPaymentCards('user-123');

      expect(getDocs).toHaveBeenCalled();
      expect(cards).toHaveLength(1);
      expect(cards[0].type).toBe('Visa');
    });
  });
});
