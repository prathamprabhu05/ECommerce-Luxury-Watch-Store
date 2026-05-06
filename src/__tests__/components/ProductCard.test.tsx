import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../../components/ProductCard';

// 1. Mock the custom Image component to avoid path errors
jest.mock('../../components/figma/ImageWithFallback', () => ({
  ImageWithFallback: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} data-testid="product-image" />
  ),
}));

// 2. Mock 'motion/react' to avoid animation issues in the test environment
jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, onClick, onMouseEnter, onMouseLeave }: any) => (
      <div className={className} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        {children}
      </div>
    ),
    button: ({ children, className, onClick, disabled }: any) => (
      <button className={className} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    ),
  },
}));

describe('ProductCard Component', () => {
  // Define mock functions for interactions
  const mockOnAddToCart = jest.fn();
  const mockOnBuyNow = jest.fn();
  const mockOnViewDetails = jest.fn();
  const mockOnToggleWishlist = jest.fn();

  // Define a complete mock product based on your Interface
  const mockProduct = {
    id: 1,
    name: 'Rolex Submariner',
    brand: 'Rolex',
    price: 12000,
    originalPrice: 15000,
    image: 'https://example.com/watch.jpg',
    rating: 4.5,
    reviews: 120,
    stock: 5,
    badge: 'Best Seller',
    isWishlisted: false,
    // Pass the mock functions
    onAddToCart: mockOnAddToCart,
    onBuyNow: mockOnBuyNow,
    onViewDetails: mockOnViewDetails,
    onToggleWishlist: mockOnToggleWishlist,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render product details correctly', () => {
    // We use the spread operator {...mockProduct} to pass props individually
    render(<ProductCard {...mockProduct} />);

    expect(screen.getByText('Rolex Submariner')).toBeInTheDocument();
    expect(screen.getByText('Rolex')).toBeInTheDocument();
    
    // Check for price (using regex to be flexible with currency symbols)
    expect(screen.getByText(/12,000/)).toBeInTheDocument();
    
    // Check for badge
    expect(screen.getByText('Best Seller')).toBeInTheDocument();
  });

  it('should call action buttons when clicked', () => {
    render(<ProductCard {...mockProduct} />);

    // Click Add to Cart
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(mockOnAddToCart).toHaveBeenCalledWith(1);

    // Click Buy Now
    fireEvent.click(screen.getByText('Buy Now'));
    expect(mockOnBuyNow).toHaveBeenCalledWith(1);
  });

  it('should handle out of stock state', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    render(<ProductCard {...outOfStockProduct} />);

    // Check for Out of Stock text
    // The "i" makes it case-insensitive
    expect(screen.getAllByText(/Out of Stock/i).length).toBeGreaterThan(0);

    // Buttons should be disabled
    const addToCartBtn = screen.getByText('Add to Cart').closest('button');
    expect(addToCartBtn).toBeDisabled();
  });

  it('should handle wishlist toggle', () => {
    render(<ProductCard {...mockProduct} />);

    // Since the heart icon might not have text, we can look for the button rendering it
    // Or we can assume it's the 3rd button (Add to cart, Buy now, Wishlist)
    // A safer way is to assume it's the button inside the absolute container
    const buttons = screen.getAllByRole('button');
    // The wishlist button is usually the first one in the DOM order due to absolute positioning at top
    fireEvent.click(buttons[0]); 
    
    expect(mockOnToggleWishlist).toHaveBeenCalledWith(1);
  });

  it('should show low stock warning', () => {
    const lowStockProduct = { ...mockProduct, stock: 2 };
    render(<ProductCard {...lowStockProduct} />);

    expect(screen.getByText(/Only 2 Left in Stock/i)).toBeInTheDocument();
  });
});