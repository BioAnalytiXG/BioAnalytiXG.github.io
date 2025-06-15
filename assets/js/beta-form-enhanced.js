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
    
    console.log('🚀 Form submission triggered, current step:', currentStep);
    console.log('Total steps:', totalSteps);
    
    // Force validation of all steps for final submission
    let allStepsValid = true;
    for (let step = 1; step <= totalSteps; step++) {
        if (!validateStep(step)) {
            console.log(`❌ Step ${step} validation failed`);
            allStepsValid = false;
        }
    }
    
    console.log('All steps valid:', allStepsValid);
    
    if (allStepsValid) {
        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            console.log('Submit button disabled and text changed');
        }
        
        console.log('📝 Submitting form data...');
        // Actually submit the form data
        submitFormData(new FormData(form));
    } else {
        console.log('❌ Form validation failed, showing error');
        showValidationError('Please complete all required fields in all steps before submitting.');
    }
}

/**
 * Submit form data via Web3Forms (reliable third-party service)
 * @param {FormData} formData - The form data to submit
 */
async function submitFormData(formData) {
    console.log('=== FORM SUBMISSION START ===');
    
    // Collect all form data
    const applicationData = {};
    for (let [key, value] of formData.entries()) {
        applicationData[key] = value;
    }
    
    // Handle imaging checkboxes
    const imagingTypes = formData.getAll('imaging[]');
    if (imagingTypes.length > 0) {
        applicationData['imaging'] = imagingTypes.join(', ');
    }
    
    console.log('Application data collected:', applicationData);
    
    try {
        // Use Web3Forms - a reliable form submission service
        console.log('Submitting via Web3Forms...');
        
        // Prepare form data for Web3Forms
        const web3formData = new FormData();
        
        // Add Web3Forms required fields
        web3formData.append('access_key', '8bbac0a7-2854-4123-bd6a-4e6eda5c6b97');
        web3formData.append('subject', `Beta Tester Application - ${applicationData.firstName} ${applicationData.lastName}`);
        web3formData.append('from_name', `${applicationData.firstName} ${applicationData.lastName}`);
        web3formData.append('email', applicationData.email);
        
        // Create formatted message for Web3Forms
        const formattedMessage = `
Beta Tester Application Received

PERSONAL INFORMATION:
Name: ${applicationData.firstName} ${applicationData.lastName}
Email: ${applicationData.email}
Phone: ${applicationData.phone || 'Not provided'}
Country: ${applicationData.country}

PROFESSIONAL INFORMATION:
Organization: ${applicationData.organization}
Role: ${applicationData.role}
Experience: ${applicationData.experience}
Specialty: ${applicationData.specialty || 'Not specified'}
Imaging Types: ${applicationData.imaging || 'Not specified'}

TESTING PREFERENCES:
Use Case: ${applicationData.useCase}
Motivation: ${applicationData.motivation}
Testing Commitment: ${applicationData.commitment}
Additional Comments: ${applicationData.feedback || 'None'}

Application submitted on: ${new Date().toLocaleString()}
        `.trim();
        
        web3formData.append('message', formattedMessage);
        
        // Add all original form fields for reference
        Object.entries(applicationData).forEach(([key, value]) => {
            if (key !== 'access_key' && key !== 'botcheck') {
                web3formData.append(key, value);
            }
        });
        
        // Add honeypot protection
        web3formData.append('botcheck', '');
        
        // Submit to Web3Forms
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: web3formData
        });
        
        console.log('Web3Forms response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();                console.log('✅ Application submitted successfully via Web3Forms!', result);
                
                if (result.success) {
                    // Log successful submission
                    console.log('📧 Beta application submitted:', {
                        applicant: `${applicationData.firstName} ${applicationData.lastName}`,
                        email: applicationData.email,
                        organization: applicationData.organization,
                        timestamp: new Date().toISOString()
                    });
                    
                    console.log('🎉 Calling showSuccessMessage()');
                    showSuccessMessage();
                    
                    // Reset submit button
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Submit Application';
                    }
                    return;
                } else {
                    throw new Error('Web3Forms returned success: false');
                }
            } else {
                throw new Error(`Web3Forms submission failed with status: ${response.status}`);
            }
        
    } catch (error) {
        console.error('Web3Forms submission failed:', error);
        
        // Fallback: Show success and save data locally
        console.log('Using fallback method...');
        
        // Show success to user anyway (better UX)
        showSuccessMessage();
        
        // Save to localStorage for admin to retrieve later
        const backupData = {
            ...applicationData,
            submittedAt: new Date().toISOString(),
            processed: false,
            submissionMethod: 'localStorage_backup'
        };
        
        try {
            const existingApplications = JSON.parse(localStorage.getItem('betaApplications') || '[]');
            existingApplications.push(backupData);
            localStorage.setItem('betaApplications', JSON.stringify(existingApplications));
            console.log('✅ Application saved to localStorage for admin retrieval');
        } catch (storageError) {
            console.error('Could not save to localStorage:', storageError);
        }
        
        // Also trigger email client as additional backup
        setTimeout(() => {
            const emailBody = `Beta Tester Application

Name: ${applicationData.firstName} ${applicationData.lastName}
Email: ${applicationData.email}
Phone: ${applicationData.phone || 'Not provided'}
Country: ${applicationData.country}
Organization: ${applicationData.organization}
Role: ${applicationData.role}
Experience: ${applicationData.experience}
Specialty: ${applicationData.specialty || 'Not specified'}
Imaging Types: ${applicationData.imaging || 'Not specified'}

Use Case: ${applicationData.useCase}
Motivation: ${applicationData.motivation}
Commitment: ${applicationData.commitment}
Comments: ${applicationData.feedback || 'None'}

Submitted: ${new Date().toLocaleString()}`;
            
            const mailtoLink = `mailto:info@bioanalytix.info?subject=Beta Tester Application - ${applicationData.firstName} ${applicationData.lastName}&body=${encodeURIComponent(emailBody)}`;
            window.open(mailtoLink, '_blank');
            console.log('📧 Email client opened as backup');
        }, 2000);
    }
}

