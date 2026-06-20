document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const body = document.body;

    if (mobileMenuToggle && mobileNav) {
        mobileMenuToggle.addEventListener('click', () => {
            const isActive = mobileNav.classList.contains('active');
            mobileNav.classList.toggle('active', !isActive);
            mobileMenuToggle.classList.toggle('active', !isActive);
            body.classList.toggle('mobile-menu-open', !isActive);
        });
    }

    // Check if there's a hash in the URL and open the corresponding modal
    if (window.location.hash) {
        const articleId = window.location.hash.substring(1); // Remove the '#'
        if (articleData[articleId]) {
            setTimeout(() => {
                openModal(articleId);
            }, 500); // Small delay to ensure page is fully loaded
        }
    }

    const filterBtns = document.querySelectorAll('.filter-btn');
    const newsCards = document.querySelectorAll('.news-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function handleFilterClick() {
            const filter = this.getAttribute('data-filter');

            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            newsCards.forEach(card => {
                const category = card.getAttribute('data-category');
                const shouldShow = filter === 'all' || category === filter;

                card.style.display = shouldShow ? 'block' : 'none';
                if (shouldShow) {
                    card.style.animation = 'fadeInUp 0.6s ease forwards';
                }
            });
        });
    });

    newsCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    let lastScroll = 0;
    const header = document.getElementById('header');
    const mobileHeader = document.getElementById('mobile-header');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const shouldHide = currentScroll > lastScroll && currentScroll > 100;

        if (header) {
            header.style.transform = shouldHide ? 'translateY(-100%)' : 'translateY(0)';
        }

        if (mobileHeader) {
            mobileHeader.style.transform = shouldHide ? 'translateY(-100%)' : 'translateY(0)';
        }

        lastScroll = currentScroll;
    });
});

function toggleSources(button) {
    const container = button.closest('.source-links');
    if (!container) return;

    const sourceLinks = Array.from(container.querySelectorAll('.source-link'));

    if (!button.dataset.initialized) {
        const initiallyHidden = sourceLinks.filter(link => link.classList.contains('source-link-hidden'));
        initiallyHidden.forEach(link => {
            link.dataset.extraSource = 'true';
        });
        button.dataset.hiddenCount = initiallyHidden.length;
        button.dataset.initialized = 'true';
    }

    const hiddenCount = Number(button.dataset.hiddenCount) || 0;
    const isExpanded = button.classList.toggle('expanded');

    sourceLinks.forEach(link => {
        if (link.dataset.extraSource === 'true') {
            link.classList.toggle('source-link-hidden', !isExpanded);
        }
    });

    button.innerHTML = isExpanded
        ? '<i class="fas fa-minus"></i> Show Less'
        : `<i class="fas fa-plus"></i> ${hiddenCount} More`;
}

