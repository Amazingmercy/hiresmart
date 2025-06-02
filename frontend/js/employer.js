import { NotificationSystem } from '/js/notifications.js';

const notifier = new NotificationSystem();

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user || user.role !== 'employer') {
        window.location.href = '../auth/login.html';
        return;
    }

    // Set user name if available
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = user.name;
    }

    // Load employer dashboard data
    if (document.querySelector('.employer-dashboard')) {
        loadEmployerDashboard();
    }

    // Load employer jobs
    if (document.querySelector('.employer-jobs')) {
        loadEmployerJobs();
    }

    // Handle create job form
    const createJobForm = document.getElementById('createJobForm');
    if (createJobForm) {
        createJobForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                title: document.getElementById('jobTitle').value,
                description: document.getElementById('jobDescription').value,
                required_skills: document.getElementById('requiredSkills').value,
                qualifications: document.getElementById('qualifications').value,
                experience_years: document.getElementById('experienceYears').value,
                salary: document.getElementById('jobSalary').value,
            };

            try {
                const response = await fetch('/api/employer/jobs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                
                if (response.ok) {
                    notifier.success('Success!', 'Job created successfully!!', 5000);
                    window.location.href = "dashboard.html";
                } else {
                    notifier.error('Error', 'Failed to create job', 0);
                }
            } catch (error) {
                console.error('Error:', error);
                notifier.error('Error', 'An error occurred while creating the job', 0);
            }
        });
    }
});

