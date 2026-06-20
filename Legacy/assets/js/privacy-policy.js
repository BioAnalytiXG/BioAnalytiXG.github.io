// Privacy Policy Page JavaScript

// Header background change on scroll (no hiding animation for privacy policy)
document.addEventListener('DOMContentLoaded', function() {
    const header = document.getElementById('header');

    if (header) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // Only change background color, no hiding animation
            if (currentScroll > 50) {
                header.style.backgroundColor = 'rgba(0, 0, 0, 0.98)';
            } else {
                header.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
            }
        });
    }
});