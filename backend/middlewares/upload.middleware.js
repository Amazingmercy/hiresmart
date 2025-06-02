// backend/middlewares/upload.middleware.js
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware to validate and move uploaded file
const fileUploadMiddleware = (req, res, next) => {
  if (!req.files || !req.files.cv) {
    return res.status(400).json({ error: 'CV file is required.' });
  }

  const file = req.files.cv;
  const ext = path.extname(file.name).toLowerCase();
  const allowedTypes = ['.pdf', '.doc', '.docx'];

  if (!allowedTypes.includes(ext)) {
    return res.status(400).json({ error: 'Only PDF and Word documents are allowed.' });
  }

  const uniqueName = `cv-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const uploadPath = path.join(uploadDir, uniqueName);

  file.mv(uploadPath, (err) => {
    if (err) return res.status(500).json({ error: 'File upload failed.' });

    // Attach file info to req object
    req.uploadedFilePath = uploadPath;
    req.uploadedFileName = uniqueName;
    next();
  });
};

module.exports = fileUploadMiddleware;
