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

// Initialize Awards Carousel
document.addEventListener('DOMContentLoaded', () => {
    let scrollTimeout;
    let isUserScrolling = false;
    
    const awardsCarousel = new Swiper('.awards-carousel', {
        // Main parameters
        loop: true,
        loopAdditionalSlides: 5, // extra clones for seamless looping
        centeredSlides: true,
        slidesPerView: 1,
        spaceBetween: 30,
        speed: 6000, // Slower for continuous movement
        allowTouchMove: false, // Disable touch/drag gestures
        simulateTouch: false, // Disable mouse dragging
        touchRatio: 0, // Disable touch sensitivity
        
        // Disable mousewheel control built into Swiper
        mousewheel: {
            enabled: false,
        },
        
        // Continuous autoplay without pause
        autoplay: {
            delay: 0, // No delay between transitions
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
            reverseDirection: false,
        },
        
        // Pagination
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },

        // Responsive breakpoints
        breakpoints: {
            // when window width is >= 768px
            768: {
                slidesPerView: 2,
                spaceBetween: 30,
                centeredSlides: false,
            },
            // when window width is >= 1024px
            1024: {
                slidesPerView: 3,
                spaceBetween: 30,
                centeredSlides: false,
            }
        }
    });
    
    // Additional wheel event handling for better MacBook trackpad support
    const carouselElement = document.querySelector('.awards-carousel');
    if (carouselElement) {
        carouselElement.addEventListener('wheel', function(e) {
            // Check if it's horizontal scrolling (common on MacBook trackpads)
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault();
                
                isUserScrolling = true;
                awardsCarousel.autoplay.stop();
                carouselElement.classList.add('swiper-manual-mode');
                clearTimeout(scrollTimeout);
                
                // Navigate based on scroll direction
                if (e.deltaX > 0) {
                    awardsCarousel.slideNext();
                } else {
                    awardsCarousel.slidePrev();
                }
                
                // Resume auto-movement after delay
                scrollTimeout = setTimeout(() => {
                    isUserScrolling = false;
                    carouselElement.classList.remove('swiper-manual-mode');
                    awardsCarousel.autoplay.start();
                }, 2000);
            }
        }, { passive: false });
        
        // Also handle vertical wheel events for better compatibility
        carouselElement.addEventListener('wheel', function(e) {
            // If primarily vertical scrolling but user is over carousel, treat as navigation
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && Math.abs(e.deltaY) > 10) {
                // Only capture if the scroll is significant and over the carousel
                const rect = carouselElement.getBoundingClientRect();
                const mouseY = e.clientY;
                const mouseX = e.clientX;
                
                if (mouseX >= rect.left && mouseX <= rect.right && 
                    mouseY >= rect.top && mouseY <= rect.bottom) {
                    
                    e.preventDefault();
                    
                    isUserScrolling = true;
                    awardsCarousel.autoplay.stop();
                    carouselElement.classList.add('swiper-manual-mode');
                    clearTimeout(scrollTimeout);
                    
                    // Navigate based on scroll direction
                    if (e.deltaY > 0) {
                        awardsCarousel.slideNext();
                    } else {
                        awardsCarousel.slidePrev();
                    }
                    
                    // Resume auto-movement after delay
                    scrollTimeout = setTimeout(() => {
                        isUserScrolling = false;
                        carouselElement.classList.remove('swiper-manual-mode');
                        awardsCarousel.autoplay.start();
                    }, 2000);
                }
            }
        }, { passive: false });
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
