/* Enhanced Product Page JavaScript for BioAnalytiX */

// Tab functionality
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.closest('.tab-button').classList.add('active');
}

// Animated counter for stats
const observerOptions = {
    threshold: 0.7,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;
            const finalValue = parseFloat(target.getAttribute('data-target'));
            animateValue(target, 0, finalValue, 2000);
            observer.unobserve(target);
        }
    });
}, observerOptions);

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = progress * (end - start) + start;
        obj.innerHTML = Math.floor(value);
        
        // Add special formatting
        if (obj.parentElement.textContent.includes('Accuracy')) {
            obj.innerHTML = value.toFixed(1) + '%';
        } else if (obj.parentElement.textContent.includes('Time')) {
            obj.innerHTML = Math.floor(value) + '%';
        } else if (obj.parentElement.textContent.includes('Beta') || obj.parentElement.textContent.includes('Partner')) {
            obj.innerHTML = Math.floor(value) + '+';
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Add parallax effect to floating badges
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const badges = document.querySelectorAll('.floating-badge');
    badges.forEach((badge, index) => {
        const speed = index === 0 ? 0.5 : 0.3;
        badge.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Add scroll-triggered animations
const animationObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.addEventListener('DOMContentLoaded', function() {
    // Apply fade-in animation to sections
    const sections = document.querySelectorAll('.section-header, .process-step, .comparison-card, .stat-card');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        animationObserver.observe(section);
    });
});

// Header background on scroll
window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.style.backgroundColor = 'rgba(0, 0, 0, 0.98)';
        header.style.backdropFilter = 'blur(20px)';
    } else {
        header.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    }
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

// Consolidated DOM Content Loaded functionality
document.addEventListener('DOMContentLoaded', function() {
    // 1. Initialize stat number animations
    document.querySelectorAll('.stat-number').forEach(stat => {
        observer.observe(stat);
    });

    // 2. Initialize smooth scroll for anchor links
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

    // 3. Apply fade-in animation to sections
    const sections = document.querySelectorAll('.section-header, .process-step, .comparison-card, .stat-card');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        animationObserver.observe(section);
    });

    // 4. Mobile Navigation Functionality
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const body = document.body;

    if (mobileMenuToggle && mobileNav) {
        // Toggle mobile menu - add both click and touchstart for better mobile support
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = mobileNav.classList.contains('active');
            
            if (isActive) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        // Add touchstart for better mobile support
        mobileMenuToggle.addEventListener('touchstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
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

    // 5. Loading animation for device mockups
    const mockups = document.querySelectorAll('.device-frame');
    mockups.forEach(mockup => {
        mockup.addEventListener('mouseenter', function() {
            const screen = this.querySelector('.mockup-screen');
            if (screen) {
                screen.style.background = 'linear-gradient(135deg, #0a0a0a, #1a1a1a)';
            }
        });
        
        mockup.addEventListener('mouseleave', function() {
            const screen = this.querySelector('.mockup-screen');
            if (screen) {
                screen.style.background = '#0a0a0a';
            }
        });
    });

    // 6. Enhanced button interactions
    const buttons = document.querySelectorAll('.cta-button, .subscribe-button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // 7. Initialize progress bar animations
    setTimeout(() => {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach((item, index) => {
            progressObserver.observe(item);
        });
    }, 100);
});

// Add ripple effect CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        pointer-events: none;
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Progress Bar Animation
const progressObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progressFill = entry.target.querySelector('.progress-fill');
            if (progressFill && !progressFill.classList.contains('animate')) {
                const targetWidth = parseInt(progressFill.getAttribute('data-width'));
                
                // Reset to 0% first
                progressFill.style.width = '0%';
                progressFill.classList.add('animate');
                
                setTimeout(() => {
                    // Use both CSS and JS animation for better compatibility
                    progressFill.style.setProperty('--target-width', targetWidth + '%');
                    progressFill.style.width = targetWidth + '%';
                    
                    // Also use JavaScript animation as fallback
                    animateProgressBar(progressFill, targetWidth);
                }, 300); // Slightly longer delay for better visual effect
            }
            progressObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.3, // Lower threshold for earlier trigger
    rootMargin: '0px 0px -50px 0px'
});

// Alternative progress bar animation (fallback)
function animateProgressBar(progressFill, targetWidth) {
    const startWidth = 0;
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    
    function updateProgress(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-in-out)
        const easedProgress = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        const currentWidth = startWidth + (targetWidth - startWidth) * easedProgress;
        progressFill.style.width = currentWidth + '%';
        
        if (progress < 1) {
            requestAnimationFrame(updateProgress);
        }
    }
    
    requestAnimationFrame(updateProgress);
}
