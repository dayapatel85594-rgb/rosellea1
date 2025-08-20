import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/ProductModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Heavenly Son Edition - Perfect Product Collection
const products = [
  {
    title: "Parisian Silk Blouse",
    description: "Exquisite silk blouse crafted with French elegance. Features mother-of-pearl buttons and delicate pleating that flows beautifully with every movement.",
    price: 4500,
    category: "tops",
    images: [
      "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=600&h=800&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop&auto=format&q=80"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Ivory Pearl", "Blush Rose", "Midnight Navy"],
    material: "100% Mulberry Silk",
    care: "Dry clean only",
    stock: 25,
    isNewArrival: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 34,
    tags: ["elegant", "silk", "parisian", "luxury"]
  },
  {
    title: "Grace Kelly Midi Dress",
    description: "Timeless A-line midi dress inspired by classic Hollywood glamour. Features subtle pleating and a concealed back zipper for effortless sophistication.",
    price: 5800,
    category: "dresses",
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1566479179817-c0c46b1dc79a?w=600&h=800&fit=crop&auto=format&q=80"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Classic Black", "Royal Navy", "Wine Burgundy"],
    material: "Premium Ponte Knit",
    care: "Machine wash cold, hang dry",
    stock: 18,
    isNewArrival: true,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 52,
    tags: ["midi", "aline", "classic", "hollywood"]
  },
  {
    title: "Executive Power Trousers",
    description: "High-waisted tailored trousers designed for the modern woman. Features pressed creases, side pockets, and a flattering silhouette that commands attention.",
    price: 3900,
    category: "pants",
    images: [
      "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=600&h=800&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=800&fit=crop&auto=format&q=80"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Jet Black", "Charcoal Gray", "Camel Tan"],
    material: "Italian Wool Blend",
    care: "Dry clean recommended",
    stock: 22,
    isNewArrival: false,
    isFeatured: true,
    rating: 4.7,
    reviewCount: 28,
    tags: ["highwaisted", "tailored", "executive", "power"]
  },
  {
    title: "Cashmere Dreams Cardigan",
    description: "Luxuriously soft cardigan in premium cashmere blend. Features delicate button closure, ribbed trim, and an embrace-like comfort that defines elegance.",
    price: 5200,
    category: "tops",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=800&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=800&fit=crop&auto=format&q=80"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Cloud Cream", "Dove Gray", "Dusty Rose"],
    material: "70% Cashmere, 30% Merino Wool",
    care: "Hand wash or dry clean",
    stock: 16,
    isNewArrival: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 33,
    tags: ["cashmere", "luxury", "comfort", "premium"]
  },
  {
    title: "Garden Party Wrap Dress",
    description: "Feminine wrap dress adorned with delicate botanical prints. Features adjustable tie waist and flowing sleeves that dance with every step.",
    price: 4200,
    category: "dresses",
    images: [
      "https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?w=600&h=800&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop&auto=format&q=80"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Rose Garden", "Lavender Fields", "Sage Meadow"],
    material: "Silk Chiffon",
    care: "Dry clean only",
    stock: 14,
    isNewArrival: true,
    isFeatured: false,
    rating: 4.6,
    reviewCount: 21,
    tags: ["floral", "wrap", "feminine", "garden"]
  },
  {
    title: "Palazzo Goddess Pants",
    description: "Wide-leg palazzo pants that flow like liquid silk. Perfect for both casual elegance and sophisticated evening affairs.",
    price: 3200,
    category: "pants",
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1506629905607-d405d7d3b0d2?w=600&h=800&fit=crop&auto=format&q=80"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Midnight Black", "Ivory Cream", "Terracotta Sunset"],
    material: "Viscose Blend",
    care: "Machine wash gentle",
    stock: 20,
    isNewArrival: false,
    isFeatured: true,
    rating: 4.5,
    reviewCount: 18,
    tags: ["palazzo", "wideleg", "flowing", "goddess"]
  },
  {
    title: "CEO Power Blazer",
    description: "Structured blazer with sharp shoulders and impeccable tailoring. The ultimate power piece for the woman who leads with confidence and style.",
    price: 6800,
    category: "tops",
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&auto=format&q=80"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Power Black", "Executive Navy", "Charcoal Authority"],
    material: "Italian Wool Suiting",
    care: "Dry clean only",
    stock: 12,
    isNewArrival: false,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 41,
    tags: ["blazer", "power", "executive", "authority"]
  },
  {
    title: "Bohemian Rhapsody Maxi",
    description: "Free-spirited maxi dress with intricate hand-embroidered details. A celebration of artisanal craftsmanship and bohemian elegance.",
    price: 4800,
    category: "dresses",
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1583846112692-f2b6b8e8b6b8?w=600&h=800&fit=crop&auto=format&q=80"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Sunset Amber", "Ocean Teal", "Wine Velvet"],
    material: "Cotton Voile with Embroidery",
    care: "Hand wash cold",
    stock: 8,
    isNewArrival: true,
    isFeatured: false,
    rating: 4.7,
    reviewCount: 26,
    tags: ["bohemian", "maxi", "embroidery", "artisanal"]
  },
  {
    title: "Minimalist Turtleneck",
    description: "Essential turtleneck in premium organic cotton. Clean lines and perfect fit make this a wardrobe staple for the conscious fashionista.",
    price: 2800,
    category: "tops",
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=800&fit=crop&auto=format&q=80"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Pure White", "Charcoal Black", "Oatmeal Beige"],
    material: "100% Organic Cotton",
    care: "Machine wash cold",
    stock: 30,
    isNewArrival: false,
    isFeatured: false,
    rating: 4.4,
    reviewCount: 67,
    tags: ["minimalist", "essential", "organic", "staple"]
  },
  {
    title: "Evening Goddess Gown",
    description: "Breathtaking evening gown that flows like liquid moonlight. Features delicate beading and a silhouette that celebrates feminine grace.",
    price: 8900,
    category: "dresses",
    images: [
      "https://images.unsplash.com/photo-1566479179817-c0c46b1dc79a?w=600&h=800&fit=crop&auto=format&q=80"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Midnight Black", "Champagne Gold", "Deep Emerald"],
    material: "Silk Satin with Beading",
    care: "Professional dry clean only",
    stock: 5,
    isNewArrival: true,
    isFeatured: true,
    rating: 5.0,
    reviewCount: 12,
    tags: ["evening", "gown", "goddess", "luxury"]
  },
  {
    title: "Cropped Denim Jacket",
    description: "Modern take on the classic denim jacket. Cropped silhouette with premium Japanese denim and rose gold hardware details.",
    price: 3600,
    category: "tops",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&auto=format&q=80"
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Classic Blue", "Vintage Black", "Stone Wash"],
    material: "Japanese Premium Denim",
    care: "Machine wash cold, air dry",
    stock: 24,
    isNewArrival: false,
    isFeatured: false,
    rating: 4.3,
    reviewCount: 89,
    tags: ["denim", "cropped", "modern", "casual"]
  }
];

const seedProducts = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    const deleteResult = await Product.deleteMany({});
    console.log(`🗑️ Cleared ${deleteResult.deletedCount} existing products`);

    // Insert divine products
    const result = await Product.insertMany(products);
    console.log(`✅ Successfully seeded ${result.length} perfect products`);
    
    // Log collection statistics
    console.log('📊 Heavenly Son Collection:');
    console.log(`   Total Products: ${result.length}`);
    console.log(`   New Arrivals: ${result.filter(p => p.isNewArrival).length}`);
    console.log(`   Featured Items: ${result.filter(p => p.isFeatured).length}`);
    console.log('🎉 Perfect product collection is live!');

    // Close connection
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    console.log('🎉 Seeding completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Always run seeding when this script is executed
console.log('✨ Heavenly Son Edition - Product Seeding...');
seedProducts();

export default seedProducts;
