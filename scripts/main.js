// Main JavaScript file for SIG Website

// Page loading effect
document.addEventListener('DOMContentLoaded', function() {
    // Add page transition effect
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Mobile Navigation Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        // Create backdrop overlay for mobile menu
        const backdrop = document.createElement('div');
        backdrop.className = 'mobile-menu-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 998;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        `;
        document.body.appendChild(backdrop);
        
        function toggleMenu() {
            const isActive = navMenu.classList.contains('active');
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Show/hide backdrop
            if (!isActive) {
                backdrop.style.opacity = '1';
                backdrop.style.visibility = 'visible';
                document.body.style.overflow = 'hidden';
            } else {
                backdrop.style.opacity = '0';
                backdrop.style.visibility = 'hidden';
                document.body.style.overflow = '';
            }
        }
        
        function closeMenu() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            backdrop.style.opacity = '0';
            backdrop.style.visibility = 'hidden';
            document.body.style.overflow = '';
        }

        // Handle click and touch events on toggle
        navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
        
        navToggle.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });

        // Close menu when clicking backdrop
        backdrop.addEventListener('click', closeMenu);
        backdrop.addEventListener('touchend', function(e) {
            e.preventDefault();
            closeMenu();
        });

        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        // Close mobile menu when clicking outside (fallback)
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navMenu.contains(event.target) || navToggle.contains(event.target);
            if (!isClickInsideNav && navMenu.classList.contains('active') && !backdrop.contains(event.target)) {
                closeMenu();
            }
        });
    }

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to navbar
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.backgroundColor = 'var(--white)';
                navbar.style.backdropFilter = 'none';
            }
        });
    }

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.feature-card, .value-card, .event-card, .member-card, .blog-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Counter animation for stats
    const statNumbers = document.querySelectorAll('.stat-number');
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });

    function animateCounter(element) {
        const finalValue = element.textContent;
        const numericValue = parseInt(finalValue.replace(/\D/g, ''));
        const suffix = finalValue.replace(/[\d]/g, '');
        
        let currentValue = 0;
        const duration = 2500;
        const startTime = performance.now();
        
        // Easing function for smooth animation
        function easeOutQuart(t) {
            return 1 - Math.pow(1 - t, 4);
        }
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuart(progress);
            
            currentValue = Math.floor(easedProgress * numericValue);
            element.textContent = currentValue + suffix;
            
            // Add pulsing effect during animation
            element.style.transform = `scale(${1 + Math.sin(progress * Math.PI * 4) * 0.05})`;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.style.transform = 'scale(1)';
                // Add completion glow effect
                element.style.textShadow = '0 0 20px rgba(74, 155, 60, 0.6)';
                setTimeout(() => {
                    element.style.textShadow = '';
                }, 1000);
            }
        }
        
        requestAnimationFrame(updateCounter);
    }

    // Newsletter form handling
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        const newsletterBtn = newsletterForm.querySelector('.newsletter-btn');
        const newsletterInput = newsletterForm.querySelector('.newsletter-input');

        newsletterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const email = newsletterInput.value.trim();
            
            if (email && isValidEmail(email)) {
                // Simulate form submission
                newsletterBtn.textContent = 'Subscribing...';
                newsletterBtn.disabled = true;
                
                setTimeout(() => {
                    newsletterBtn.textContent = 'Subscribed!';
                    newsletterInput.value = '';
                    
                    setTimeout(() => {
                        newsletterBtn.textContent = 'Subscribe';
                        newsletterBtn.disabled = false;
                    }, 2000);
                }, 1000);
            } else {
                showNotification('Please enter a valid email address', 'error');
            }
        });
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        if (type === 'error') {
            notification.style.backgroundColor = '#ef4444';
        } else if (type === 'success') {
            notification.style.backgroundColor = '#22c55e';
        } else {
            notification.style.backgroundColor = '#3b82f6';
        }

        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Back to top button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: var(--primary-green);
        color: white;
        border: none;
        cursor: pointer;
        font-size: 18px;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: var(--shadow-lg);
    `;

    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.visibility = 'visible';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
        }
    });

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // Add loading states to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('btn-loading')) return;
            
            const originalText = this.textContent;
            this.classList.add('btn-loading');
            this.style.position = 'relative';
            this.style.color = 'transparent';
            
            const spinner = document.createElement('div');
            spinner.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 20px;
                height: 20px;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            `;
            
            this.appendChild(spinner);
            
            // Add keyframes for spinner animation
            if (!document.querySelector('#spinner-keyframes')) {
                const style = document.createElement('style');
                style.id = 'spinner-keyframes';
                style.textContent = `
                    @keyframes spin {
                        0% { transform: translate(-50%, -50%) rotate(0deg); }
                        100% { transform: translate(-50%, -50%) rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            setTimeout(() => {
                this.removeChild(spinner);
                this.classList.remove('btn-loading');
                this.style.color = '';
                this.textContent = originalText;
            }, 1500);
        });
    });

    // Initialize tooltips (if needed in the future)
    function initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', showTooltip);
            element.addEventListener('mouseleave', hideTooltip);
        });
    }

    function showTooltip(e) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = e.target.dataset.tooltip;
        tooltip.style.cssText = `
            position: absolute;
            background: var(--gray-900);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
            white-space: nowrap;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = e.target.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
        
        setTimeout(() => tooltip.style.opacity = '1', 10);
        
        e.target.tooltip = tooltip;
    }

    function hideTooltip(e) {
        if (e.target.tooltip) {
            document.body.removeChild(e.target.tooltip);
            delete e.target.tooltip;
        }
    }

    // Initialize all features
    initTooltips();
    
    // Initialize premium effects
    initParticleEffect();
    
    // Initialize enhanced navigation features
    initFloatingActionButton();
    initScrollProgressIndicator();
    initSmoothScrollLinks();

    console.log('SIG Website loaded successfully!');
});

