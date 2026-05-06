// src/lib/products.ts

// Export the function from firestore
export { getAllProducts } from './firebase/firestore';

// Export the Type directly from the source (the types file)
// We assume 'types.ts' is in the same folder as this file (src/lib/types.ts)
export type { Product } from './types';