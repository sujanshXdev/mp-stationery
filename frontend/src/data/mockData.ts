import { FiBook, FiEdit3, FiGift, FiTarget } from 'react-icons/fi';

// =================================================================
// TYPE DEFINITIONS
// =================================================================

// Product-related types from ProductDetail.tsx and Home.tsx
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  subCategory?: string;
  academicCategory?: string;
  class?: string;
  rating?: number;
  salesCount?: number;
  createdAt?: string;
  priceToSell?: number;
  marketPrice?: number;
  unitType?: 'Packet' | 'Piece';
  pricePerPacket?: number;
  pricePerPiece?: number;
}

export interface Category {
  id: number;
  name: string;
  image: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

// Order-related types from OrderDetail.tsx
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  returnable?: boolean;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Delivered' | 'Processing' | 'Cancelled';
  items: OrderItem[];
}

// Cart-related types from Cart.tsx
export interface CartItem {
  cartItemId: string;
  id: string;
  image: string;
  name: string;
  price: number;
  quantity: number;
  unitType?: 'Packet' | 'Piece' | undefined;
  category: string;
  pricePerPiece?: number;
  pricePerPacket?: number;
  priceToSell?: number;
  marketPrice?: number;
}

// =================================================================
// MOCK DATA
// =================================================================

// From Shop.tsx and ProductDetail.tsx
export const mockProducts: Product[] = [
  { id: '1', images: ['/stationery.jpg', '/gallery1.jpg', '/gallery2.jpg'], name: 'Elegant Fountain Pen', description: 'Smooth writing experience with a timeless design.', price: 24.99, category: 'Stationery' },
  { id: '2', images: ['/stationery.jpg', '/gallery1.jpg', '/gallery2.jpg'], name: 'Leather Notebook', description: 'Premium leather-bound notebook for your thoughts.', price: 19.99, category: 'Stationery' },
  { id: '3', images: ['/gifts.jpg', '/gallery1.jpg', '/gallery2.jpg'], name: 'Gift Set', description: 'Perfect stationery gift set for any occasion.', price: 34.99, category: 'Gift' },
  { id: '4', images: ['/sports.jpg', '/gallery1.jpg', '/gallery2.jpg'], name: 'Sports Water Bottle', description: 'Stay hydrated with this durable bottle.', price: 14.99, category: 'Sport' },
  { id: '5', images: ['/books.jpg', '/gallery1.jpg', '/gallery2.jpg'], name: 'Bestseller Novel', description: 'A gripping tale of adventure and mystery.', price: 29.99, category: 'Book', subCategory: 'Non-Academic' },
  { id: '6', images: ['/stationery.jpg', '/gallery1.jpg', '/gallery2.jpg'], name: 'Calligraphy Pen Set', description: 'Perfect for creating beautiful handwritten notes.', price: 22.99, category: 'Stationery' },
  { id: '7', images: ['/books.jpg', '/gallery1.jpg', '/gallery2.jpg'], name: 'Historical Epic', description: 'A journey through ancient Nepal.', price: 39.99, category: 'Book', subCategory: 'Non-Academic' },
  { id: '8', images: ['/gifts.jpg', '/gallery1.jpg', '/gallery2.jpg'], name: 'Handcrafted Mug', description: 'Ceramic mug with Nepali motifs.', price: 15.99, category: 'Gift' },
  { id: '9', images: ['/sports.jpg', '/gallery1.jpg', '/gallery2.jpg'], name: 'Hiking Backpack', description: 'Durable backpack for Himalayan trails.', price: 49.99, category: 'Sport' },
  { id: '10', images: ['/stationery.jpg', '/gallery1.jpg', '/gallery2.jpg'], name: 'Sketchbook', description: 'High-quality paper for artists.', price: 12.79, category: 'Stationery' },
  { id: '11', images: ['/books.jpg', '/gallery1.jpg', '/gallery2.jpg'], name: 'Poetry Collection', description: 'Verses inspired by the Himalayas.', price: 18.99, category: 'Book', subCategory: 'Non-Academic' },
  { id: '12', images: ['/books.jpg', '/gallery1.jpg', '/gallery2.jpg'], name: 'Physics Textbook', description: 'Comprehensive physics for high school.', price: 45.00, category: 'Book', subCategory: 'Academic', academicCategory: 'Science', class: '11' },
  { id: '13', images: ['/books.jpg', '/gallery1.jpg', '/gallery2.jpg'], name: 'Management Textbook', description: 'Business management for grade 12.', price: 42.50, category: 'Book', subCategory: 'Academic', academicCategory: 'Management', class: '12' },
  { id: '14', images: ['/books.jpg', '/gallery1.jpg', '/gallery2.jpg'], name: 'Hotel Management Guide', description: 'Hospitality curriculum for grade 11.', price: 38.00, category: 'Book', subCategory: 'Academic', academicCategory: 'Hotel Management', class: '11' },
];

