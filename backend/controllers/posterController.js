import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Poster from "../models/poster.js";
import ErrorHandler from "../utils/errorHandler.js";
import fs from 'fs';
import path from 'path';

// Get the current poster => GET /api/v1/poster
export const getPoster = catchAsyncErrors(async (req, res, next) => {
  const poster = await Poster.findOne();

  res.status(200).json({
    success: true,
    poster,
  });
});

// Upload or update poster => POST /api/v1/poster
export const uploadPoster = catchAsyncErrors(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorHandler("Please upload an image.", 400));
  }

  const newImagePath = `uploads/posters/${req.file.filename}`;
  
  // Find existing poster to get old image path
  const oldPoster = await Poster.findOne();
  
  // If an old poster exists, delete its image file
  if (oldPoster && oldPoster.image) {
    const fullPath = path.resolve(process.cwd(), 'backend', 'public', oldPoster.image);
    fs.unlink(fullPath, (err) => {
      if (err) console.error(`Failed to delete old poster image: ${fullPath}`, err);
    });
  }

  // Update or create the poster entry with the new image path
  const poster = await Poster.findOneAndUpdate({}, { image: newImagePath }, {
    new: true,
    upsert: true, // Creates a new doc if no doc matches the filter
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    poster,
  });
});

// Delete the current poster => DELETE /api/v1/poster
export const deletePoster = catchAsyncErrors(async (req, res, next) => {
  const poster = await Poster.findOne();

  if (!poster) {
    return next(new ErrorHandler("No poster found to delete.", 404));
  }

  // Delete the image file from the server
  const fullPath = path.resolve(process.cwd(), 'backend', 'public', poster.image);
  fs.unlink(fullPath, (err) => {
    if (err) console.error(`Failed to delete poster image: ${fullPath}`, err);
  });
  
  // Delete the poster document from the database
  await poster.deleteOne();

  res.status(200).json({
    success: true,
    message: "Poster deleted successfully",
  });
}); 