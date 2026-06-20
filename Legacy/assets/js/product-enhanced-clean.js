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

// Observe all stat numbers when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.stat-number').forEach(stat => {
        observer.observe(stat);
    });
});

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

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', function() {
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
});

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

// Loading animation for device mockups
document.addEventListener('DOMContentLoaded', function() {
    const mockups = document.querySelectorAll('.device-frame');
    mockups.forEach(mockup => {
        mockup.addEventListener('mouseenter', function() {
            const screen = this.querySelector('.mockup-screen');
            screen.style.background = 'linear-gradient(135deg, #0a0a0a, #1a1a1a)';
        });
        
        mockup.addEventListener('mouseleave', function() {
            const screen = this.querySelector('.mockup-screen');
            screen.style.background = '#0a0a0a';
        });
    });
});

// Enhanced button interactions
document.addEventListener('DOMContentLoaded', function() {
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
                const targetWidth = progressFill.getAttribute('data-width');
                
                setTimeout(() => {
                    progressFill.style.setProperty('--target-width', targetWidth + '%');
                    progressFill.style.width = targetWidth + '%';
                    progressFill.classList.add('animate');
                }, 200); // Small delay for better visual effect
            }
            progressObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.5,
    rootMargin: '0px 0px -20px 0px'
});

// Initialize progress bar animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Observe individual timeline items for progress bar animations
    document.querySelectorAll('.timeline-item').forEach((item, index) => {
        progressObserver.observe(item);
    });
});
