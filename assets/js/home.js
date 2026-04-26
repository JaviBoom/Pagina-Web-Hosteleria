const yearEl = document.getElementById('year');

if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

const revealItems = document.querySelectorAll('[data-reveal]');

if (revealItems.length) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.18,
        rootMargin: '0px 0px -40px 0px',
    });

    revealItems.forEach((item) => revealObserver.observe(item));
}

const heroSection = document.querySelector('.hero');

if (heroSection) {
    const updateGlow = (event) => {
        const bounds = heroSection.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;

        heroSection.style.setProperty('--hero-x', `${Math.min(90, Math.max(10, x))}%`);
        heroSection.style.setProperty('--hero-y', `${Math.min(80, Math.max(12, y))}%`);
    };

    heroSection.addEventListener('mousemove', updateGlow);
    heroSection.addEventListener('mouseleave', () => {
        heroSection.style.setProperty('--hero-x', '72%');
        heroSection.style.setProperty('--hero-y', '20%');
    });
}
