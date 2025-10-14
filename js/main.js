// AdAstra Digital Marketing - Main JavaScript
// Network animation and core functionality
// VERSION 2 - FIXED SCROLLING ISSUES

// Network Canvas Animation
class AdAstraNetwork {
    constructor() {
        this.canvas = document.getElementById('networkCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.createParticles();
        this.addEventListeners();
        this.animate();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        const particleCount = Math.min(80, Math.floor((this.canvas.width * this.canvas.height) / 15000));
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new NetworkParticle(this.canvas));
        }
    }
    
    addEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    const opacity = (1 - distance / 120) * 0.4;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach(particle => {
            particle.update(this.mouseX, this.mouseY);
            particle.draw(this.ctx);
        });
        
        // Draw connections
        this.drawConnections();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Network Particle Class
class NetworkParticle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.2;
    }
    
    update(mouseX, mouseY) {
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off edges
        if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;
        
        // Keep within bounds
        this.x = Math.max(0, Math.min(this.canvas.width, this.x));
        this.y = Math.max(0, Math.min(this.canvas.height, this.y));
        
        // Move toward cursor (subtle effect)
        if (mouseX && mouseY) {
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                this.vx += dx * 0.00002;
                this.vy += dy * 0.00002;
            }
        }
        
        // Apply friction
        this.vx *= 0.99;
        this.vy *= 0.99;
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(102, 126, 234, ${this.opacity * 0.8})`;
        ctx.fill();
        
        // Add subtle glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(102, 126, 234, ${this.opacity * 0.3})`;
        ctx.fill();
    }
}

// Floating Particles
class FloatingParticles {
    constructor() {
        this.container = document.querySelector('.particles-container');
        if (!this.container) return;
        
        this.createParticles();
    }
    
    createParticles() {
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 10 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            this.container.appendChild(particle);
        }
    }
}

// Scroll Animations - Parallax Removed
class ScrollAnimations {
    constructor() {
        this.initScrollAnimations();
        // REMOVED: initParallax() - this was causing scroll lag
    }
    
    initScrollAnimations() {
        const animateOnScroll = () => {
            const elements = document.querySelectorAll('.animate-on-scroll');
            elements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;
                
                if (elementTop < window.innerHeight - elementVisible) {
                    element.classList.add('animate-active');
                }
            });
        };

        window.addEventListener('scroll', animateOnScroll);
    }
}

// Number Counter Animation - FIXED VERSION
class NumberCounters {
    constructor() {
        this.animated = false;
        this.setupStatsObserver();
    }
    
    animateNumbers() {
        if (this.animated) return;
        this.animated = true;
        
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            const finalText = counter.textContent;
            const target = parseInt(counter.getAttribute('data-target') || '0');
            
            if (target === 0) return;
            
            let current = 0;
            const increment = target / 50;
            const duration = 2000;
            const stepTime = duration / 50;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                    counter.textContent = finalText;
                } else {
                    if (finalText.includes('$') && finalText.includes('M')) {
                        counter.textContent = '$' + Math.floor(current) + 'M+';
                    } else if (finalText.includes('+')) {
                        counter.textContent = Math.floor(current) + '+';
                    } else {
                        counter.textContent = Math.floor(current);
                    }
                }
            }, stepTime);
        });
    }
    
    setupStatsObserver() {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated) {
                    this.animateNumbers();
                    statsObserver.unobserve(entry.target);
                }
            });
        });

        const statsSection = document.querySelector('.stats');
        if (statsSection) {
            statsObserver.observe(statsSection);
        }
    }
}

// FAQ Toggle
class FAQToggle {
    constructor() {
        this.setupFAQ();
    }
    
    setupFAQ() {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const isOpen = answer.classList.contains('active');
                
                // Close all answers
                document.querySelectorAll('.faq-answer').forEach(a => {
                    a.classList.remove('active');
                    a.style.display = 'none';
                });
                
                // Open clicked answer if it wasn't already open
                if (!isOpen) {
                    answer.classList.add('active');
                    answer.style.display = 'block';
                }
            });
        });
    }
}

// Smooth Scrolling
class SmoothScroll {
    constructor() {
        this.setupSmoothScrolling();
    }
    
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Button Hover Effects
class ButtonEffects {
    constructor() {
        this.setupButtonEffects();
    }
    
    setupButtonEffects() {
        document.querySelectorAll('.cta-button, .hero-cta, .service-cta, .submit-btn, .large-cta').forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-3px) scale(1.05)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
}

// Form Handling
class FormHandler {
    constructor() {
        this.setupForms();
    }
    
    setupForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Thank you for your interest! We will contact you within 24 hours to schedule your free strategy session.');
            });
        });
    }
}

// Typing Animation
class TypingAnimation {
    constructor() {
        this.initTypingAnimation();
    }
    
    typeWriter(element, text, speed = 50) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }
    
    initTypingAnimation() {
        window.addEventListener('load', () => {
            const heroTitle = document.querySelector('.hero h1');
            if (heroTitle) {
                const originalText = heroTitle.textContent;
                this.typeWriter(heroTitle, originalText, 50);
            }
        });
    }
}

// Initialize everything when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    const network = new AdAstraNetwork();
    const particles = new FloatingParticles();
    const scrollAnimations = new ScrollAnimations();
    const numberCounters = new NumberCounters();
    const faqToggle = new FAQToggle();
    const smoothScroll = new SmoothScroll();
    const buttonEffects = new ButtonEffects();
    const formHandler = new FormHandler();
    const typingAnimation = new TypingAnimation();
    
    console.log('AdAstra Digital Marketing website loaded successfully!');
});

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    // Clean up any running animations
    if (window.adAstraNetwork) {
        window.adAstraNetwork.destroy();
    }
});