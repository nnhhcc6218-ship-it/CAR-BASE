// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Active nav link highlight on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            const id = section.getAttribute('id');
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Contact Form Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const phone = this.querySelector('input[type="tel"]').value;
        const service = this.querySelector('select').value;
        const message = this.querySelector('textarea').value;

        // Validate
        if (!name || !email || !phone || !service || !message) {
            alert('모든 항목을 입력해주세요.');
            return;
        }

        // Create mailto link
        const subject = `CAR BASE 상담신청 - ${service}`;
        const body = `
이름: ${name}
이메일: ${email}
전화: ${phone}
서비스: ${service}

메시지:
${message}
        `.trim();

        // Send email (using mailto as fallback)
        const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // For demo purposes, show success message
        alert('상담신청이 전송되었습니다. 빠른 시간 내에 연락드리겠습니다.');
        this.reset();

        // Optionally open email client
        // window.location.href = mailtoLink;
    });
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply animations to cards
document.querySelectorAll('.service-card, .portfolio-item, .social-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Scroll to top button
window.addEventListener('scroll', () => {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.scrollY > 300) {
        if (!scrollButton) {
            const btn = document.createElement('button');
            btn.className = 'scroll-to-top';
            btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
            btn.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                background: var(--secondary-color);
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                z-index: 99;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                transition: all 0.3s;
                box-shadow: var(--shadow);
            `;
            
            btn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
            });

            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });

            document.body.appendChild(btn);
        }
    } else {
        const btn = document.querySelector('.scroll-to-top');
        if (btn) btn.remove();
    }
});

// Analytics tracking (optional)
console.log('CAR BASE website loaded successfully');

// Service page redirect
const serviceButtons = document.querySelectorAll('.service-link');
serviceButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const service = this.getAttribute('data-service');
        document.querySelector('select').value = service;
        document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
    });
});