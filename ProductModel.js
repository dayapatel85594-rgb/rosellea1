import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxLength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxLength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative']
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: {
        values: ['tops', 'dresses', 'pants', 'accessories'],
        message: 'Category must be one of: tops, dresses, pants, accessories'
      },
      lowercase: true
    },
    images: [
      {
        type: String,
        required: true
      }
    ],
    sizes: [
      {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']
      }
    ],
    colors: [
      {
        type: String,
        trim: true
      }
    ],
    material: {
      type: String,
      trim: true
    },
    care: {
      type: String,
      trim: true
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    isNewArrival: {
      type: Boolean,
      default: false
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ]
  },
  {
    timestamps: true
  }
);

// Optimized indexes for query performance
productSchema.index({ isActive: 1, category: 1 }); // Most common query pattern
productSchema.index({ isActive: 1, isNewArrival: 1, createdAt: -1 }); // New arrivals with sorting
productSchema.index({ isActive: 1, isFeatured: 1, rating: -1 }); // Featured products by rating
productSchema.index({ category: 1, isActive: 1, price: 1 }); // Category with price sorting
productSchema.index({ price: 1, isActive: 1 }); // Price range queries
productSchema.index({ createdAt: -1, isActive: 1 }); // Recent products
productSchema.index({ title: 'text', description: 'text', tags: 'text' }, { 
  weights: { title: 10, tags: 5, description: 1 } // Weighted text search
});

// Pre-save validation and data consistency
productSchema.pre('save', function(next) {
  // Ensure at least one image
  if (!this.images || this.images.length === 0) {
    return next(new Error('Product must have at least one image'));
  }
  
  // Validate price is positive
  if (this.price <= 0) {
    return next(new Error('Product price must be greater than 0'));
  }
  
  // Ensure stock is not negative
  if (this.stock < 0) {
    this.stock = 0;
  }
  
  // Auto-generate tags from title and category if empty
  if (!this.tags || this.tags.length === 0) {
    this.tags = [
      this.category,
      ...this.title.toLowerCase().split(' ').filter(word => word.length > 2)
    ];
  }
  
  next();
});

// Static method to find active products with optimized query
productSchema.statics.findActive = function(filters = {}) {
  return this.find({ ...filters, isActive: true });
};

// Static method for category-based queries
productSchema.statics.findByCategory = function(category, options = {}) {
  const query = { category: category.toLowerCase(), isActive: true };
  return this.find(query, null, options);
};

// Instance method to check if product is available
productSchema.methods.isAvailable = function() {
  return this.isActive && this.stock > 0;
};

export default mongoose.model('Product', productSchema);
