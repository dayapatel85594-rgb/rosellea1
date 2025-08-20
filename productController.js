import Product from '../models/ProductModel.js';
import mongoose from 'mongoose';
import { URL } from 'url';

// Search products by text query
export const searchProducts = async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${process.env.PORT || 5000}`);
    const q = url.searchParams.get('q');
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 12;
    const skip = (page - 1) * limit;

    if (!q || q.trim().length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Query parameter q is required' }));
    }

    const filters = { isActive: true, $text: { $search: q } };

    let [products, total] = await Promise.all([
      Product.find(filters)
        .select('title description price category images sizes colors material stock isNewArrival isFeatured rating reviewCount')
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filters)
    ]);
    products = products.map(p => ({ ...p, image: (p.images && p.images[0]) || '' }));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      count: products.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      products
    }));
  } catch (error) {
    console.error('Search products error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Failed to search products' }));
  }
};

// Get all products with filters
export const getProducts = async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${process.env.PORT || 5000}`);
    const params = url.searchParams;

    const category = params.get('category');
    const newArrivals = params.get('newArrivals') === 'true' || params.get('isNewArrival') === 'true';
    const featured = params.get('featured') === 'true';
    const search = params.get('search');
    const page = parseInt(params.get('page')) || 1;
    const limit = parseInt(params.get('limit')) || 12;
    const sort = params.get('sort') || '-createdAt';

    // Build optimized query
    const query = { isActive: true };

    if (category) query.category = category.toLowerCase();
    if (newArrivals) query.isNewArrival = true;
    if (featured) query.isFeatured = true;
    if (search) {
      query.$text = { $search: search };
    }

    // Execute optimized query with pagination
    const skip = (page - 1) * limit;

    // Use lean() for better performance when we don't need full Mongoose documents
    let [products, total] = await Promise.all([
      Product.find(query)
        .select('title description price category images sizes colors material stock isNewArrival isFeatured rating reviewCount')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);
    products = products.map(p => ({ ...p, image: (p.images && p.images[0]) || '' }));
    const totalPages = Math.ceil(total / limit);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      count: products.length,
      totalPages,
      currentPage: page,
      products
    }));
  } catch (error) {
    console.error('Get products error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: 'Failed to fetch products'
    }));
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const productId = req.url.split('/').pop();

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        message: 'Invalid product ID format'
      }));
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true
    }).lean(); // Use lean() for better performance

    if (!product) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        message: 'Product not found'
      }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: { ...product, image: (product.images && product.images[0]) || '' }
    }));
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: 'Failed to fetch product'
    }));
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const urlParts = req.url.split('/category/')[1];
    if (!urlParts) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        message: 'Category is required'
      }));
    }

    const category = urlParts.split('?')[0]; // Extract category before query params

    if (!category) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        message: 'Category is required'
      }));
    }

    const url = new URL(req.url, `http://localhost:${process.env.PORT || 5000}`);
    const params = url.searchParams;
    const page = parseInt(params.get('page')) || 1;
    const limit = parseInt(params.get('limit')) || 12;
    const sort = params.get('sort') || '-createdAt';

    const skip = (page - 1) * limit;

    // Use the optimized static method
    let [products, total] = await Promise.all([
      Product.findByCategory(category, {
        sort,
        skip,
        limit,
        lean: true,
        select: 'title description price category images sizes colors material stock isNewArrival isFeatured rating reviewCount'
      }),
      Product.countDocuments({ category: category.toLowerCase(), isActive: true })
    ]);
    products = products.map(p => ({ ...p, image: (p.images && p.images[0]) || '' }));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      count: products.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      category,
      products
    }));
  } catch (error) {
    console.error('Get products by category error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: 'Failed to fetch products by category'
    }));
  }
};
