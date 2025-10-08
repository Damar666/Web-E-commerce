// DOM Content Loaded - Pastikan semua elemen sudah dimuat
document.addEventListener('DOMContentLoaded', function () {

    /* =========================
       MOBILE MENU TOGGLE
    ========================== */
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.querySelector('.nav-overlay');

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
            if (navOverlay) navOverlay.classList.toggle('active');
        });
    }

    // Tutup menu jika overlay diklik
    if (navOverlay) {
        navOverlay.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            navLinks.classList.remove('active');
            navOverlay.classList.remove('active');
        });
    }

    // Tutup menu setelah klik link (di HP)
    document.querySelectorAll('#navLinks a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            navLinks.classList.remove('active');
            if (navOverlay) navOverlay.classList.remove('active');
        });
    });

    /* =========================
       SMOOTH SCROLL
    ========================== */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    /* =========================
       ORDER BUTTON
    ========================== */
    function redirectToOrder() {
        window.location.href = 'order.html';
    }

    document.querySelectorAll('.btn-order').forEach(button => {
        button.addEventListener('click', function () {
            // Ambil nama produk kalau ada
            const productName = this.parentElement.querySelector('h3')
                ? this.parentElement.querySelector('h3').textContent
                : 'NADJAR';

            // Klik animasi
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);

            // Redirect setelah animasi
            setTimeout(() => {
                redirectToOrder();
            }, 200);
        });
    });

    /* =========================
       HEADER SCROLL EFFECT
    ========================== */
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (header) {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    /* =========================
       SCROLL ANIMATIONS
    ========================== */
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe semua elemen animasi
    document.querySelectorAll('.product-card, .market-item, .contact-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        animationObserver.observe(el);
    });

    /* =========================
       PRODUCT CARD HOVER
    ========================== */
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.borderColor = '#4CAF50';
        });

        card.addEventListener('mouseleave', function () {
            if (!this.classList.contains('featured')) {
                this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }
        });
    });

    /* =========================
       COUNTER ANIMATION
    ========================== */
    function animateValue(element, start, end, duration) {
        if (!element) return;

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            element.innerHTML = current.toLocaleString('id-ID');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    const budgetObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const totalElement = document.querySelector('tr:last-child td:nth-last-child(2) strong');
                if (totalElement && !totalElement.classList.contains('animated')) {
                    totalElement.classList.add('animated');
                    animateValue(totalElement, 0, 479, 2000);
                }
            }
        });
    }, { threshold: 0.5 });

    const budgetSection = document.querySelector('.budget');
    if (budgetSection) {
        budgetObserver.observe(budgetSection);
    }
    

}); // End of DOMContentLoaded
