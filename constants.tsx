
import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Midnight Silk Wrap Dress',
    price: 15750.00,
    category: 'Dresses',
    description: 'A luxurious midnight blue silk wrap dress perfect for evening events.',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=800',
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 12
  },
  {
    id: '2',
    name: 'Cloud Cashmere Sweater',
    price: 20350.00,
    category: 'Knitwear',
    description: 'Ultra-soft sustainable cashmere in a relaxed, modern silhouette.',
    image: 'https://images.pexels.com/photos/10084173/pexels-photo-10084173.jpeg?auto=format&fit=crop&q=80&w=800',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 8
  },
  {
    id: '3',
    name: 'Oatmeal Linen Blazer',
    price: 12900.00,
    category: 'Outerwear',
    description: 'Breathable European linen tailored to perfection for a sophisticated summer look.',
    image: 'https://images.pexels.com/photos/19531045/pexels-photo-19531045.jpeg?auto=format&fit=crop&q=80&w=800',
    sizes: ['S', 'M', 'L'],
    stock: 15
  },
  {
    id: '4',
    name: 'High-Waist Wide Trousers',
    price: 9950.00,
    category: 'Bottoms',
    description: 'High-waisted pleated trousers that combine comfort with office-ready style.',
    image: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&q=80&w=800',
    sizes: ['24', '26', '28', '30'],
    stock: 20
  },
  {
    id: '5',
    name: 'Shadow Denim Jacket',
    price: 7400.00,
    category: 'Outerwear',
    description: 'Timeless denim jacket with a soft, broken-in feel and classic detailing.',
    image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&q=80&w=800',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 5
  },
  {
    id: '6',
    name: 'Garden Chiffon Skirt',
    price: 6250.00,
    category: 'Skirts',
    description: 'Lightweight floral chiffon skirt with a delicate side slit.',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800',
    sizes: ['S', 'M', 'L'],
    stock: 10
  },
  {
    id: '7',
    name: 'Evening Satin Slip',
    price: 9150.00,
    category: 'Dresses',
    description: 'Elegant champagne satin slip dress with adjustable straps.',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800',
    sizes: ['XS', 'S', 'M'],
    stock: 7
  },
  {
    id: '8',
    name: 'Heritage Wool Pea Coat',
    price: 26550.00,
    category: 'Outerwear',
    description: 'Heavyweight wool blend coat designed for extreme warmth and sharp aesthetics.',
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=800',
    sizes: ['M', 'L', 'XL'],
    stock: 4
  },
  {
    id: '9',
    name: 'Ribbed Merino Turtleneck',
    price: 11200.00,
    category: 'Knitwear',
    description: 'Finely knit merino wool turtleneck that layers perfectly.',
    image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&q=80&w=800',
    sizes: ['S', 'M', 'L'],
    stock: 25
  },
  {
    id: '10',
    name: 'Pure Linen White Shirt',
    price: 7050.00,
    category: 'Bottoms',
    description: 'Casual yet refined linen shirt in a crisp white finish.',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 18
  },
  {
    id: '11',
    name: 'Emerald Velvet Skirt',
    price: 7900.00,
    category: 'Skirts',
    description: 'Rich emerald velvet skirt with architectural pleats.',
    image: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&q=80&w=800',
    sizes: ['S', 'M'],
    stock: 6
  },
  {
    id: '12',
    name: 'Artisan Cable Cardigan',
    price: 16200.00,
    category: 'Knitwear',
    description: 'Hand-finished chunky cable knit cardigan in cream.',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=800',
    sizes: ['S', 'M', 'L'],
    stock: 9
  }
];

export const CATEGORIES = ['All', 'Dresses', 'Knitwear', 'Outerwear', 'Bottoms', 'Skirts'];
