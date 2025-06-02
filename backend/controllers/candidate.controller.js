// backend/controllers/candidate.controller.js
const { Job, Application } = require('../models');
const {extractTextFromCV} = require('../utils/cv.parser')
const {analyzeCVAgainstCriteria} = require('../utils/screening.engine')
const path = require('path')



exports.viewJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll();
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch jobs', error: err.message });
  }
};

exports.applyToJob = async (req, res) => {
  const { jobId } = req.params;
  const {jobTitle} = req.body
  const cv = req.files?.cv;


  if (!cv) return res.status(400).json({ message: 'CV file is required' });


  const fullPath = req.uploadedFilePath
  const relativePath = path.relative(path.resolve(__dirname), fullPath);
  const cvPath = path.join("uploads", relativePath);

  console.log(cvPath)
  try {
    const alreadyApplied = await Application.findOne({ where: { candidate_id: req.user.id, job_id: jobId } });
    if (alreadyApplied) return res.status(409).json({ message: 'You already applied for  this job' });


    const cvText = await extractTextFromCV(cvPath)
    const jobCriteria = await Job.findOne({where: {title: jobTitle}})
    const criteriaList = `Qualifications: ${jobCriteria.qualifications}, Required Skills: ${jobCriteria.required_skills}, Years of experience: ${jobCriteria.experience_years}`
    const aiResponse = await analyzeCVAgainstCriteria(cvText, criteriaList)
    
    const cleanedResponse = aiResponse.replace(/```json|```/g, '').trim();
    const response = JSON.parse(cleanedResponse);

    const application = await Application.create({
      candidate_id: req.user.id,
      job_id: jobId,
      resume_path: cvPath,
      screening_details: response.screening_details,
      analysed_score: response.score
    });

    res.status(201).json({ message: 'Application submitted', application });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit application', error: err.message });
  }
};


exports.viewApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { candidate_id: req.user.id },
      include: [Job],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch applications', error: err.message })
  }
}

exports.viewRecentApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { candidate_id: req.user.id },
      include: [Job],
      order: [["createdAt", "DESC"]],
      limit: 2
    });
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch applications', error: err.message })
  }
}