// Modal functionality
const articleData = {
    'partnership-renewal': {
        category: 'Company News',
        date: 'November 21, 2025',
        title: 'Strategic Partnership with General Hospital of Larissa Renewed and Expanded',
        content: `
            <p>We are proud to announce the renewal and expansion of our strategic partnership with the General Hospital of Larissa, a collaboration that continues to drive innovation in medical diagnostics and healthcare technology.</p>
            
            <h3>A Milestone in Healthcare Innovation</h3>
            <p>This renewed partnership marks another important milestone in our mission to advance medical diagnostics and foster innovation in healthcare. Together, we are building a future where cutting-edge bioanalytical technologies support hospitals, healthcare professionals, and — most importantly — patients.</p>
            
            <h3>Expanding Our Collaboration</h3>
            <p>The expansion of our partnership with General Hospital of Larissa reflects our shared commitment to:</p>
            <ul>
                <li>Implementing AI-powered diagnostic solutions in real-world clinical settings</li>
                <li>Supporting radiologists and healthcare professionals with advanced analytical tools</li>
                <li>Improving patient care through faster, more accurate diagnoses</li>
                <li>Advancing medical research and innovation in diagnostic imaging</li>
                <li>Establishing best practices for AI integration in healthcare facilities</li>
            </ul>
            
            <h3>Real-World Clinical Validation</h3>
            <p>Our partnership with General Hospital of Larissa provides invaluable opportunities to validate and refine our AI technology in actual clinical environments. This collaboration enables us to gather feedback from experienced radiologists, understand real-world workflow requirements, and ensure our solutions deliver tangible benefits to both healthcare providers and patients.</p>
            
            <h3>Gratitude and Recognition</h3>
            <p>We extend our sincere gratitude to:</p>
            <ul>
                <li><strong>Mr. Vlachakis Grigoris</strong>, Administrator of the General Hospital of Larissa, for his visionary leadership and continued support</li>
                <li><strong>Mr. Alexiou Evangelos</strong>, Director of the Radiology Department, for his expertise, collaboration, and trust in our technology</li>
                <li>The entire team at General Hospital of Larissa for their dedication to advancing healthcare through innovation</li>
            </ul>
            
            <h3>Looking Ahead</h3>
            <p>This expanded partnership strengthens our position as a leader in AI-powered medical diagnostics and demonstrates the real-world applicability of our solutions. We look forward to continuing our work with General Hospital of Larissa to push the boundaries of what's possible in diagnostic medicine.</p>
            
            <p>Together, we are creating a healthcare future where advanced technology works hand-in-hand with medical expertise to deliver better outcomes for patients across Greece and beyond.</p>
            
            <p class="news-location"><i class="fas fa-map-marker-alt"></i> Larissa, Greece | <i class="far fa-calendar"></i> November 21, 2025</p>
        `
    },
    'forbes': {
        category: 'Press Coverage',
        date: 'October 2025',
        title: 'BioAnalytiX Named to Forbes Greece "30 Under 30"',
        content: `
            <p>We are thrilled to announce that BioAnalytiX has been recognized in the prestigious Forbes Greece "30 Under 30" list for 2026, marking a significant milestone in our journey to revolutionize medical diagnostics through artificial intelligence.</p>
            
            <h3>A Recognition of Innovation and Impact</h3>
            <p>This honor celebrates our team's dedication to transforming healthcare through cutting-edge AI technology. Being named among Greece's most promising young innovators validates our mission to make advanced medical diagnostics accessible and accurate for healthcare professionals worldwide.</p>
            
            <h3>Our Journey So Far</h3>
            <p>Since our founding in March 2024, BioAnalytiX has been at the forefront of developing AI-powered solutions for medical imaging analysis. Our flagship product focuses on brain CT scan analysis, helping radiologists detect anomalies with unprecedented accuracy and speed.</p>
            
            <h3>What This Means for Healthcare</h3>
            <p>This recognition amplifies our commitment to:</p>
            <ul>
                <li>Enhancing diagnostic accuracy through advanced AI algorithms</li>
                <li>Reducing time-to-diagnosis for critical conditions</li>
                <li>Supporting healthcare professionals with intelligent decision-making tools</li>
                <li>Making cutting-edge medical technology accessible to healthcare facilities of all sizes</li>
            </ul>
            
            <h3>Looking Forward</h3>
            <p>This achievement motivates us to push boundaries further. We're continuing to refine our technology, expand our partnerships, and work towards our vision of AI-assisted diagnostics becoming a standard of care in medical institutions globally.</p>
            
            <p>We extend our gratitude to Forbes Greece, our partners, advisors, and the healthcare professionals who have supported our mission. This is just the beginning of our journey to transform medical diagnostics.</p>
        `
    },
    'acta': {
        category: 'Company News',
        date: 'May 2025',
        title: 'Strategic Partnership with ACTA Lab',
        content: `
            <p>BioAnalytiX is excited to announce a strategic partnership with ACTA Lab, a leading research institution in medical imaging and artificial intelligence. This collaboration marks a pivotal step in advancing our AI-powered diagnostic solutions.</p>
            
            <h3>Partnership Objectives</h3>
            <p>Through this partnership, we aim to:</p>
            <ul>
                <li>Share cutting-edge research infrastructure and computational resources</li>
                <li>Collaborate on peer-reviewed research publications</li>
                <li>Access diverse medical imaging datasets for algorithm training</li>
                <li>Accelerate the development and validation of our AI models</li>
            </ul>
            
            <h3>Advancing Medical AI Research</h3>
            <p>ACTA Lab brings years of expertise in medical imaging and machine learning research. Their advanced facilities and research methodologies will enable us to refine our algorithms and expand our diagnostic capabilities beyond brain imaging.</p>
            
            <h3>Impact on Healthcare</h3>
            <p>This partnership will accelerate the development of more robust, clinically validated AI solutions that healthcare professionals can trust. By combining academic rigor with entrepreneurial innovation, we're working to bridge the gap between research and real-world clinical applications.</p>
            
            <h3>Commitment to Scientific Excellence</h3>
            <p>We remain committed to evidence-based development, ensuring our solutions meet the highest standards of medical accuracy and reliability. This partnership reinforces our dedication to scientific excellence and responsible AI development in healthcare.</p>
        `
    },
    'innohealth': {
        category: 'Awards',
        date: 'September 2024',
        title: 'Second Place at InnoHealth 2024',
        content: `
            <p>BioAnalytiX secured second place at the prestigious InnoHealth Forum 2024 Hackathon, competing against innovative healthtech startups. This achievement validates our approach to solving critical challenges in medical diagnostics.</p>
            
            <h3>The Competition</h3>
            <p>InnoHealth Forum is one of Greece's premier healthcare innovation events, bringing together startups, healthcare professionals, investors, and technology experts. The hackathon challenged participants to present solutions that could transform healthcare delivery and improve patient outcomes.</p>
            
            <h3>Our Presentation</h3>
            <p>We demonstrated how our AI-powered diagnostic platform addresses key challenges in radiology:</p>
            <ul>
                <li>Reducing diagnostic time for emergency cases</li>
                <li>Improving accuracy in detecting subtle abnormalities</li>
                <li>Supporting radiologists with intelligent second opinions</li>
                <li>Streamlining workflow in busy healthcare facilities</li>
            </ul>
            
            <h3>Feedback from Judges</h3>
            <p>The judging panel, comprising leading healthcare professionals and investors, praised our solution's clinical relevance, technical sophistication, and potential for real-world impact. They particularly noted our focus on user experience and seamless integration with existing hospital systems.</p>
            
        `
    },
    'yerame': {
        category: 'Awards',
        date: 'September 2024',
        title: 'First Place at YERAME 2024',
        content: `
            <p>BioAnalytiX proudly achieved first place at YERAME 2024 (Young Entrepreneurs in Rural Areas Meet Europe), an innovation competition focused on sustainable development and technological solutions for rural communities.</p>
            
            <h3>Bridging Urban and Rural Healthcare</h3>
            <p>While our technology is applicable worldwide, we emphasized its particular value for rural and underserved areas where access to specialized radiological expertise is limited. Our AI solution can provide expert-level diagnostic support regardless of geographic location.</p>
            
            <h3>Addressing Healthcare Disparities</h3>
            <p>Rural healthcare facilities often face challenges including:</p>
            <ul>
                <li>Limited access to specialized radiologists</li>
                <li>Longer wait times for diagnostic reports</li>
                <li>Need for patient transfers to urban centers</li>
                <li>Higher costs due to resource scarcity</li>
            </ul>
            
            <p>Our AI-powered platform addresses these challenges by providing instant, accurate preliminary analysis that helps local physicians make informed decisions quickly.</p>
            
            <h3>Recognition of Social Impact</h3>
            <p>The YERAME judges recognized not just our technological innovation but our commitment to healthcare equity. By making advanced diagnostic capabilities accessible to smaller facilities, we're working to ensure quality healthcare isn't determined by geography.</p>
            
        `
    },
    'ennovation': {
        category: 'Awards',
        date: 'July 2024',
        title: 'First Place at Ennovation 2024',
        content: `
            <p>BioAnalytiX won the Young Entrepreneurship Award at Ennovation 2024, one of Greece's most competitive startup competitions organized by the University of Thessaly. This is one of our first major recognitions and provided crucial early validation for our vision.</p>
            
            <h3>The Ennovation Challenge</h3>
            <p>Ennovation brings together student entrepreneurs and early-stage startups to compete across various categories. We competed in the Technology and Innovation track, presenting our solution to a panel of experienced entrepreneurs, investors, and academic leaders.</p>
            
            <h3>Early Stage Recognition</h3>
            <p>Winning this award just months after our founding was a turning point for BioAnalytiX. It provided:</p>
            <ul>
                <li>Validation of our business model and technology approach</li>
                <li>Increased visibility within the Greek startup ecosystem</li>
                <li>Valuable feedback from industry experts</li>
                <li>Connections with potential partners and mentors</li>
                <li>Prize funding to support early development</li>
            </ul>
            
            <h3>Building on Success</h3>
            <p>The recognition from Ennovation gave us momentum to pursue larger opportunities and attract attention from healthcare institutions interested in piloting our technology. It validated that our team's combination of medical knowledge, AI expertise, and entrepreneurial drive could create real value in healthcare.</p>
            
            <h3>Gratitude and Growth</h3>
            <p>We're grateful to the University of Thessaly and Ennovation organizers for creating opportunities for young entrepreneurs. This award marked the beginning of our journey from concept to market-ready solution, and we continue to build on the foundation it helped establish.</p>
        `
    },
    'founded': {
        category: 'Company News',
        date: 'March 2024',
        title: 'BioAnalytiX Founded',
        content: `
            <p>March 2024 marked the official founding of BioAnalytiX, born from a shared vision to transform medical diagnostics through artificial intelligence. Our journey began with a simple question: Could AI help doctors make faster, more accurate diagnoses?</p>
            
            <h3>The Genesis</h3>
            <p>Our founding team brought together diverse expertise in medicine, computer science, and AI research. We recognized that while medical imaging technology had advanced tremendously, radiologists faced increasing workloads and pressure to deliver rapid, accurate diagnoses. We saw an opportunity to create AI tools that would augment—not replace—human expertise.</p>
            
            <h3>Our Mission</h3>
            <p>From day one, we committed to:</p>
            <ul>
                <li>Developing clinically validated AI solutions that healthcare professionals can trust</li>
                <li>Making advanced diagnostic technology accessible to healthcare facilities of all sizes</li>
                <li>Maintaining the highest standards of medical accuracy and patient safety</li>
                <li>Fostering collaboration between AI technology and medical expertise</li>
                <li>Contributing to healthcare equity through accessible technology</li>
            </ul>
            
            <h3>Early Challenges and Learning</h3>
            <p>Starting a healthtech company meant navigating complex regulatory requirements, building relationships with healthcare institutions, and ensuring our technology met rigorous medical standards. Each challenge taught us valuable lessons about the intersection of healthcare and technology.</p>
            
            <h3>Building the Foundation</h3>
            <p>Our first months focused on:</p>
            <ul>
                <li>Assembling a world-class team of AI engineers and medical advisors</li>
                <li>Developing our core technology for brain CT scan analysis</li>
                <li>Establishing partnerships with research institutions</li>
                <li>Engaging with radiologists to understand their needs</li>
                <li>Laying the groundwork for clinical validation studies</li>
            </ul>
            
            <h3>Looking Back, Moving Forward</h3>
            <p>Less than two years since our founding, we've achieved multiple awards, formed strategic partnerships, and gained recognition on national platforms like Forbes Greece. But we're just getting started. Every day brings us closer to our vision of AI-assisted diagnostics becoming a standard of care in medical institutions worldwide.</p>
            
            <p>We remain grateful to everyone who believed in our mission from the beginning—our advisors, partners, early supporters, and the healthcare professionals who continue to guide our development with their expertise and insights.</p>
        `
    }
};

function openModal(articleId) {
    const modal = document.getElementById('articleModal');
    const data = articleData[articleId];
    
    if (!data) return;
    
    document.querySelector('.modal-category').textContent = data.category;
    document.querySelector('.modal-date').innerHTML = `<i class="far fa-calendar"></i> ${data.date}`;
    document.querySelector('.modal-title').textContent = data.title;
    document.querySelector('.modal-body').innerHTML = data.content;
    
    // Copy sources if they exist
    const card = document.querySelector(`[data-article="${articleId}"]`);
    const sources = card?.querySelector('.media-sources');
    const modalSources = document.querySelector('.modal-sources');
    
    if (sources) {
        modalSources.innerHTML = sources.outerHTML;
    } else {
        modalSources.innerHTML = '';
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('articleModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('articleModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});
