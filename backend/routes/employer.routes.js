// backend/routes/employer.routes.js
const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employer.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(authenticate, authorizeRoles('employer'));

router.post('/jobs', employerController.createJob);
router.get('/jobs', employerController.getEmployerJobs);
router.get("/jobs/:jobId", employerController.getAnEmployerJobs);
router.get('/jobs/:jobId/applicants', employerController.getApplicants);
router.put('/jobs/:jobId', employerController.updateJob)
router.get('/jobs/:applicantId/applicant', employerController.getAnApplicant)

module.exports = router;
