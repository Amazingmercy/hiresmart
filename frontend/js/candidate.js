import { NotificationSystem } from "/js/notifications.js";

const notifier = new NotificationSystem();

document.addEventListener("DOMContentLoaded", function () {
  // Check authentication
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // if (!token || !user || user.role !== "candidate") {
  //   window.location.href = "../auth/login.html";
  //   return;
  // }

  // Set user name if available
  const fullNameElement = document.getElementById("fullName");
  if (fullNameElement) {
    fullNameElement.textContent = user.name;
  }

  // Load candidate dashboard data
  if (document.querySelector(".candidate-dashboard")) {
    loadCandidateDashboard();
  }

  // Load jobs for browsing
  if (document.querySelector(".candidate-jobs")) {
    loadAvailableJobs();
    setupJobFilters();
  }

  // Load applications
  if (document.querySelector(".candidate-applications")) {
    loadCandidateApplications();
  }

  // Handle job application form
  const applyForm = document.getElementById("applyForm");
  if (applyForm) {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get("jobId");
    const jobTitle = params.get("jobTitle");

    document.getElementById("jobTitle").value = jobTitle;
    document.getElementById("fullName").value = fullName;
    document.getElementById("email").value = email;
    document.getElementById("phone").value = phone;
    const titleEl = document.getElementById("applyJobTitle");
    titleEl.textContent = decodeURIComponent(jobTitle);

    applyForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData();
      formData.append("cv", document.getElementById("resume").files[0]);
      formData.append("jobTitle", jobTitle);
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("phone", phone);

      try {
        const response = await fetch(`/api/candidate/jobs/${jobId}/apply`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          notifier.success("Success!", "Application submitted successfully!");
          setTimeout(() => {
            window.location.href = "applications.html";
          }, 2000);
        } else {
          notifier.error(
            "Error",
            data.message || "Failed to submit application"
          );
        }
      } catch (error) {
        console.error("Error:", error);
        notifier.error(
          "Error",
          "An error occurred while submitting the application"
        );
      }
    });
  }

  // Handle logout
  const logoutButtons = document.querySelectorAll("#logout");
  if (logoutButtons.length > 0) {
    logoutButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "../auth/login.html";
      });
    });
  }

  // Refresh buttons
  const refreshJobsBtn = document.getElementById("refreshJobs");
  if (refreshJobsBtn) {
    refreshJobsBtn.addEventListener("click", loadAvailableJobs);
  }

  const refreshApplicationsBtn = document.getElementById("refreshApplications");
  if (refreshApplicationsBtn) {
    refreshApplicationsBtn.addEventListener("click", loadCandidateApplications);
  }
});

// Dashboard Functions
async function loadCandidateDashboard() {
  try {
    const token = localStorage.getItem("token");

    // Fetch candidate applications
    const applicationsResponse = await fetch("/api/candidate/applications", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });


    const recentApp = await fetch("/api/candidate/applications/recent", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const applications = await applicationsResponse.json();
    const recent = await recentApp.json();

    // Load recent applications
    const recentApplicationsContainer = document.getElementById("recentApplications");
    const totalApplications = document.getElementById("totalApplications");
    const candidate = document.getElementById("candidate-no-data");

    totalApplications.textContent = applications.length;
    if (applications.length > 0) {
      candidate.style.display = "none";

      recent.forEach((application) => {
        const appCard = document.createElement("div");
        appCard.className = "application-card";
        appCard.innerHTML = `
    <h4>${application.Job.title}</h4>
    <p>Score: ${application.analysed_score || "Not scored yet"}</p>

`;
        recentApplicationsContainer.appendChild(appCard);
      });
    }
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    notifier.error("Error", "Failed to load dashboard data");
  }
}

