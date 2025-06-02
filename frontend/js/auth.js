import { NotificationSystem } from '/js/notifications.js';

const notifier = new NotificationSystem();


document.addEventListener('DOMContentLoaded', function() {
  // --- NEW: renderNavLink based on login state ---
  const navList = document.querySelector('.main-nav ul');
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (token && user) {
    // Replace with Dashboard + Logout
    navList.innerHTML = `
      <li><a href="${ user.role === 'employer' 
         ? '/employer/dashboard.html' 
         : '/candidate/dashboard.html'}">Dashboard</a></li>
      <li><a href="#" id="logout">Logout</a></li>
    `;
 } 
// else {
//     // Default: Login/Register
//     navList.innerHTML = `
//       <li><a href="auth/login.html">Login</a></li>
//       <li><a href="auth/register.html">Register</a></li>
//     `;
//   }

    // Handle role toggle on registration page
    const roleButtons = document.querySelectorAll('.role-btn');
    if (roleButtons.length > 0) {
        roleButtons.forEach(button => {
            button.addEventListener('click', function() {
                roleButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                document.getElementById('role').value = this.dataset.role;
                document.getElementById('roleDisplay').textContent = 
                    this.dataset.role === 'employer' ? 'an Employer' : 'a Candidate';
            });
        });
    }

    // Handle registration form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                role: document.getElementById('role').value
            };
            
            if (formData.password !== document.getElementById('confirmPassword').value) {
                notifier.error('Error!', 'Passwords dont match!');
                return;
            }

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                
                if (response.ok) {
                    // Store token and redirect
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    if (data.user.role === 'employer') {
                        window.location.href = '../employer/dashboard.html';
                    } else {
                        window.location.href = '../candidate/dashboard.html';
                    }
                } else {
                    notifier.error('Error', `${data.message} || 'Registration failed`, 0)
                }
            } catch (error) {
                console.error('Error:', error);
                notifier.error('Error', `An error occurred during registration`, 0)
            }
        });
    }

    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                
                if (response.ok) {
                    // Store token and redirect
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    if (data.user.role === 'employer') {
                        window.location.href = '../employer/dashboard.html';
                    } else {
                        window.location.href = '../candidate/dashboard.html';
                    }
                } else {
                   notifier.error('Error', 'Login failed', 0);
                }
            } catch (error) {
                console.error('Error:', error);
                notifier.error('Error', 'An error occurred during login', 0);
            }
        });
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
});