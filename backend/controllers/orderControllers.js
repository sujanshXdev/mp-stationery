import Order from "../models/order.js";
import Product from "../models/product.js";
import Cart from "../models/cart.js"; // Import your Cart model
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendEmail from "../utils/sendEmail.js"; // Make sure this import is at the top
import Notification from "../models/notification.js";
import { orderConfirmationTemplate } from "../utils/emailTemplates.js";

function generateOrderID() {
  // Generates a random 4-character uppercase alphanumeric string
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Create new order => /api/v1/orders/new
export const newOrder = catchAsyncErrors(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "products.product user"
  );

  if (!cart || cart.products.length === 0) {
    return next(new ErrorHandler("Your cart is empty", 400));
  }

  const orderItems = cart.products.map((item) => {
    const product = item.product;
    let purchasePrice;

    const orderItemData = {
      name: product.name,
      quantity: item.quantity,
      image: product.images?.[0]?.url,
      product: product._id,
      unitType: item.unitType,
      category: product.category,
    };

    if (product.category === "Book") {
      purchasePrice = product.priceToSell;
      orderItemData.marketPrice = product.marketPrice;
      orderItemData.subCategory = product.subCategory;
      orderItemData.academicCategory = product.academicCategory;
      orderItemData.class = product.class;
    } else {
      purchasePrice =
        item.unitType === "Packet"
          ? product.pricePerPacket
          : product.pricePerPiece;
    }

    orderItemData.purchasePrice = purchasePrice;

    return orderItemData;
  });

  const totalAmount = orderItems.reduce(
    (acc, item) => acc + item.purchasePrice * item.quantity,
    0
  );

  const shippingInfo = {
    phoneNo: cart.user.phone,
  };

  // Generate unique order ID
  const orderID = generateOrderID();

  const order = await Order.create({
    orderItems,
    totalAmount,
    shippingInfo,
    paymentInfo: { status: "Pending" }, // Default payment info
    user: req.user._id,
    orderID,
  });

  // Create notification for new order
  await Notification.create({
    message: `New order #${orderID} has been placed`,
    type: "order",
    order: order._id,
  });

  // Send order confirmation email
  try {
    const orderDetails = orderItems.map(item => 
      `${item.name} (${item.quantity} ${item.unitType || 'piece'})`
    ).join(', ');
    
    await sendEmail({
      email: req.user.email,
      subject: "Order Confirmation - MP Books & Stationery",
      message: orderConfirmationTemplate(
        req.user.name,
        orderID,
        orderDetails,
        totalAmount.toFixed(2)
      ),
    });
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    // Don't fail the order creation if email fails
  }

  // Clear the user's cart after order is placed
  await Cart.deleteMany({ user: req.user._id });

  res.status(201).json({
    success: true,
    order,
  });
});

// Get current user orders => /api/v1/orders/me/orders
export const myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

// Get order details => /api/v1/orders/:id
export const getOrderDetails = catchAsyncErrors(async (req, res, next) => {
  let order;
  // If the id param is 4 characters, treat it as orderID, else as MongoDB _id
  if (req.params.id.length === 4) {
    order = await Order.findOne({ orderID: req.params.id }).populate(
      "user",
      "name email phone"
    );
  } else {
    order = await Order.findById(req.params.id).populate(
      "user",
      "name email phone"
    );
  }

  if (!order) {
    return next(new ErrorHandler("No Order found with this ID", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Get all orders - ADMIN => /api/v1/admin/orders
export const allOrders = catchAsyncErrors(async (req, res, next) => {
  const query = {};

  // Add orderStatus filter if provided
  if (req.query.orderStatus) {
    query.orderStatus = req.query.orderStatus;
  }

  // Add paymentInfo.status filter if provided
  if (req.query["paymentInfo.status"]) {
    query["paymentInfo.status"] = req.query["paymentInfo.status"];
  }

  const orders = await Order.find(query).populate("user", "name email");

  res.status(200).json({
    success: true,
    orders,
  });
});

// Update order (status/payment) => /api/v1/orders/:id
export const updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "email name"
  );

  if (!order) {
    return next(new ErrorHandler("No Order found with this ID", 404));
  }

  const prevStatus = order.orderStatus;

  if (req.body.orderStatus) {
    order.orderStatus = req.body.orderStatus;
  }

  if (req.body.paymentInfo) {
    order.paymentInfo = {
      ...order.paymentInfo,
      ...req.body.paymentInfo,
    };
  }

  await order.save();

  // Increment salesCount only if order is now Delivered and Paid, and wasn't before
  if (
    order.orderStatus === "Delivered" &&
    order.paymentInfo?.status === "Paid" &&
    (prevStatus !== "Delivered" || order.paymentInfo?.status !== (req.body.paymentInfo?.status || "Paid"))
  ) {
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { salesCount: 1 } },
        { new: true }
      );
    }
  }

  // Send email if status changed from Processing to Ready for Pickup
  if (
    prevStatus === "Processing" &&
    order.orderStatus === "Ready for Pickup" &&
    order.user?.email
  ) {
    const orderDetails = order.orderItems.map(item => 
      `${item.name} (${item.quantity} ${item.unitType || 'piece'})`
    ).join(', ');
    
    await sendEmail({
      email: order.user.email,
      subject: "Your order is ready for pickup! - MP Books & Stationery",
      message: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">MP Books & Stationery</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Order Ready for Pickup</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${order.user.name},</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Great news! Your order is now ready for pickup at our shop.
            </p>
            
            <div style="background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
              <p style="color: #555; margin: 5px 0;"><strong>Order Number:</strong> ${order.orderID}</p>
              <p style="color: #555; margin: 5px 0;"><strong>Total Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
              <p style="color: #555; margin: 5px 0;"><strong>Status:</strong> Ready for Pickup</p>
            </div>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Please visit our shop during business hours to collect your items. Don't forget to bring a valid ID for verification.
            </p>
            
            <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #333; margin-top: 0;">Contact Information:</h4>
              <p style="color: #555; margin: 5px 0;">
                <strong>Phone:</strong> 985-5038599 / 056-534129<br>
                <strong>Address:</strong> MCGP+37F, Bharatpur 44200<br>
                <strong>Hours:</strong> 6:00 AM - 9:00 PM Daily
              </p>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              Thank you for shopping with us!<br>
              <strong>The MP Books & Stationery Team</strong>
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2024 MP Books & Stationery. All rights reserved.</p>
          </div>
        </div>
      `,
    });
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Cancel Order => /api/v1/orders/:id/cancel
export const cancelOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("No Order found with this ID", 404));
  }

  if (order.user.toString() !== req.user._id.toString()) {
    return next(
      new ErrorHandler("You are not authorized to cancel this order", 403)
    );
  }

  if (order.orderStatus === "Delivered") {
    return next(
      new ErrorHandler(
        "You cannot cancel an order that has already been delivered",
        400
      )
    );
  }

  if (order.orderStatus === "Cancelled") {
    return next(new ErrorHandler("This order is already cancelled", 400));
  }

  order.orderStatus = "Cancelled";

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order has been cancelled successfully",
    order,
  });
});

// Delete Order - ADMIN => /api/v1/admin/orders/:id
export const deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("No Order found with this ID", 404));
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
});
