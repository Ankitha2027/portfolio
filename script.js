document.addEventListener('DOMContentLoaded', () => {
    // Utility to get CSS variable
    const getCssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    // Colors from CSS
    const colors = {
        accentBlue: getCssVar('--accent-blue') || '#3B82F6',
        accentPurple: getCssVar('--accent-purple') || '#9333EA',
        softBlue: getCssVar('--soft-blue') || '#EAF4FC',
        mainBgBlue: getCssVar('--main-bg-blue') || '#D0E0F0',
        cyan: 'rgba(6, 182, 212, 0.5)'
    };

    // Particle Canvas
    const canvas = document.getElementById('particle-canvas');
    if (canvas && canvas.getContext) {
        const ctx = canvas.getContext('2d', { alpha: true });
        let particles = [];

        // Set canvas size
        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        // Mouse position
        let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        // Particle Class
        class Particle {
            constructor(x, y, radius, color, velocity, type = 'star') {
                this.x = x;
                this.y = y;
                this.radius = radius;
                this.color = color;
                this.velocity = velocity;
                this.type = type;
                this.opacity = type === 'star' ? Math.random() * 0.3 + 0.2 : 0.4;
                this.angle = Math.random() * Math.PI * 2;
                this.orbitRadius = type === 'circle' ? Math.random() * 50 + 20 : 0;
                this.time = Math.random() * 100;
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = this.color;

                if (this.type === 'star') {
                    const spikes = 4;
                    const outerRadius = this.radius;
                    const innerRadius = this.radius / 2;
                    ctx.beginPath();
                    ctx.translate(this.x, this.y);
                    ctx.moveTo(0, -outerRadius);
                    for (let i = 0; i < spikes; i++) {
                        ctx.rotate(Math.PI / spikes);
                        ctx.lineTo(0, -innerRadius);
                        ctx.rotate(Math.PI / spikes);
                        ctx.lineTo(0, -outerRadius);
                    }
                    ctx.closePath();
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }

            update() {
                this.time += 0.02;
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (this.type === 'star') {
                    this.opacity = 0.2 + Math.sin(this.time) * 0.1;
                    this.x += this.velocity.x * 0.6;
                    this.y += this.velocity.y * 0.6;
                    if (distance < 50) {
                        const force = (50 - distance) / 50;
                        this.x -= (dx / distance) * force * 0.8;
                        this.y -= (dy / distance) * force * 0.8;
                    }
                } else {
                    this.angle += 0.02;
                    const targetX = mouse.x + Math.cos(this.angle) * this.orbitRadius;
                    const targetY = mouse.y + Math.sin(this.angle) * this.orbitRadius;
                    this.x += (targetX - this.x) * 0.08;
                    this.y += (targetY - this.y) * 0.08;
                    this.radius = this.radius * (1 + Math.sin(this.time) * 0.08);
                    this.opacity = 0.3 + Math.sin(this.time) * 0.08;
                }

                // Wrap particles
                if (this.x < -this.radius) this.x = canvas.width + this.radius;
                else if (this.x > canvas.width + this.radius) this.x = -this.radius;
                if (this.y < -this.radius) this.y = canvas.height + this.radius;
                else if (this.y > canvas.height + this.radius) this.y = -this.radius;
            }
        }

        function initParticles() {
            particles = [];
            const isMobile = window.innerWidth <= 768;
            const numStars = isMobile ? 20 : 40;
            const numCircles = isMobile ? 5 : 10;

            for (let i = 0; i < numStars; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const radius = Math.random() * 0.8 + 0.2;
                const color = colors.softBlue;
                const velocity = { x: (Math.random() - 0.5) * 0.15, y: (Math.random() - 0.5) * 0.15 };
                particles.push(new Particle(x, y, radius, color, velocity, 'star'));
            }

            for (let i = 0; i < numCircles; i++) {
                const x = mouse.x;
                const y = mouse.y;
                const radius = Math.random() * 4 + 1.5;
                const color = i % 2 === 0 ? colors.accentBlue : colors.cyan;
                const velocity = { x: 0, y: 0 };
                particles.push(new Particle(x, y, radius, color, velocity, 'circle'));
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            requestAnimationFrame(animate);
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
            initParticles();
            animate();
        } else {
            ctx.fillStyle = colors.mainBgBlue;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    // Progress Rings
    const circles = document.querySelectorAll('.progress-ring__circle--value');
    circles.forEach(circle => {
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const percent = circle.getAttribute('data-percent');
        const offset = circumference - (percent / 100) * circumference;

        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference;

        setTimeout(() => {
            circle.style.strokeDashoffset = offset;
        }, 200);
    });

    // Debounce utility
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    // Scroll Animations and Back-to-Top
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTopBtn = document.getElementById('backToTopBtn');

    if (sections.length && navLinks.length && backToTopBtn) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href').slice(1) === entry.target.id);
                    });
                }
            });
        }, { rootMargin: '0px', threshold: 0.1 });

        sections.forEach(section => observer.observe(section));

        const handleScroll = debounce(() => {
            backToTopBtn.classList.toggle('visible', window.scrollY > 200);
        }, 10);

        window.addEventListener('scroll', handleScroll);
        backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // Contact Form Logic
    const submitBtn = document.getElementById('submit-btn');
    const formMessage = document.getElementById('form-message');

    // Mock hashid validation incorporating rathodankitha7@gmail.com
    function validateHashid(hashid) {
        const expectedHashid = 'rathodankitha7@gmail.com-portfolio-form';
        return hashid === expectedHashid;
    }

    if (submitBtn && formMessage) {
        submitBtn.addEventListener('click', async () => {
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            const hashid = document.getElementById('form-hashid').value;

            // Reset message
            formMessage.textContent = '';
            formMessage.style.color = '';

            // Client-side validation
            if (!name || !email || !message) {
                formMessage.textContent = 'Please fill out all fields.';
                formMessage.style.color = '#dc2626'; // Red for error
                return;
            }

            if (!validateHashid(hashid)) {
                formMessage.textContent = 'Please check the form hashid.';
                formMessage.style.color = '#dc2626';
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                formMessage.textContent = 'Please enter a valid email address.';
                formMessage.style.color = '#dc2626';
                return;
            }

            // AJAX submission to Formspree
            try {
                const response = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        message,
                        _subject: 'Portfolio Contact Form Submission'
                    })
                });

                if (response.ok) {
                    formMessage.textContent = 'Message sent successfully!';
                    formMessage.style.color = '#4caf50'; // Green for success
                    // Reset form
                    document.getElementById('name').value = '';
                    document.getElementById('email').value = '';
                    document.getElementById('message').value = '';
                } else {
                    const errorData = await response.json();
                    if (errorData.error && errorData.error.includes('Form not found')) {
                        formMessage.textContent = 'Form not found. Please check the Formspree ID or try again later.';
                    } else {
                        formMessage.textContent = `Error: ${errorData.error || 'Failed to send message. Please try again.'}`;
                    }
                    formMessage.style.color = '#dc2626';
                }
            } catch (error) {
                formMessage.textContent = 'Network error. Please check your connection and try again.';
                formMessage.style.color = '#dc2626';
            }
        });
    }
});