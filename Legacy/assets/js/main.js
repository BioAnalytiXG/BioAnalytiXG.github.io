/*
	Hyperspace by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$sidebar = $('#sidebar');

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ null,      '480px'  ]
		});

	// Hack: Enable IE flexbox workarounds.
		if (browser.name == 'ie')
			$body.addClass('is-ie');

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

		$(document).ready(function() {
			// Forms.
			$('form').on('submit', function(event) {
				event.preventDefault(); // Prevent default form submission
		
				const form = this; // Get the raw DOM element
		
				if (form.checkValidity()) {
					form.submit(); // Proceed only if valid
				} else {
					form.reportValidity(); // Show native validation messages
				}
			});
		
			// Sidebar.
			if ($sidebar.length > 0) {
				var $sidebar_a = $sidebar.find('a');
		
				$sidebar_a
					.addClass('scrolly')
					.on('click', function() {
						var $this = $(this);
		
						// External link? Bail.
						if ($this.attr('href').charAt(0) != '#')
							return;
		
						// Deactivate all links.
						$sidebar_a.removeClass('active');
		
						// Activate link *and* lock it (so Scrollex doesn't try to activate other links as we're scrolling to this one's section).
						$this
							.addClass('active')
							.addClass('active-locked');
					})
					.each(function() {
						var $this = $(this),
							id = $this.attr('href'),
							$section = $(id);
		
						// No section for this link? Bail.
						if ($section.length < 1)
							return;
		
						// Scrollex.
						$section.scrollex({
							mode: 'middle',
							top: '-20vh',
							bottom: '-20vh',
							initialize: function() {
								// Deactivate section.
								$section.addClass('inactive');
							},
							enter: function() {
								// Activate section.
								$section.removeClass('inactive');
		
								// No locked links? Deactivate all links and activate this section's one.
								if ($sidebar_a.filter('.active-locked').length == 0) {
									$sidebar_a.removeClass('active');
									$this.addClass('active');
								}
		
								// Otherwise, if this section's link is the one that's locked, unlock it.
								else if ($this.hasClass('active-locked'))
									$this.removeClass('active-locked');
							}
						});
					});
			}
		});

	// Scrolly.
		$('.scrolly').scrolly({
			speed: 1000,
			offset: function() {

				// If <=large, >small, and sidebar is present, use its height as the offset.
					if (breakpoints.active('<=large')
					&&	!breakpoints.active('<=small')
					&&	$sidebar.length > 0)
						return $sidebar.height();

				return 0;

			}
		});

	// Spotlights.
		$('.spotlights > section')
			.scrollex({
				mode: 'middle',
				top: '-10vh',
				bottom: '-10vh',
				initialize: function() {

					// Deactivate section.
						$(this).addClass('inactive');

				},
				enter: function() {

					// Activate section.
						$(this).removeClass('inactive');

				}
			})
			.each(function() {

				var	$this = $(this),
					$image = $this.find('.image'),
					$img = $image.find('img'),
					x;

				// Assign image.
					$image.css('background-image', 'url(' + $img.attr('src') + ')');

				// Set background position.
					if (x = $img.data('position'))
						$image.css('background-position', x);

				// Hide <img>.
					$img.hide();

			});

	// Features.
    $('.features')
        .scrollex({
            mode: 'middle',
            top: '-20vh',
            bottom: '-20vh',
            initialize: function() {

                // Deactivate section.
                $(this).addClass('inactive');

            },
            enter: function() {

                // Activate section.
                $(this).removeClass('inactive');

            }
        });

		document.addEventListener("DOMContentLoaded", function() {
			const words = ["REPORTS", "AUTOMATION", "THROUGH THE WEB"];
			let i = 0;
			let j = 0;
			let isDeleting = false;
			const changingWord = document.getElementById("changing-word");
			const cursor = document.querySelector(".cursor");
			const typingSpeed = 100;
			const erasingSpeed = 50;
			const delayBetweenWords = 2000;
		
			function type() {
				const currentWord = words[i];
				cursor.style.display = "inline-block"; // Show cursor
				if (isDeleting) {
					changingWord.textContent = currentWord.substring(0, j--);
					if (j < 0) {
						isDeleting = false;
						i = (i + 1) % words.length;
						setTimeout(type, typingSpeed);
					} else {
						setTimeout(type, erasingSpeed);
					}
				} else {
					changingWord.textContent = currentWord.substring(0, j++);
					if (j > currentWord.length) {
						isDeleting = true;
						setTimeout(type, delayBetweenWords);
					} else {
						setTimeout(type, typingSpeed);
					}
				}
			}
		
			type();
		});

		document.addEventListener('DOMContentLoaded', function() {
			const faders = document.querySelectorAll('.fade-in');
	
			const options = {
				threshold: 0.1
			};
	
			const observer = new IntersectionObserver((entries, observer) => {
				entries.forEach(entry => {
					if(entry.isIntersecting) {
						entry.target.classList.add('show');
						observer.unobserve(entry.target); 
						// Unobserve so the animation doesn't repeat once it's visible
					}
				});
			}, options);
	
			faders.forEach(el => {
				observer.observe(el);
			});
		});

		document.addEventListener('DOMContentLoaded', function() {
			const items = document.querySelectorAll('.timeline-item');
			const options = {
				threshold: 0.1
			};
		
			const observer = new IntersectionObserver((entries, observer) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						entry.target.classList.add('show');
						observer.unobserve(entry.target);
					}
				});
			}, options);
		
			items.forEach(item => {
				observer.observe(item);
			});
		});

})(jQuery);

// Header scroll effect - Universal implementation
document.addEventListener('DOMContentLoaded', function() {
    let lastScroll = 0;
    const header = document.getElementById('header');
    const mobileHeader = document.getElementById('mobile-header');
    
    // Add transition style if not already present
    if (header) {
        const existingTransition = getComputedStyle(header).transition;
        if (!existingTransition.includes('transform')) {
            header.style.transition = 'transform 0.3s ease-in-out';
        }
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > lastScroll && currentScroll > 100) {
                // Scrolling down - hide header
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up - show header
                header.style.transform = 'translateY(0)';
            }
            
            lastScroll = currentScroll;
        });
    }

    // Mobile header scroll effect
    if (mobileHeader) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > lastScroll && currentScroll > 100) {
                // Scrolling down - hide mobile header
                mobileHeader.classList.add('header-hidden');
            } else {
                // Scrolling up - show mobile header
                mobileHeader.classList.remove('header-hidden');
            }
            
            lastScroll = currentScroll;
        });
    }

    // Mobile Navigation Functionality
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