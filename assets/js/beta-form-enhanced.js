/**
 * Beta Tester Form Enhanced JavaScript
 * Handles form navigation, validation, and interactions
 */

// Form Step Navigation Variables
let currentStep = 1;
const totalSteps = 3;

// DOM Elements
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const form = document.getElementById('betaForm');
const successMessage = document.getElementById('successMessage');

/**
 * Initialize the application
 */
function initializeApp() {
    setupFormNavigation();
    setupFAQAccordion();
    setupFormFieldAnimations();
    setupFormValidation();
}

/**
 * Update the current step display and navigation
 * @param {number} step - The step number to display
 */
function updateStep(step) {
    // Update form steps
    document.querySelectorAll('.form-step').forEach(el => {
        el.classList.remove('active');
    });
    
    const currentFormStep = document.querySelector(`.form-step[data-step="${step}"]`);
    if (currentFormStep) {
        currentFormStep.classList.add('active');
    }
    
    // Update progress steps
    document.querySelectorAll('.step').forEach(el => {
        el.classList.remove('active');
    });
    
    for (let i = 1; i <= step; i++) {
        const stepElement = document.querySelector(`.step[data-step="${i}"]`);
        if (stepElement) {
            stepElement.classList.add('active');
        }
    }
    
    // Update navigation buttons
    updateNavigationButtons(step);
    
    // Scroll to top of form
    if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Update navigation button visibility and state
 * @param {number} step - Current step number
 */
function updateNavigationButtons(step) {
    if (!prevBtn || !nextBtn || !submitBtn) return;
    
    if (step === 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    } else if (step === totalSteps) {
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

/**
 * Validate the current form step
 * @param {number} step - The step number to validate
 * @returns {boolean} - Whether the step is valid
 */
function validateStep(step) {
    const currentFormStep = document.querySelector(`.form-step[data-step="${step}"]`);
    if (!currentFormStep) return false;
    
    const requiredFields = currentFormStep.querySelectorAll('[required]');
    let isValid = true;
    
    // Validate required fields
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#ff4444';
            field.setAttribute('aria-invalid', 'true');
        } else {
            field.style.borderColor = '';
            field.removeAttribute('aria-invalid');
        }
    });
    
    // Special validation for checkboxes in step 2
    if (step === 2) {
        const imagingCheckboxes = currentFormStep.querySelectorAll('input[name="imaging[]"]');
        const checkedImaging = currentFormStep.querySelectorAll('input[name="imaging[]"]:checked');
        
        if (checkedImaging.length === 0) {
            isValid = false;
            imagingCheckboxes.forEach(cb => {
                cb.parentElement.style.color = '#ff4444';
            });
        } else {
            imagingCheckboxes.forEach(cb => {
                cb.parentElement.style.color = '';
            });
        }
    }
    
    // Email validation
    const emailField = currentFormStep.querySelector('input[type="email"]');
    if (emailField && emailField.value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailField.value)) {
            isValid = false;
            emailField.style.borderColor = '#ff4444';
            emailField.setAttribute('aria-invalid', 'true');
        }
    }
    
    return isValid;
}

/**
 * Setup form navigation event listeners
 */
function setupFormNavigation() {
    // Next button event listener
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                if (currentStep < totalSteps) {
                    currentStep++;
                    updateStep(currentStep);
                }
            } else {
                showValidationError('Please fill in all required fields correctly.');
            }
        });
    }
    
    // Previous button event listener
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateStep(currentStep);
            }
        });
    }
    
    // Form submission event listener
    if (form) {
        form.addEventListener('submit', handleFormSubmission);
    }
}

/**
 * Handle form submission
 * @param {Event} e - Form submission event
 */
function handleFormSubmission(e) {
    e.preventDefault();
    
    console.log('Form submission triggered, current step:', currentStep);
    console.log('Total steps:', totalSteps);
    
    // Force validation of all steps for final submission
    let allStepsValid = true;
    for (let step = 1; step <= totalSteps; step++) {
        if (!validateStep(step)) {
            console.log(`Step ${step} validation failed`);
            allStepsValid = false;
        }
    }
    
    console.log('All steps valid:', allStepsValid);
    
    if (allStepsValid) {
        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
        }
        
        console.log('Submitting form data...');
        // Actually submit the form data
        submitFormData(new FormData(form));
    } else {
        console.log('Form validation failed, showing error');
        showValidationError('Please complete all required fields in all steps before submitting.');
    }
}

/**
 * Submit form data to server
 * @param {FormData} formData - The form data to submit
 */
