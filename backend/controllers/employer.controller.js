// backend/controllers/employer.controller.js
const { Job, Application, User } = require('../models');


// POST /api/employer/jobs
exports.createJob = async (req, res) => {
  const { title, description, required_skills, qualifications, experience_years, salary} = req.body;

  try {
    const job = await Job.create({
      title,
      description,
      required_skills,
      qualifications,
      experience_years,
      employer_id: req.user.id,
      salary
    });

    res.status(201).json({ message: 'Job created', job });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create job', error: err.message });
  }
};

// PUT /api/employer/jobs
exports.updateJob = async (req, res) => {
  const { jobId } = req.params;
  const updates = req.body;

  try {
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    await job.update(updates);

    return res.status(200).json({
      message: 'Job updated successfully',
      job,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update job', error: err.message });
  }
};


// GET /api/employer/jobs
exports.getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({ where: { employer_id: req.user.id } });
    res.status(200).json(jobs);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Failed to fetch jobs', error: err.message });
  }
};

// GET /api/employer/jobs/:jobId/applicants
exports.getApplicants = async (req, res) => {
  const { jobId } = req.params;

  try {
    const applications = await Application.findAll({
      where: { job_id: jobId },
      include: [
        { model: User, as: 'User', attributes: ['id', 'name', 'email'], required: false },
      ],
    });

    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch applicants', error: err.message });
  }
};



exports.getAnApplicant = async (req, res) => {
  const {applicantId} = req.params

  try {
    const applications = await Application.findOne({
      where: {id: applicantId },
      include: [
        { model: User, as: 'User', attributes: ['id', 'name', 'email'], required: false },
      ],
    });

    res.status(200).json(applications);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to fetch applicants', error: err.message });
  }
};


exports.getAnEmployerJobs = async(req, res) => {
  const jobId = req.params.jobId
  try {
    const jobs = await Job.findAll({
      where: { employer_id: req.user.id, id: jobId },
    });
    res.status(200).json(jobs);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Failed to fetch jobs', error: err.message });
  }
}