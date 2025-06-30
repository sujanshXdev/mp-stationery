import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Product from "../models/product.js";
import ErrorHandler from "../utils/errorHandler.js";
import fs from 'fs';
import path from 'path';

// Get all products => /api/v1/products
export const getProducts = catchAsyncErrors(async (req, res, next) => {
  console.log("Query Parameters:", req.query);
  let query = Product.find();

  // Apply filters if provided
  if (req.query.category)
    query = query.where("category").equals(req.query.category);
  if (req.query.subCategory)
    query = query.where("subCategory").equals(req.query.subCategory);
  if (req.query.academicCategory)
    query = query.where("academicCategory").equals(req.query.academicCategory);
  if (req.query.class) query = query.where("class").equals(req.query.class);

  console.log("MongoDB Query:", query.getQuery());
  const products = await query.exec();
  console.log("Fetched Products:", products);

  res.status(200).json({
    success: true,
    filteredProductsCount: products.length,
    products,
  });
});

// Create a new product => /api/v1/admin/products
export const newProduct = catchAsyncErrors(async (req, res) => {
  const productData = { ...req.body };

  if (req.files && req.files.length > 0) {
    productData.images = req.files.map(file => `uploads/products/${file.filename}`);
  } else if (req.body.images) {
    productData.images = req.body.images;
  } else {
    productData.images = [];
  }

  // Assign the user from the authenticated request
  productData.user = req.user._id;

  const product = await Product.create(productData);

  res.status(201).json({
    success: true,
    product,
  });
});

// Get single product details => /api/v1/products/:id
export const getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// Update product details => /api/v1/admin/products/:id
export const updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    const updateData = { ...req.body };

    // This part handles the image update logic
    // The frontend should send a field 'imagesToKeep' which is a JSON string array of image paths to keep.
    const imagesToKeep = req.body.imagesToKeep ? JSON.parse(req.body.imagesToKeep) : [];
    const currentImages = product.images || [];

    // Identify and delete images that were removed by the user
    const imagesToDelete = currentImages.filter(img => !imagesToKeep.includes(img));
    imagesToDelete.forEach(imagePath => {
        const fullPath = path.resolve(process.cwd(), 'backend', 'public', imagePath);
        fs.unlink(fullPath, (err) => {
            if (err) console.error(`Failed to delete old image: ${fullPath}`, err);
        });
    });

    // Add paths of newly uploaded images
    let newImagePaths = [];
    if (req.files && req.files.length > 0) {
        newImagePaths = req.files.map(file => `uploads/products/${file.filename}`);
    }

    // Combine the lists for the final images array
    updateData.images = [...imagesToKeep, ...newImagePaths];
    
    // Remove the imagesToKeep field from the final update payload as it's not part of the Product model
    delete updateData.imagesToKeep;

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        product,
    });
});

// Delete product => /api/v1/admin/products/:id
export const deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // Deleting images associated with the product
  if (product.images && product.images.length > 0) {
    product.images.forEach(imagePath => {
      const fullPath = path.resolve(process.cwd(), 'backend', 'public', imagePath);
      fs.unlink(fullPath, (err) => {
        if (err) {
          // Log the error but don't block the process
          // The file might already be deleted or path is wrong
          console.error(`Failed to delete image: ${fullPath}`, err);
        }
      });
    });
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product is deleted",
  });
});

// Create/Update product review => /api/v1/reviews
export const createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const isReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get Product Reviews => /api/v1/reviews
export const getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete product review => /api/v1/admin/reviews
export const deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.id.toString()
  );

  const numOfReviews = reviews.length;

  const ratings =
    numOfReviews === 0
      ? 0
      : reviews.reduce((acc, item) => item.rating + acc, 0) / numOfReviews;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
  });
});

// Get best selling products => /api/v1/products/best-sellers
export const getBestSellers = catchAsyncErrors(async (req, res, next) => {
  const bestSellers = await Product.find({ salesCount: { $gt: 0 } })
    .sort({ salesCount: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    products: bestSellers,
  });
});

// Get recently added products => /api/v1/products/recent
export const getRecentProducts = catchAsyncErrors(async (req, res, next) => {
  const limit = Number(req.query.limit) || 8;
  const recentProducts = await Product.find()
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(200).json({
    success: true,
    products: recentProducts,
  });
});
