import { getAllProducts } from '../../lib/products';
// We mock the SOURCE of the re-export
import * as firestoreModule from '../../lib/firebase/firestore';
// We mock the SOURCE of the re-export
jest.mock('../../lib/firebase/firestore', () => ({
  getAllProducts: jest.fn(),
}));

describe('Products Library', () => {
  const mockData = [
    {
      id: 1,
      name: 'Rolex Submariner',
      price: 12000,
      stock: 5,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully fetch all products via re-export', async () => {
    // Setup the mock on the original firestore module
    (firestoreModule.getAllProducts as jest.Mock).mockResolvedValue(mockData);

    // Call the function from your lib/products file
    const result = await getAllProducts();

    // Verify it returned the data
    expect(result).toEqual(mockData);
    // Verify it called the underlying firestore function
    expect(firestoreModule.getAllProducts).toHaveBeenCalled();
  });
});
