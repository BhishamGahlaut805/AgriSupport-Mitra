const multer = require("multer");
const path = require("path");

// ✅ Storage Engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Save images to "uploads" folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    }
});

// ✅ File Filter (Only Images Allowed)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed!"), false);
    }
};

// ✅ Multer Upload Middleware (Match the field name with `name="images"`)
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 115 * 1024 * 1024 } // Max 5MB per image
}).array("images", 5); // ✅ Match the "name" field in frontend & allow up to 5 images

module.exports = upload;
