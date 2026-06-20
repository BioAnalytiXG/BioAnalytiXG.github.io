// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            
            // Special handling for timeline items
            if (entry.target.classList.contains('timeline-section')) {
                const timelineItems = entry.target.querySelectorAll('.timeline-item');
                timelineItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('show');
                    }, index * 200);
                });
            }
        }
    });

}, observerOptions);

// Observe all fade-in elements
document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Smooth scroll for anchor links
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

// Initialize Awards Carousel with pure CSS animation for seamless infinite scroll
document.addEventListener("DOMContentLoaded", function() {
    // Add a small delay to ensure all images and content are loaded
    setTimeout(() => {
        initCarousel();
    }, 300);
    
    function initCarousel() {
        const carousel = document.querySelector('.awards-carousel');
        const wrapper = carousel?.querySelector('.swiper-wrapper');
        
        if (!carousel || !wrapper) {
            console.error('Carousel or wrapper not found');
            return;
        }
        
        // Remove any existing clones
        const existingClones = wrapper.querySelectorAll('.swiper-slide.cloned');
        existingClones.forEach(clone => clone.remove());
        
        // Get original slides - use more specific selector
        const slides = Array.from(wrapper.children).filter(child => 
            child.classList.contains('swiper-slide') && !child.classList.contains('cloned')
        );
        
        console.log(`Found ${slides.length} slides`);
        
        if (slides.length === 0) {
            console.error('No slides found!');
            return;
        }
        
        // Clone all slides to create seamless infinite effect
        slides.forEach(slide => {
            const clone = slide.cloneNode(true);
            clone.classList.add('cloned');
            wrapper.appendChild(clone);
        });
        
        console.log(`After cloning: ${wrapper.children.length} total elements (${slides.length} originals + ${slides.length} clones)`);
        
        // Calculate dimensions based on viewport
        let slideWidth, gap;
        if (window.innerWidth <= 480) {
            slideWidth = 280;
            gap = 100;
        } else if (window.innerWidth <= 768) {
            slideWidth = 320;
            gap = 120;
        } else {
            slideWidth = 380;
            gap = 150;
        }
        
        const totalWidth = slideWidth + gap;
        const totalSlides = slides.length;
        const animationDistance = totalWidth * totalSlides;
        
        // Increase duration to slow down animation (was 5s per slide, now 8s)
        const duration = totalSlides * 8;
        
        // Remove old style if exists
        const oldStyle = document.getElementById('carousel-animation');
        if (oldStyle) oldStyle.remove();
        
        // Create keyframes dynamically
        const styleSheet = document.createElement('style');
        styleSheet.id = 'carousel-animation';
        styleSheet.textContent = `
            .swiper-wrapper .swiper-slide {
                margin-right: ${gap}px;
            }
            @keyframes scroll-awards {
                0% { transform: translateX(0); }
                100% { transform: translateX(-${animationDistance}px); }
            }
        `;
        document.head.appendChild(styleSheet);
        
        // Apply CSS animation with slower duration
        wrapper.style.animation = `scroll-awards ${duration}s linear infinite`;
        
        // Pause on hover
        carousel.addEventListener('mouseenter', () => {
            wrapper.style.animationPlayState = 'paused';
        });
        
        carousel.addEventListener('mouseleave', () => {
            wrapper.style.animationPlayState = 'running';
        });
    }
    
    // Initialize on load
    initCarousel();
    
    // Reinitialize on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(initCarousel, 250);
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