// Jobs Page Functions
async function loadAvailableJobs() {
  try {
    const jobListingsContainer = document.getElementById("jobListings");

    // Show loading state
    jobListingsContainer.innerHTML = '<div class="loading-spinner"></div>';

    // Fetch jobs
    const response = await fetch("/api/candidate/jobs");

    if (!response.ok) throw new Error("Failed to load jobs");

    const jobs = await response.json();

    if (jobs.length === 0) {
      jobListingsContainer.innerHTML =
        '<p class="no-data">No available jobs found.</p>';
      return;
    }

    jobListingsContainer.innerHTML = "";

    jobs.forEach((job) => {
      const jobCard = document.createElement("div");
      jobCard.className = "job-card";
      jobCard.dataset.id = job.id;
      jobCard.dataset.type = job.job_type || "full-time";
      jobCard.dataset.experience = job.experience_years || 0;
      jobCard.dataset.salary = job.salary || 0;
      jobCard.dataset.title = job.title.toLowerCase();
      jobCard.dataset.skills = job.required_skills.toLowerCase();

      jobCard.innerHTML = `
                <div class="job-card-header">
                    <h3>${job.title}</h3>
                    <span class="job-type ${job.job_type || "full-time"}">${job.job_type ? job.job_type.replace("-", " ") : "Full time"
        }</span>
                </div>
                <div class="job-meta">
                    <span><i class="fas fa-briefcase"></i> ${job.experience_years || 0
        }+ years exp</span>
                    <span><i class="fas fa-money-bill-wave"></i> ₦${job.salary ? job.salary.toLocaleString() : "Not specified"
        }</span>
                </div>
                <p class="job-description">${job.description.substring(
          0,
          200
        )}...</p>
                <div class="job-skills">
                    <strong>Required Skills:</strong> ${job.required_skills}
                </div>
                <div class="job-actions">
                    <a href="apply.html?jobId=${job.id}&phone=${job.title
        }" class="btn btn-primary">Apply Now</a>
                </div>
            `;

      jobListingsContainer.appendChild(jobCard);
    });
  } catch (error) {
    console.error("Error loading jobs:", error);
    document.getElementById("jobListings").innerHTML = `
            <p class="no-data">Error loading jobs. <button class="btn-text" onclick="loadAvailableJobs()">Try again</button></p>
        `;
    notifier.error("Error", "Failed to load jobs");
  }
}

function setupJobFilters() {
  const applyFiltersBtn = document.getElementById("applyFilters");
  const searchInput = document.getElementById("searchJobs");

  // Run on button click
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", filterJobs);
  }

  // Run on Enter key press inside search input
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); // prevent form submission if inside a form
        filterJobs();
      }
    });
  }
}


function filterJobs() {
  const searchTerm = document.getElementById("searchJobs").value.toLowerCase();

  console.log("Filtering jobs with search term:", searchTerm);

  document.querySelectorAll(".job-card").forEach((card) => {
    const jobTitle = card.dataset.title || "";
    const jobSkills = card.dataset.skills || "";

    const searchMatch =
      searchTerm === "" ||
      jobTitle.includes(searchTerm) ||
      jobSkills.includes(searchTerm);

    card.style.display = searchMatch ? "block" : "none";
  });
}

// Applications Page Functions
async function loadCandidateApplications() {
  try {
    const token = localStorage.getItem("token");
    const applicationsListContainer = document.getElementById("applicationsList");

    // Show loading state
    applicationsListContainer.innerHTML = '<div class="loading-spinner"></div>';

    // Fetch applications
    const response = await fetch("/api/candidate/applications", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to load applications");

    const applications = await response.json();

    if (applications.length === 0) {
      applicationsListContainer.innerHTML = `
        <div class="no-applications">
          <p>You haven't applied to any jobs yet.</p>
          <a href="jobs.html" class="btn btn-primary">Browse Jobs</a>
        </div>
      `;
      return;
    }

    // Clear loading spinner
    applicationsListContainer.innerHTML = "";

    applications.forEach((application) => {
      const appCard = document.createElement("div");
      appCard.className = "application-card";
      appCard.dataset.id = application.id;
      appCard.dataset.status = application.status || "submitted";
      appCard.dataset.date = new Date(application.createdAt).getTime();

      const status = application.status || "submitted";
      const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);
      const createdDate = new Date(application.createdAt).toLocaleDateString();
      const score = application.analysed_score || "Not scored";
      const jobTitle = application.Job?.title || "Untitled Job";

      // Parse the screening_details JSON string
      const screeningDetails = application.screening_details
        ? JSON.parse(application.screening_details)
        : null;

      let screeningHtml = "";
      if (screeningDetails) {
        screeningHtml = `
          <div class="screening-details">
            <p><strong>Available Skills:</strong> ${screeningDetails["Available Skills"]?.join(", ") || "N/A"
          }</p>
            <p><strong>Missing Skills:</strong> ${screeningDetails["Missing Skills"]?.join(", ") || "N/A"
          }</p>
            <p><strong>Qualified:</strong> ${screeningDetails.Qualified ?? "Unknown"
          }</p>
          </div>
        `;
      }

      appCard.innerHTML = `
        <div class="application-header">
          <h3>${jobTitle}</h3>
          <span class="status-badge status-${status}">${formattedStatus}</span>
        </div>
        <div class="application-meta">
          <span><strong>Applied:</strong> ${createdDate}</span>
          <span><strong>Match Score:</strong> ${score}</span>
        </div>
        ${screeningHtml}
      `;

      applicationsListContainer.appendChild(appCard);
    });
  } catch (error) {
    console.error("Error loading applications:", error);
    document.getElementById("applicationsList").innerHTML = `
      <p class="no-data">
        Error loading applications.
        <button class="btn-text" onclick="loadCandidateApplications()">Try again</button>
      </p>
    `;
    if (typeof notifier !== "undefined") {
      notifier.error("Error", "Failed to load applications");
    }
  }
}

