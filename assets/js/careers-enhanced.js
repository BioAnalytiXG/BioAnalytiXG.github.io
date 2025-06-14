// Careers Page Enhanced JavaScript

// Filter functionality
document.addEventListener('DOMContentLoaded', function() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    const jobCards = document.querySelectorAll('.job-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            // Filter job cards
            jobCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                    // Add fade in animation
                    card.style.animation = 'fadeInUp 0.5s ease-out';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, observerOptions);
    
    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
    
    // File upload handling
    const fileInput = document.getElementById('resume');
    const fileLabel = document.querySelector('.file-label span');
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const fileName = e.target.files[0]?.name;
            if (fileName) {
                fileLabel.textContent = fileName;
            }
        });
    }
    
    // Form submission
    const applicationForm = document.getElementById('applicationForm');
    if (applicationForm) {
        applicationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulate form submission
            // In a real application, you would send this data to your server
            
            // Hide form and show success message
            applicationForm.style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
            
            // Reset form after 3 seconds
            setTimeout(() => {
                applicationForm.reset();
                fileLabel.textContent = 'Choose file or drag here';
            }, 3000);
        });
    }
});

// Modal functions
function openApplicationModal(position) {
    const modal = document.getElementById('applicationModal');
    const positionTitle = document.getElementById('positionTitle');
    
    positionTitle.textContent = position;
    modal.style.display = 'block';
    
    // Reset form when opening modal
    const form = document.getElementById('applicationForm');
    form.style.display = 'block';
    form.reset();
    document.getElementById('successMessage').style.display = 'none';
    document.querySelector('.file-label span').textContent = 'Choose file or drag here';
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

function closeApplicationModal() {
    const modal = document.getElementById('applicationModal');
    modal.style.display = 'none';
    
    // Re-enable body scroll
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('applicationModal');
    if (event.target === modal) {
        closeApplicationModal();
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add parallax effect to hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-section');
    
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Animate numbers in hero stats
function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const originalText = stat.textContent;
        
        // Skip animation for non-numeric values like "∞" and "100%"
        if (originalText === '∞' || originalText.includes('%')) {
            return; // Keep original text, no animation needed
        }
        
        const target = parseInt(originalText);
        
        // Skip if target is not a valid number
        if (isNaN(target)) {
            return;
        }
        
        const increment = target / 50;
        let current = 0;
        
        const updateNumber = () => {
            current += increment;
            if (current < target) {
                stat.textContent = Math.floor(current) + (originalText.includes('+') ? '+' : '');
                requestAnimationFrame(updateNumber);
            } else {
                stat.textContent = target + (originalText.includes('+') ? '+' : '');
            }
        };
        
        // Start animation when element is in view
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateNumber();
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(stat);
    });
}

// Initialize number animation
animateNumbers();

// Add hover effect to job cards
document.querySelectorAll('.job-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Header scroll effect
let lastScroll = 0;
const header = document.getElementById('header');
const mobileHeader = document.getElementById('mobile-header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > lastScroll && currentScroll > 100) {
        // Scrolling down
        if (header) header.style.transform = 'translateY(-100%)';
        if (mobileHeader) mobileHeader.classList.add('header-hidden');
    } else {
        // Scrolling up
        if (header) header.style.transform = 'translateY(0)';
        if (mobileHeader) mobileHeader.classList.remove('header-hidden');
    }
    
    lastScroll = currentScroll;
});

// Mobile Navigation Functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const body = document.body;

    if (mobileMenuToggle && mobileNav) {
        // Toggle mobile menu
        mobileMenuToggle.addEventListener('click', function() {
            const isActive = mobileNav.classList.contains('active');
            
            if (isActive) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        // Close menu when clicking on navigation links
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Small delay to allow smooth scrolling to complete
                setTimeout(() => {
                    closeMobileMenu();
                }, 300);
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = mobileNav.contains(event.target);
            const isClickOnToggle = mobileMenuToggle.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnToggle && mobileNav.classList.contains('active')) {
                closeMobileMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && mobileNav.classList.contains('active')) {
                closeMobileMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && mobileNav.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    function openMobileMenu() {
        mobileNav.classList.add('active');
        mobileMenuToggle.classList.add('active');
        body.classList.add('mobile-menu-open');
        
        // Improve accessibility
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        mobileNav.setAttribute('aria-hidden', 'false');
    }

    function closeMobileMenu() {
        mobileNav.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        body.classList.remove('mobile-menu-open');
        
        // Improve accessibility
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
    }
});