// AdAstra Digital Marketing - Main JavaScript
// Network animation and core functionality

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
        
        this.particles.forEach(particle => {
            particle.update(this.mouseX, this.mouseY);
            particle.draw(this.ctx);
        });
        
        this.drawConnections();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

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
        
        if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;
        
        this.x = Math.max(0, Math.min(this.canvas.width, this.x));
        this.y = Math.max(0, Math.min(this.canvas.height, this.y));
        
        if (mouseX && mouseY) {
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                this.vx += dx * 0.00002;
                this.vy += dy * 0.00002;
            }
        }
        
        this.vx *= 0.99;
        this.vy *= 0.99;
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(102, 126, 234, ${this.opacity * 0.8})`;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(102, 126, 234, ${this.opacity * 0.3})`;
        ctx.fill();
    }
}

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

class ScrollAnimations {
    constructor() {
        this.initScrollAnimations();
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
        animateOnScroll();
    }
}

class NumberCounters {
    constructor() {
        this.animated = false;
        this.setupStatsObserver();
    }
    
    animateNumbers() {
        if (this.animated) return;
        this.animated = true;
        
        const counters = document.querySelectorAll('.stat-item > div:first-child');
        counters.forEach(counter => {
            const finalText = counter.textContent;
            const numMatch = finalText.match(/\d+/);
            
            if (!numMatch) return;
            
            const target = parseInt(numMatch[0]);
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
                    } else if (finalText.toLowerCase().includes('year')) {
                        counter.textContent = Math.floor(current) + ' Years';
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
        }, {
            threshold: 0.3
        });

        const statsSection = document.querySelector('.stats');
        if (statsSection) {
            statsObserver.observe(statsSection);
        }
    }
}

class FAQToggle {
    constructor() {
        this.setupFAQ();
    }
    
    setupFAQ() {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const isOpen = answer.classList.contains('active');
                
                document.querySelectorAll('.faq-answer').forEach(a => {
                    a.classList.remove('active');
                    a.style.display = 'none';
                });
                
                if (!isOpen) {
                    answer.classList.add('active');
                    answer.style.display = 'block';
                }
            });
        });
    }
}

class SmoothScroll {
    constructor() {
        this.setupSmoothScrolling();
    }
    
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

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
            
            button.addEventListener('mousedown', function() {
                this.style.transform = 'translateY(-1px) scale(1.02)';
            });
            
            button.addEventListener('mouseup', function() {
                this.style.transform = 'translateY(-3px) scale(1.05)';
            });
        });
    }
}

class FormHandler {
    constructor() {
        this.setupForms();
    }
    
    setupForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const submitBtn = form.querySelector('.submit-btn');
                const originalText = submitBtn.textContent;
                
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    alert('Thank you for your interest! We will contact you within 24 hours to schedule your free strategy session.');
                    form.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 1000);
            });
        });
    }
}

class ServiceCards {
    constructor() {
        this.setupServiceCards();
    }
    
    setupServiceCards() {
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }
}

class TestimonialCards {
    constructor() {
        this.setupTestimonialCards();
    }
    
    setupTestimonialCards() {
        document.querySelectorAll('.testimonial-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }
}

class Navigation {
    constructor() {
        this.setupNavigation();
        this.setupMobileMenu();
    }
    
    setupNavigation() {
        let lastScroll = 0;
        const header = document.querySelector('.header');
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            } else {
                header.style.boxShadow = 'none';
            }
            
            lastScroll = currentScroll;
        });
        
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
    
    setupMobileMenu() {
        const burger = document.querySelector('.burger');
        const nav = document.querySelector('.nav-menu');
        
        if (burger && nav) {
            burger.addEventListener('click', () => {
                nav.classList.toggle('active');
                burger.classList.toggle('active');
            });
            
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.addEventListener('click', () => {
                    nav.classList.remove('active');
                    burger.classList.remove('active');
                });
            });
        }
    }
}

class CalendlyIntegration {
    constructor() {
        this.setupCalendlyButtons();
    }
    
    setupCalendlyButtons() {
        document.querySelectorAll('[data-calendly]').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const heroCalendly = document.querySelector('.hero-calendly');
                if (heroCalendly) {
                    heroCalendly.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            });
        });
    }
}

class PerformanceOptimizer {
    constructor() {
        this.optimizeImages();
        this.setupLazyLoading();
    }
    
    optimizeImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    }
    
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const network = new AdAstraNetwork();
    const particles = new FloatingParticles();
    const scrollAnimations = new ScrollAnimations();
    const numberCounters = new NumberCounters();
    const faqToggle = new FAQToggle();
    const smoothScroll = new SmoothScroll();
    const buttonEffects = new ButtonEffects();
    const formHandler = new FormHandler();
    const serviceCards = new ServiceCards();
    const testimonialCards = new TestimonialCards();
    const navigation = new Navigation();
    const calendlyIntegration = new CalendlyIntegration();
    const performanceOptimizer = new PerformanceOptimizer();
    
    window.adAstraNetwork = network;
    
    console.log('AdAstra Digital Marketing website loaded successfully!');
});

window.addEventListener('beforeunload', function() {
    if (window.adAstraNetwork) {
        window.adAstraNetwork.destroy();
    }
});