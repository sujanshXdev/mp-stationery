import Wishlist from "../models/wishlist.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

// Get wishlist for the authenticated user
export const getWishlist = catchAsyncErrors(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
  res.status(200).json({
    success: true,
    products: wishlist ? wishlist.products : [],
  });
});

// Add a product to the wishlist
export const addToWishlist = catchAsyncErrors(async (req, res, next) => {
  const { productId } = req.body;
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user._id, products: [] });
  }
  if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }
  res.status(200).json({ success: true, message: "Product added to wishlist" });
});

// Remove a product from the wishlist
export const removeFromWishlist = catchAsyncErrors(async (req, res, next) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (wishlist) {
    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== req.params.productId
    );
    await wishlist.save();
  }
  res.status(200).json({ success: true, message: "Product removed from wishlist" });
}); 