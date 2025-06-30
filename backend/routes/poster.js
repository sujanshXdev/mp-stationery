import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getPoster, uploadPoster, deletePoster } from '../controllers/posterController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// Multer storage configuration for posters
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure the directory exists
    const uploadPath = 'backend/public/uploads/posters/';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes
router.route('/poster').get(getPoster);

router.route('/poster')
  .post(isAuthenticatedUser, authorizeRoles('admin'), upload.single('poster'), uploadPoster)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deletePoster);

export default router; 