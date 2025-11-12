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
