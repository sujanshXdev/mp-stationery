import Cart from "../models/cart.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import Product from "../models/product.js";

// Get cart for the authenticated user
export const getCart = catchAsyncErrors(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("products.product");
  res.status(200).json({
    success: true,
    products: cart ? cart.products : [],
  });
});

// Add a product to the cart
export const addToCart = catchAsyncErrors(async (req, res, next) => {
  const { productId, quantity, unitType } = req.body;

  // For books, unitType should not be provided
  const product = await Product.findById(productId);
  if (product.category === 'Book' && unitType) {
    return next(new ErrorHandler("Unit type cannot be specified for books", 400));
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, products: [] });

  const findCondition = (p) => {
    if (product.category === 'Book') {
      return p.product.toString() === productId;
    }
    return p.product.toString() === productId && p.unitType === unitType;
  };

  const idx = cart.products.findIndex(findCondition);

  if (idx > -1) {
    cart.products[idx].quantity += quantity;
  } else {
    const cartItem = { product: productId, quantity };
    if (product.category !== 'Book') {
      cartItem.unitType = unitType;
    }
    cart.products.push(cartItem);
  }
  await cart.save();
  res.status(200).json({ success: true, message: "Product added/updated in cart" });
});

// Update a cart item
export const updateCartItem = catchAsyncErrors(async (req, res, next) => {
  const { quantity, unitType } = req.body;
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ErrorHandler('Cart not found', 404));
  }

  const itemIndex = cart.products.findIndex((p) => p._id.toString() === itemId);
  if (itemIndex === -1) {
    return next(new ErrorHandler('Cart item not found', 404));
  }

  // If only quantity is provided, update it.
  if (quantity !== undefined && unitType === undefined) {
    cart.products[itemIndex].quantity = quantity;
  }

  // If unitType is provided, handle the logic for merging or updating.
  if (unitType) {
    const currentItem = cart.products[itemIndex];
    const product = await Product.findById(currentItem.product);

    if (product.category === 'Book') {
      return next(new ErrorHandler('Cannot change unit type for a book', 400));
    }

    // Check if another item with the same product ID and new unit type exists.
    const existingItemIndex = cart.products.findIndex(
      (p) =>
        p.product.toString() === currentItem.product.toString() &&
        p.unitType === unitType
    );

    if (existingItemIndex > -1 && existingItemIndex !== itemIndex) {
      // If it exists and is a different item, merge quantities and remove the old item.
      cart.products[existingItemIndex].quantity += currentItem.quantity;
      cart.products.splice(itemIndex, 1);
    } else {
      // Otherwise, just update the unit type of the current item.
      cart.products[itemIndex].unitType = unitType;
    }
  }
  
  await cart.save();
  res.status(200).json({ success: true, message: 'Cart item updated' });
});

// Remove a product from the cart
export const removeCartItem = catchAsyncErrors(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.products = cart.products.filter(
      (p) => p._id.toString() !== req.params.itemId
    );
    await cart.save();
  }
  res.status(200).json({ success: true, message: "Product removed from cart" });
});

// Clear the cart
export const clearCart = catchAsyncErrors(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.products = [];
    await cart.save();
  }
  res.status(200).json({ success: true, message: "Cart cleared" });
}); 