async function loadEmployerDashboard() {
    try {
        const token = localStorage.getItem('token');
        
        // Fetch employer jobs
        const jobsResponse = await fetch('/api/employer/jobs', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const jobs = await jobsResponse.json();
        
        // Update stats
        document.getElementById('activeJobs').textContent = jobs.length;
        
        // Normalize jobs into an array
const jobList = Array.isArray(jobs) ? jobs : [jobs];

let totalApplicants = 0;
let pendingReviews = 0;

for (const job of jobList) {
  const applicantsResponse = await fetch(`/api/employer/jobs/${job.id}/applicants`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!applicantsResponse.ok) {
    console.error(`Failed to fetch applicants for job ${job.id}`);
    continue;
  }

  const applicants = await applicantsResponse.json();
  totalApplicants += applicants.length;
  
}

        
        document.getElementById('totalApplicants').textContent = totalApplicants;
        
        // Load recent applicants (last 5)
        if (jobs.length > 0) {
            const recentApplicantsResponse = await fetch(`/api/employer/jobs/${jobs[0].id}/applicants`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const recentApplicants = await recentApplicantsResponse.json();
            const recentApplicantsContainer = document.getElementById('recentApplicants');
            
            if (recentApplicants.length > 0) {
                recentApplicantsContainer.innerHTML = '';
                
                recentApplicants.slice(0, 5).forEach(applicant => {
                    const applicantCard = document.createElement('div');
                    applicantCard.className = 'applicant-card';
                    applicantCard.innerHTML = `
                        <h4>${applicant.User.name}</h4>
                        <p>Applied for: ${applicant.Job ? applicant.Job.title : 'Unknown Job'}</p>
                        <p>Score: ${applicant.analysed_score || 'Not scored yet'}</p>
                        <a href="applicants.html?jobId=${applicant.job_id}" class="btn btn-secondary">View Application</a>
                    `;
                    recentApplicantsContainer.appendChild(applicantCard);
                });
            }
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

async function loadEmployerJobs() {
    try {
        const token = localStorage.getItem('token');
        const jobsResponse = await fetch('/api/employer/jobs', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const jobs = await jobsResponse.json();
        const jobListingsContainer = document.getElementById('jobListings');
        
        if (jobs.length > 0) {
            jobListingsContainer.innerHTML = '';
            
            jobs.forEach(job => {
                const jobCard = document.createElement('div');
                jobCard.className = 'job-posting-card';
                jobCard.innerHTML = `
                    <h3>${job.title}</h3>
                    <div class="job-meta">
                        <span>Salary: ₦${job.salary || 'Not specified'}</span>
                    </div>
                    <p>${job.description.substring(0, 100)}...</p>
                    <div class="job-actions">
                        <a href="edit-job.html?jobId=${job.id}" class="btn btn-primary">Edit</a>
                        <a href="applicants.html?jobId=${job.id}" class="btn btn-secondary">View Applicants</a>
                    </div>
                `;
                jobListingsContainer.appendChild(jobCard);
            });
        } else {
            jobListingsContainer.innerHTML = '<p class="no-data">You haven\'t posted any jobs yet.</p>';
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
        document.getElementById('jobListings').innerHTML = '<p class="no-data">Error loading jobs. Please try again.</p>';
    }
}


// Handle edit job page initialization and form submission
if (document.querySelector('.edit-job')) {
    // Get job ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('jobId');
    
    if (jobId) {
        loadJobForEdit(jobId);
        
        // Set up form submission
        const editJobForm = document.getElementById('editJobForm');
        editJobForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await updateJob(jobId);
        });
    } else {
        notifier.warning('Warning', 'No job ID specified', 3000);
        window.location.href = 'jobs.html';
    }
}

async function loadJobForEdit(jobId) {
    try {
        const token = localStorage.getItem('token');
        
        // Fetch job details
        const response = await fetch(`/api/employer/jobs/${jobId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch job details');
        }
        
        const jobs = await response.json();

        
        jobs.forEach(job => {
        // Populate form fields
        document.getElementById('jobId').value = job.id;
        document.getElementById('jobTitle').value = job.title;
        document.getElementById('jobSalary').value = job.salary;
        document.getElementById('jobDescription').value = job.description;
        document.getElementById('requiredSkills').value = job.required_skills;
        document.getElementById('qualifications').value = job.qualifications;
        document.getElementById('experienceYears').value = job.experience_years;
        })
        
    } catch (error) {
        console.error('Error loading job for edit:', error);
        notifier.error('Error', 'Error loading jobs list', 0);
        window.location.href = 'jobs.html';
    }
}

async function updateJob(jobId) {
    try {
        const token = localStorage.getItem('token');
        const form = document.getElementById('editJobForm');
        
        const formData = {
            title: form.elements.title.value,
            description: form.elements.description.value,
            required_skills: form.elements.required_skills.value,
            qualifications: form.elements.qualifications.value,
            experience_years: form.elements.experience_years.value,
            salary: form.elements.salary.value
        };
        

        const response = await fetch(`/api/employer/jobs/${jobId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update job');
        }
        
        const updatedJob = await response.json();
        notifier.success('Success!', 'Job updated successfully!');
        window.location.href = 'jobs.html';
        
    } catch (error) {
        console.error('Error updating job:', error);
        notifier.error('Error', `${error.message } || An error occurred while updating the job`, 0);
    }
}



//APplicants
// Applicants Page Functionality
if (document.querySelector('.applicants-page')) {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('jobId');
    
    if (jobId) {
        loadJobApplicants(jobId);
        
        // Set up filter button
        document.getElementById('applyFilters').addEventListener('click', () => {
            filterApplicants();
        });
        
        // Set up modal
        setupApplicantModal();
    } else {
        notifier.error('Error', 'No job specified');
        setTimeout(() => {
            window.location.href = 'jobs.html';
        }, 2000);
    }
}

async function loadJobApplicants(jobId) {
    try {
        const token = localStorage.getItem('token');
        
        // Show loading
        document.getElementById('applicantsList').innerHTML = '<div class="loading-spinner"></div>';
        
        // Fetch job details
        const jobResponse = await fetch(`/api/employer/jobs/${jobId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!jobResponse.ok) throw new Error('Failed to load job details');
        
        const jobs = await jobResponse.json();
        jobs.forEach(async job => {
        document.getElementById('jobTitleHeader').textContent = `Applicants for ${job.title}`;
        
        // Fetch applicants
        const applicantsResponse = await fetch(`/api/employer/jobs/${jobId}/applicants`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!applicantsResponse.ok) throw new Error('Failed to load applicants');
        
        const applicants = await applicantsResponse.json();
        displayApplicants(applicants);
    })
    } catch (error) {
        console.error('Error loading applicants:', error);
        document.getElementById('applicantsList').innerHTML = `
            <div class="no-applicants">
                <p>Error loading applicants. Please try again.</p>
                <button class="btn btn-primary" onclick="location.reload()">Retry</button>
            </div>
        `;
        notifier.error('Error', error.message);
    }
}

function displayApplicants(applicants) {
    const applicantsList = document.getElementById('applicantsList');
    
    if (applicants.length === 0) {
        applicantsList.innerHTML = `
            <div class="no-applicants">
                <p>No applicants found for this job.</p>
            </div>
        `;
        return;
    }
    
    applicantsList.innerHTML = '';
    
    applicants.forEach(applicant => {
        const applicantCard = document.createElement('div');
        applicantCard.className = 'applicant-card';
        applicantCard.dataset.id = applicant.id;
        applicantCard.dataset.score = applicant.analysed_score || 0;
        applicantCard.dataset.name = applicant.User.name;
        
        // Get initials for avatar
        const initials = applicant.User.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        // Determine score class
        let scoreClass = '';
        const score = applicant.analysed_score || 0;
        if (score >= 80) scoreClass = 'high';
        else if (score >= 60) scoreClass = 'medium';
        else scoreClass = 'low';
        
        
        applicantCard.innerHTML = `
            <div class="applicant-info">
                <div class="applicant-avatar">${initials}</div>
                <div>
                    <div class="applicant-name">${applicant.User.name}</div>
                    <div class="applicant-email">${applicant.User.email}</div>
                </div>
            </div>
            <div class="applicant-score ${scoreClass}">${score || 'N/A'}</div>
            <div class="applicant-actions">
                <button class="btn btn-secondary view-applicant">View</button>
            </div>
        `;
        
        applicantsList.appendChild(applicantCard);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-applicant').forEach(button => {
        button.addEventListener('click', function() {
            const applicantCard = this.closest('.applicant-card');
            const applicantId = applicantCard.dataset.id;
            showApplicantModal(applicantId);
        });
    });
}

function filterApplicants() {
    const scoreFilter = parseInt(document.getElementById('scoreFilter').value);
    const searchTerm = document.getElementById('searchApplicants').value.toLowerCase();
    
    document.querySelectorAll('.applicant-card').forEach(card => {
        const score = parseInt(card.dataset.score);
        const name = card.dataset.name.toLowerCase();
    
        const scoreMatch = scoreFilter === 0 || score >= scoreFilter;
        const searchMatch = searchTerm === '' || name.includes(searchTerm);
        
        if (statusMatch && scoreMatch && searchMatch) {
            card.style.display = 'grid';
        } else {
            card.style.display = 'none';
        }
    });
}

function setupApplicantModal() {
    const modal = document.getElementById('applicantModal');
    const closeBtn = document.querySelector('.close-modal');
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

async function showApplicantModal(applicantId) {
    console.log(applicantId)
    try {
        const token = localStorage.getItem('token');
        const modal = document.getElementById('applicantModal');
        
        // Show loading state
        modal.style.display = 'block';
        document.getElementById('modalApplicantAnalysis').innerHTML = '<div class="loading-spinner"></div>';
        
        // Fetch applicant details
        const response = await fetch(`/api/employer/jobs/${applicantId}/applicant`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load applicant details');

        
        const applicant = await response.json();

        console.log(applicant.resume_path);
    
   
        // Populate modal
        document.getElementById('modalApplicantName').textContent = applicant.User.name;
        document.getElementById('modalApplicantEmail').textContent = applicant.User.email;
        document.getElementById('modalApplicantDate').textContent = new Date(applicant.createdAt).toLocaleDateString();
        document.getElementById('modalApplicantScore').textContent = applicant.analysed_score || 'Not scored';
        
        // Populate analysis
        const analysisContent = applicant.screening_details ? 
            formatAnalysis(applicant.screening_details) : 
            '<p>No analysis available.</p>';
        
        document.getElementById('modalApplicantAnalysis').innerHTML = analysisContent;
        
        // Set up resume buttons
        document.getElementById('downloadResumeBtn').href = applicant.resume_path;
        document.getElementById('downloadResumeBtn').download = `${applicant.User.name.replace(' ', '_')}_Resume.pdf`;
    
        
    } catch (error) {
        console.error('Error loading applicant details:', error);
        document.getElementById('modalApplicantAnalysis').innerHTML = `
            <p class="error">Error loading applicant details. Please try again.</p>
        `;
        notifier.error('Error', error.message);
    }
}

function formatAnalysis(analysis) {
    try {
        // If analysis is a string (might be JSON)
        if (typeof analysis === 'string') {
            analysis = JSON.parse(analysis);
        }
        
        // If it's an object with screening_details property
        if (analysis.screening_details) {
            analysis = analysis.screening_details;
        }
        
        let html = '';
        
        // Handle different analysis formats
        if (Array.isArray(analysis)) {
            html = '<ul>';
            analysis.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += '</ul>';
        } else if (typeof analysis === 'object') {
            html = '<div class="analysis-grid">';
            for (const [key, value] of Object.entries(analysis)) {
                html += `
                    <div class="analysis-item">
                        <strong>${key}:</strong>
                        <span>${value}</span>
                    </div>
                `;
            }
            html += '</div>';
        } else {
            html = `<p>${analysis}</p>`;
        }
        
        return html;
    } catch (e) {
        console.error('Error formatting analysis:', e);
        return `<p>${analysis}</p>`;
    }
}



// Handle logout
    const logoutButtons = document.querySelectorAll('#logout');
    if (logoutButtons.length > 0) {
        logoutButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '../auth/login.html';
            });
        });
    }

    // Check authentication status on protected pages
    const protectedPages = [
        'employer/dashboard.html',
        'employer/jobs.html',
        'employer/create-job.html',
        'candidate/dashboard.html',
        'candidate/jobs.html',
        'candidate/applications.html'
    ];

    const currentPath = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPath)) {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!token || !user) {
            window.location.href = '../auth/login.html';
        }
    }
