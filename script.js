// script.js - Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const registerBtn = document.getElementById('registerBtn');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const registerModal = document.getElementById('registerModal');
    const closeButtons = document.querySelectorAll('.close');

    // Initialize cart if not exists
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }

    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Check if user exists in dataPengguna
        const user = dataPengguna.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Store user info in localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            // Show loading animation
            showNotification('Login berhasil! Mengalihkan...', 'success');
            // Redirect to dashboard after 1 second
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showNotification('Email/password yang anda masukkan salah', 'error');
        }
    });

    // Show modals
    forgotPasswordBtn.addEventListener('click', function() {
        forgotPasswordModal.style.display = 'block';
    });

    registerBtn.addEventListener('click', function() {
        registerModal.style.display = 'block';
    });

    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            forgotPasswordModal.style.display = 'none';
            registerModal.style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.style.display = 'none';
        }
        if (e.target === registerModal) {
            registerModal.style.display = 'none';
        }
    });
});

// Global notification function
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}