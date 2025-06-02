// backend/routes/candidate.routes.js
const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidate.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const fileUploadMiddleware = require('../middlewares/upload.middleware');

router.use(authenticate, authorizeRoles('candidate'));

router.get('/jobs', candidateController.viewJobs);
router.post('/jobs/:jobId/apply', fileUploadMiddleware, candidateController.applyToJob);
router.get("/applications", candidateController.viewApplications);
router.get("/applications/recent", candidateController.viewRecentApplications);


module.exports = router;
