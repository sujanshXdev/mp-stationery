import multer from "multer";
import path from "path";
import fs from "fs";

// Function to create a storage engine for a specific upload type
const createStorage = (folder) => {
  const storagePath = `backend/public/uploads/${folder}`;

  // Ensure the directory exists
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, storagePath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });
};

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Error: File upload only supports the following filetypes - " + filetypes));
};

// Create separate upload instances
const uploadProductImage = multer({
  storage: createStorage("products"),
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
  fileFilter,
}).array("images", 8); // "images" is the field name, up to 8 files

const uploadAvatar = multer({
  storage: createStorage("avatars"),
  limits: { fileSize: 1024 * 1024 * 2 }, // 2MB limit
  fileFilter,
}).single("avatar"); // "avatar" is the field name in the form

export { uploadProductImage, uploadAvatar }; 