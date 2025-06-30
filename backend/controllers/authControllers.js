import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/user.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/sendToken.js";
import sendEmail from "../utils/sendEmail.js";
import { 
  emailVerificationTemplate, 
  passwordResetTemplate, 
  welcomeEmailTemplate 
} from "../utils/emailTemplates.js";

// Register user => /api/v1/register
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password } = req.body;
  console.log("REGISTER BODY:", req.body); // <-- Add this line

  // Check if user already exists with this email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("User already exist with this email", 400));
  }

  // Generate a 6-digit verification code
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const verificationCodeExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Create user with verification code
  const user = await User.create({
    name,
    email,
    phone,
    password,
    verificationCode,
    verificationCodeExpire,
    isVerified: false,
  });

  // Send verification code to user's email using the new template
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationUrl = `${frontendUrl}/register?code=${verificationCode}&email=${email}`;
  await sendEmail({
    email: user.email,
    subject: "Verify your email - MP Books & Stationery",
    message: emailVerificationTemplate(user.name, verificationUrl),
  });

  res.status(201).json({
    success: true,
    message:
      "User registered successfully. Please check your email for the verification code.",
  });
});

// Login user => /api/v1/login
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  console.log("LOGIN ATTEMPT:", { email });

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  
  console.log("USER FOUND IN DB:", user);

  if (!user || !(await user.comparePassword(password))) {
    console.log("Authentication failed: Invalid email or password.");
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  
  console.log("Authentication successful. Sending token...");
  sendToken(user, 200, res);
});

// Logout user => /api/v1/logout
export const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Forgot password => /api/v1/password/forgot
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  const resetCode = user.getResetPasswordCode();
  await user.save({ validateBeforeSave: false });

  // Create reset URL for the template
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?code=${resetCode}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset - MP Books & Stationery",
      message: passwordResetTemplate(user.name, resetUrl),
    });

    res.status(200).json({
      success: true,
      message: `Email sent to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordCode = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler("Email could not be sent", 500));
  }
});

// Reset password => /api/v1/password/reset
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { resetCode, password } = req.body;

  const user = await User.findOne({
    resetPasswordCode: resetCode,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Password reset code is invalid or has expired", 400)
    );
  }

  user.password = password;
  user.resetPasswordCode = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendToken(user, 200, res);
});

// Get current user profile => /api/v1/me
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

// Update Password => /api/v1/password/update
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(req.body.oldPassword))) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  user.password = req.body.password;
  await user.save();

  sendToken(user, 200, res);
});

// Update User Profile => /api/v1/me/update
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
  };

  const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

// Get All Users => /api/v1/admin/users
export const allUsers = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  const filter = {};

  // Filter by role if provided
  if (req.query.role) {
    filter.role = req.query.role;
  }

  // Filter by isVerified if provided
  if (req.query.isVerified !== undefined && req.query.isVerified !== "") {
    // Convert string to boolean
    if (req.query.isVerified === "true") filter.isVerified = true;
    else if (req.query.isVerified === "false") filter.isVerified = false;
  }

  const users = await User.find(filter);
  res.status(200).json({ success: true, users });
};

// Get User Details => /api/v1/admin/users/:id
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User not found with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Update User Details => /api/v1/admin/users/:id
export const updateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

// Delete User => /api/v1/admin/users/:id
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User not found with id: ${req.params.id}`, 404)
    );
  }

  // TODO - Remove avatar from cloudinary

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// Verify Email => /api/v1/verify-email
export const verifyEmail = catchAsyncErrors(async (req, res, next) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (
    !user.verificationCode ||
    user.verificationCode !== code ||
    user.verificationCodeExpire < Date.now()
  ) {
    return next(new ErrorHandler("Invalid or expired verification code", 400));
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpire = undefined;
  await user.save();

  // Send welcome email after successful verification
  try {
    await sendEmail({
      email: user.email,
      subject: "Welcome to MP Books & Stationery!",
      message: welcomeEmailTemplate(user.name),
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't fail the verification if welcome email fails
  }

  res.status(200).json({
    success: true,
    message: "Email verified successfully. You can now log in.",
  });
});

// Resend Verification Code => /api/v1/resend-verification-code
export const resendVerificationCode = catchAsyncErrors(
  async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    if (user.isVerified) {
      return next(new ErrorHandler("Email is already verified.", 400));
    }

    // Generate a new 6-digit verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationCodeExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.verificationCode = verificationCode;
    user.verificationCodeExpire = verificationCodeExpire;
    await user.save();

    // Send verification code to user's email using the new template
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/register?code=${verificationCode}&email=${email}`;
    await sendEmail({
      email: user.email,
      subject: "Verify your email - MP Books & Stationery",
      message: emailVerificationTemplate(user.name, verificationUrl),
    });

    res.status(200).json({
      success: true,
      message: "Verification code resent to your email.",
    });
  }
);