async function submitFormData(formData) {
    try {
        console.log('=== FORM SUBMISSION DEBUG ===');
        console.log('Submitting form data to submit-beta-application.php');
        
        // Debug: Log form data
        console.log('Form data entries:');
        for (let [key, value] of formData.entries()) {
            console.log(`  ${key} = ${value}`);
        }
        
        console.log('Making fetch request...');
        const response = await fetch('submit-beta-application.php', {
            method: 'POST',
            body: formData
        });
        
        console.log('Response received!');
        console.log('Response status:', response.status);
        console.log('Response status text:', response.statusText);
        console.log('Response headers:', [...response.headers.entries()]);
        
        let result;
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
            console.log('Parsing JSON response...');
            result = await response.json();
            console.log('Server response (JSON):', result);
        } else {
            console.log('Non-JSON response detected!');
            const textResult = await response.text();
            console.log('Server response (text):', textResult);
            console.log('This will trigger "Server configuration error" message');
            throw new Error('Server returned non-JSON response: ' + textResult.substring(0, 200));
        }
        
        if (response.ok && result.success) {
            console.log('✅ Form submitted successfully!');
            showSuccessMessage();
        } else {
            console.error('❌ Server returned error:', result);
            let errorMessage = 'Submission failed. ';
            
            if (result.errors && Array.isArray(result.errors)) {
                errorMessage += result.errors.join(', ');
            } else if (result.message) {
                errorMessage += result.message;
            } else {
                errorMessage += 'Please check all required fields and try again.';
            }
            
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('💥 Form submission error:', error);
        console.error('Error stack:', error.stack);
        
        let userMessage = 'Submission failed. ';
        if (error.message.includes('Failed to fetch')) {
            userMessage += 'Cannot connect to server. Please check your internet connection.';
        } else if (error.message.includes('non-JSON response')) {
            userMessage += 'Server configuration error. Please contact support.';
        } else {
            userMessage += error.message || 'Please try again.';
        }
        
        console.log('Showing error message to user:', userMessage);
        showValidationError(userMessage);
        
        // Reset submit button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Application';
        }
    }
}

/**
 * Show success message after form submission
 */
function showSuccessMessage() {
    const formContainer = document.querySelector('.form-container');
    
    if (formContainer && successMessage) {
        formContainer.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Show validation error message
 * @param {string} message - Error message to display
 */
function showValidationError(message) {
    // Create or update error message element
    let errorElement = document.getElementById('form-error-message');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'form-error-message';
        errorElement.style.cssText = `
            background: rgba(255, 68, 68, 0.1);
            border: 1px solid #ff4444;
            color: #ff4444;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            text-align: center;
            animation: fadeIn 0.3s ease-out;
        `;
        
        const formNavigation = document.querySelector('.form-navigation');
        if (formNavigation) {
            formNavigation.parentNode.insertBefore(errorElement, formNavigation);
        }
    }
    
    errorElement.textContent = message;
    
    // Remove error message after 5 seconds
    setTimeout(() => {
        if (errorElement) {
            errorElement.remove();
        }
    }, 5000);
}

/**
 * Setup FAQ accordion functionality
 */
function setupFAQAccordion() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const wasActive = item.classList.contains('active');
            
            // Close all items
            document.querySelectorAll('.faq-item').forEach(faq => {
                faq.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!wasActive) {
                item.classList.add('active');
            }
        });
        
        // Add keyboard navigation
        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });
        
        // Make focusable
        question.setAttribute('tabindex', '0');
        question.setAttribute('role', 'button');
        question.setAttribute('aria-expanded', 'false');
        
        // Update aria-expanded when item is activated
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = mutation.target.classList.contains('active');
                    question.setAttribute('aria-expanded', isActive.toString());
                }
            });
        });
        
        observer.observe(question.parentElement, { attributes: true });
    });
}

/**
 * Setup form field animations and interactions
 */
function setupFormFieldAnimations() {
    document.querySelectorAll('input, select, textarea').forEach(field => {
        // Focus animations
        field.addEventListener('focus', () => {
            const formGroup = field.parentElement;
            if (formGroup) {
                formGroup.style.transform = 'scale(1.02)';
                formGroup.style.transition = 'transform 0.2s ease';
            }
        });
        
        // Blur animations
        field.addEventListener('blur', () => {
            const formGroup = field.parentElement;
            if (formGroup) {
                formGroup.style.transform = 'scale(1)';
            }
        });
        
        // Real-time validation feedback
        field.addEventListener('input', () => {
            if (field.hasAttribute('aria-invalid')) {
                field.removeAttribute('aria-invalid');
                field.style.borderColor = '';
            }
        });
    });
}

/**
 * Setup additional form validation
 */
function setupFormValidation() {
    // Phone number formatting
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length >= 10) {
                value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            }
            
            e.target.value = value;
        });
    }
    
    // Country-specific validation
    const countryField = document.getElementById('country');
    if (countryField) {
        countryField.addEventListener('change', (e) => {
            // You can add country-specific validation here
            console.log('Country selected:', e.target.value);
        });
    }
}

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

/**
 * Utility function to debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', initializeApp);

// Export functions for testing (if in a module environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateStep,
        validateStep,
        setupFormNavigation,
        setupFAQAccordion,
        setupFormFieldAnimations
    };
}