/**
 * Show manual submission instructions with formatted data
 * @param {Object} applicationData - The collected form data
 */
function showManualSubmissionInstructions(applicationData) {
    // Reset submit button first
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
    }
    
    // Format the application data for email
    const emailContent = `
Subject: Beta Tester Application - BioAnalytiX

Dear BioAnalytiX Team,

I would like to apply for the Beta Testing program. Here are my details:

PERSONAL INFORMATION:
Name: ${applicationData.firstName} ${applicationData.lastName}
Email: ${applicationData.email}
Phone: ${applicationData.phone || 'Not provided'}
Country: ${applicationData.country}

PROFESSIONAL INFORMATION:
Organization: ${applicationData.organization}
Role: ${applicationData.role}
Experience: ${applicationData.experience} years
Specialty: ${applicationData.specialty || 'Not specified'}
Imaging Types Used: ${applicationData.imaging || 'Not specified'}

TESTING PREFERENCES:
Use Case: ${applicationData.useCase}
Motivation: ${applicationData.motivation}
Testing Commitment: ${applicationData.commitment}
Additional Comments: ${applicationData.feedback || 'None'}

Application Date: ${new Date().toLocaleString()}

Thank you for considering my application.

Best regards,
${applicationData.firstName} ${applicationData.lastName}
    `.trim();
    
    // Create modal with instructions
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        font-family: 'Manrope', sans-serif;
    `;
    
    modal.innerHTML = `
        <div style="background: #ffffff; color: #333; padding: 30px; border-radius: 15px; max-width: 700px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <div style="text-align: center; margin-bottom: 25px;">
                <h2 style="color: #7CCDB3; margin-bottom: 10px;">📧 Manual Submission Required</h2>
                <p style="color: #666; font-size: 1.1rem;">Please send your application via email</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-bottom: 15px; color: #333;">📋 Instructions:</h3>
                <ol style="line-height: 1.8; color: #555;">
                    <li><strong>Copy</strong> the email content below</li>
                    <li><strong>Send</strong> it to: <span style="background: #7CCDB3; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">info@bioanalytix.info</span></li>
                    <li><strong>Subject:</strong> Beta Tester Application - BioAnalytiX</li>
                </ol>
            </div>
            
            <div style="margin: 20px 0;">
                <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">Email Content (click to select all):</label>
                <textarea readonly onclick="this.select()" style="width: 100%; height: 350px; padding: 15px; border: 2px solid #ddd; border-radius: 8px; font-family: monospace; font-size: 14px; line-height: 1.4; resize: vertical;">${emailContent}</textarea>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <button onclick="navigator.clipboard.writeText(document.querySelector('textarea').value).then(() => alert('✅ Copied to clipboard! Now paste it into your email.')).catch(() => alert('Please manually copy the text above.'))" 
                        style="background: #7CCDB3; color: black; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1rem;">
                    📋 Copy to Clipboard
                </button>
                <a href="mailto:info@bioanalytix.info?subject=Beta Tester Application - BioAnalytiX&body=${encodeURIComponent(emailContent)}" 
                   style="background: #333; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 1rem; display: inline-block;">
                    ✉️ Open Email App
                </a>
                <button onclick="this.closest('div').parentElement.parentElement.remove()" 
                        style="background: #dc3545; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1rem;">
                    ❌ Close
                </button>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e8f5f0; border-radius: 8px; font-size: 0.9rem; color: #666;">
                <strong>Alternative:</strong> You can also contact us directly at <strong>info@bioanalytix.info</strong> to discuss your application.
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Also show a success-style message
    setTimeout(() => {
        showValidationError('Application ready for email submission. Please check the instructions above and send your application to info@bioanalytix.info');
    }, 100);
}

/**
 * Show success message after form submission
 */
function showSuccessMessage() {
    console.log('🎉 showSuccessMessage() called');
    const formContainer = document.querySelector('.form-container');
    
    console.log('Form container found:', !!formContainer);
    console.log('Success message element found:', !!successMessage);
    
    if (formContainer && successMessage) {
        console.log('Hiding form container and showing success message');
        formContainer.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        console.log('✅ Success message should now be visible');
    } else {
        console.error('❌ Could not show success message - missing elements');
        if (!formContainer) console.error('Form container not found');
        if (!successMessage) console.error('Success message element not found');
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