// Premium particle effect for hero section
function initParticleEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    `;
    hero.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resizeCanvas() {
        canvas.width = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
    }
    
    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.3 + 0.1,
            life: Math.random() * 100 + 50
        };
    }
    
    function initParticles() {
        particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push(createParticle());
        }
    }
    
    function updateParticles() {
        particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            // Wrap around screen edges
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
            
            // Remove dead particles
            if (particle.life <= 0) {
                particles[index] = createParticle();
            }
        });
    }
    
    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        
        // Draw connections between nearby particles
        particles.forEach((particle, i) => {
            particles.slice(i + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.save();
                    ctx.globalAlpha = (100 - distance) / 100 * 0.1;
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(otherParticle.x, otherParticle.y);
                    ctx.stroke();
                    ctx.restore();
                }
            });
        });
    }
    
    function animate() {
        updateParticles();
        drawParticles();
        requestAnimationFrame(animate);
    }
    
    // Initialize
    resizeCanvas();
    initParticles();
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });
}

// Floating Action Button for Applications
function initFloatingActionButton() {
    const fab = document.createElement('div');
    fab.className = 'floating-action-button';
    fab.innerHTML = `
        <a href="mailto:ucsdsustainableinvestment@gmail.com?subject=SIG Application" class="fab-link">
            <i class="fas fa-paper-plane"></i>
            <span class="fab-text">Apply Now</span>
        </a>
    `;
    
    fab.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all var(--transition-medium);
    `;
    
    const fabStyles = document.createElement('style');
    fabStyles.textContent = `
        .floating-action-button {
            background: var(--gradient-primary);
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-premium);
            overflow: hidden;
            animation: fabPulse 3s infinite;
        }
        
        .fab-link {
            display: flex;
            align-items: center;
            gap: var(--spacing-2);
            padding: var(--spacing-3) var(--spacing-4);
            color: var(--white);
            text-decoration: none;
            font-weight: 600;
            font-size: var(--font-size-sm);
            transition: all var(--transition-medium);
        }
        
        .fab-link:hover {
            background: rgba(255,255,255,0.1);
        }
        
        .fab-text {
            white-space: nowrap;
        }
        
        @keyframes fabPulse {
            0%, 100% { box-shadow: var(--shadow-premium); }
            50% { box-shadow: var(--shadow-glow); }
        }
        
        @media (max-width: 768px) {
            .floating-action-button {
                bottom: 60px;
                right: 15px;
            }
            
            .fab-text {
                display: none;
            }
        }
    `;
    document.head.appendChild(fabStyles);
    document.body.appendChild(fab);
    
    // Show FAB after scrolling past hero
    let fabVisible = false;
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY > window.innerHeight * 0.5;
        
        if (scrolled && !fabVisible) {
            fab.style.opacity = '1';
            fab.style.visibility = 'visible';
            fabVisible = true;
        } else if (!scrolled && fabVisible) {
            fab.style.opacity = '0';
            fab.style.visibility = 'hidden';
            fabVisible = false;
        }
    });
}

// Scroll Progress Indicator
function initScrollProgressIndicator() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: var(--gradient-primary);
        z-index: 10000;
        transition: width 0.1s ease;
        box-shadow: 0 0 10px rgba(74, 155, 60, 0.5);
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrolled / maxScroll) * 100;
        progressBar.style.width = Math.min(progress, 100) + '%';
    });
}

// Enhanced Smooth Scrolling for Internal Links
function initSmoothScrollLinks() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Add highlight effect to target section
                targetElement.style.transition = 'background-color 0.5s ease';
                const originalBg = targetElement.style.backgroundColor;
                targetElement.style.backgroundColor = 'rgba(74, 155, 60, 0.05)';
                
                setTimeout(() => {
                    targetElement.style.backgroundColor = originalBg;
                }, 2000);
            }
        });
    });
}

// Page transition effects for navigation
document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href]');
    if (link && link.href && !link.href.includes('#') && !link.href.includes('mailto:') && !link.target) {
        const isInternalLink = link.href.includes(window.location.origin);
        
        if (isInternalLink) {
            e.preventDefault();
            
            // Add fade out effect
            document.body.style.transition = 'opacity 0.3s ease';
            document.body.style.opacity = '0.7';
            
            setTimeout(() => {
                window.location.href = link.href;
            }, 300);
        }
    }
});