// From Home.tsx
export const categories: Category[] = [
  {
    id: 1,
    name: 'Books',
    image: '/books.jpg',
    description: 'Explore captivating stories and educational texts for all ages.',
    buttonText: 'Explore Books',
    buttonLink: '/shop?category=Book',
    icon: FiBook,
    gradient: 'bg-gradient-to-br from-blue-900/70 via-indigo-800/50 to-purple-900/70',
  },
  {
    id: 2,
    name: 'Stationery',
    image: '/stationery.jpg',
    description: 'High-quality pens, notebooks, and supplies for your creative and professional needs.',
    buttonText: 'Shop Stationery',
    buttonLink: '/shop?category=Stationery',
    icon: FiEdit3,
    gradient: 'bg-gradient-to-br from-red-900/70 via-rose-800/50 to-pink-900/70',
  },
  {
    id: 3,
    name: 'Gifts',
    image: '/gifts.jpg',
    description: 'Find the perfect present for any occasion, from elegant sets to unique trinkets.',
    buttonText: 'Find Gifts',
    buttonLink: '/shop?category=Gifts',
    icon: FiGift,
    gradient: 'bg-gradient-to-br from-amber-900/70 via-yellow-800/50 to-orange-900/70',
  },
  {
    id: 4,
    name: 'Sports',
    image: '/sports.jpg',
    description: 'Top-quality gear for your athletic and outdoor adventures.',
    buttonText: 'Shop Sports Gear',
    buttonLink: '/shop?category=Sports',
    icon: FiTarget,
    gradient: 'bg-gradient-to-br from-green-900/70 via-emerald-800/50 to-teal-900/70',
  },
];

// From Cart.tsx
export const initialCartItems: CartItem[] = [
  { cartItemId: 'mock-cart-1', id: '1', image: '/stationery.jpg', name: 'Elegant Fountain Pen', price: 24.99, quantity: 2, category: 'Stationery' },
  { cartItemId: 'mock-cart-2', id: '3', image: '/gifts.jpg', name: 'Gift Set', price: 34.99, quantity: 1, category: 'Gift' },
];

// From OrderDetail.tsx
export const mockOrders: Order[] = [
  {
    id: 'ORD001',
    date: '2025-06-15',
    total: 59.98,
    status: 'Delivered',
    items: [
      { id: '1', name: 'Elegant Fountain Pen', quantity: 2, price: 24.99, image: '/stationery.jpg', returnable: true },
      { id: '2', name: 'Leather Notebook', quantity: 1, price: 19.99, image: '/stationery.jpg', returnable: false },
    ],
  },
  {
    id: 'ORD002',
    date: '2025-06-10',
    total: 34.99,
    status: 'Processing',
    items: [{ id: '3', name: 'Gift Set', quantity: 1, price: 34.99, image: '/gifts.jpg', returnable: true }],
  },
]; 