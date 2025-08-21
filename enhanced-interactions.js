// Enhanced Interactions and UX Improvements

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Initialize enhanced features
    initializeParallaxEffect();
    initializeCounterAnimations();
    initializeImageLazyLoading();
    initializeTooltips();
    initializeProgressBars();
    initializeTypewriterEffect();
});

// Parallax scrolling effect for hero sections
function initializeParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.parallax-element');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        parallaxElements.forEach(element => {
            element.style.transform = `translateY(${rate}px)`;
        });
    });
}

// Animated counters for statistics
function initializeCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number, .impact-number');
    const observerOptions = {
        threshold: 0.7,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        // Preserve original formatting
        const originalText = element.textContent;
        const formattedNumber = Math.floor(current).toLocaleString();
        
        if (originalText.includes('€')) {
            element.textContent = `€${formattedNumber}`;
        } else if (originalText.includes('+')) {
            element.textContent = `${formattedNumber}+`;
        } else {
            element.textContent = formattedNumber;
        }
    }, 16);
}

// Lazy loading for images
function initializeImageLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
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

    images.forEach(img => imageObserver.observe(img));
}

// Enhanced tooltips
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
        element.addEventListener('mousemove', moveTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = e.target.dataset.tooltip;
    
    Object.assign(tooltip.style, {
        position: 'absolute',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '14px',
        zIndex: '1000',
        pointerEvents: 'none',
        opacity: '0',
        transition: 'opacity 0.3s ease',
        backdropFilter: 'blur(10px)'
    });
    
    document.body.appendChild(tooltip);
    e.target.tooltipElement = tooltip;
    
    setTimeout(() => tooltip.style.opacity = '1', 10);
}

function moveTooltip(e) {
    if (e.target.tooltipElement) {
        const tooltip = e.target.tooltipElement;
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY - 40 + 'px';
    }
}

function hideTooltip(e) {
    if (e.target.tooltipElement) {
        const tooltip = e.target.tooltipElement;
        tooltip.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(tooltip)) {
                document.body.removeChild(tooltip);
            }
        }, 300);
        e.target.tooltipElement = null;
    }
}

// Progress bars animation
function initializeProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target;
                const targetWidth = progressBar.dataset.progress || '100';
                
                progressBar.style.width = '0%';
                setTimeout(() => {
                    progressBar.style.transition = 'width 2s ease-in-out';
                    progressBar.style.width = targetWidth + '%';
                }, 100);
                
                progressObserver.unobserve(progressBar);
            }
        });
    }, { threshold: 0.5 });

    progressBars.forEach(bar => progressObserver.observe(bar));
}

// Typewriter effect for dynamic text
function initializeTypewriterEffect() {
    const typewriterElements = document.querySelectorAll('.typewriter');
    
    typewriterElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        element.style.borderRight = '2px solid var(--accent-green)';
        
        let i = 0;
        const timer = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;
            
            if (i >= text.length) {
                clearInterval(timer);
                // Remove cursor after typing is complete
                setTimeout(() => {
                    element.style.borderRight = 'none';
                }, 1000);
            }
        }, 100);
    });
}

// Enhanced form validation
function enhanceFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('blur', validateInput);
            input.addEventListener('input', clearValidationError);
        });
        
        form.addEventListener('submit', handleFormSubmit);
    });
}

function validateInput(e) {
    const input = e.target;
    const value = input.value.trim();
    
    // Remove existing error
    clearValidationError(e);
    
    if (!value) {
        showInputError(input, 'This field is required');
        return false;
    }
    
    // Email validation
    if (input.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showInputError(input, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Password validation
    if (input.type === 'password') {
        if (value.length < 6) {
            showInputError(input, 'Password must be at least 6 characters long');
            return false;
        }
    }
    
    showInputSuccess(input);
    return true;
}

function showInputError(input, message) {
    input.style.borderColor = 'var(--danger-color)';
    
    let errorElement = input.parentNode.querySelector('.input-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'input-error';
        errorElement.style.cssText = `
            color: var(--danger-color);
            font-size: 0.875rem;
            margin-top: 0.25rem;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        input.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    setTimeout(() => errorElement.style.opacity = '1', 10);
}

function showInputSuccess(input) {
    input.style.borderColor = 'var(--success-color)';
}

function clearValidationError(e) {
    const input = e.target;
    input.style.borderColor = '';
    
    const errorElement = input.parentNode.querySelector('.input-error');
    if (errorElement) {
        errorElement.style.opacity = '0';
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.parentNode.removeChild(errorElement);
            }
        }, 300);
    }
}

function handleFormSubmit(e) {
    const form = e.target;
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateInput({ target: input })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        e.preventDefault();
        showNotification('Please fix the errors in the form', 'error');
    }
}

// Initialize enhanced form validation
document.addEventListener('DOMContentLoaded', enhanceFormValidation);

// Scroll-triggered animations
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(element => {
        animationObserver.observe(element);
    });
}

// Initialize scroll animations
document.addEventListener('DOMContentLoaded', initializeScrollAnimations);

// Enhanced loading states
function showLoadingState(element, text = 'Loading...') {
    const originalContent = element.innerHTML;
    element.dataset.originalContent = originalContent;
    element.disabled = true;
    element.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <span style="margin-left: 0.5rem;">${text}</span>
    `;
}

function hideLoadingState(element) {
    if (element.dataset.originalContent) {
        element.innerHTML = element.dataset.originalContent;
        element.disabled = false;
        delete element.dataset.originalContent;
    }
}

// Utility functions for enhanced UX
window.UXUtils = {
    showLoadingState,
    hideLoadingState,
    animateCounter,
    showNotification: window.showNotification || function(msg, type) { alert(msg); }
};

// Add CSS for enhanced animations
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease-out;
    }
    
    .animate-on-scroll.animated {
        opacity: 1;
        transform: translateY(0);
    }
    
    .progress-bar {
        height: 4px;
        background: var(--gradient-primary);
        border-radius: 2px;
        transition: width 0.3s ease;
    }
    
    .typewriter {
        animation: blink 1s infinite;
    }
    
    @keyframes blink {
        0%, 50% { border-color: var(--accent-green); }
        51%, 100% { border-color: transparent; }
    }
    
    .lazy {
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    .lazy.loaded {
        opacity: 1;
    }
    
    .parallax-element {
        will-change: transform;
    }
    
    .custom-tooltip {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        font-weight: 500;
        letter-spacing: 0.5px;
    }
    
    .input-error {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    
    .input-error::before {
        content: "⚠";
        font-size: 0.75rem;
    }
    
    /* Enhanced hover effects */
    .enhanced-hover {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .enhanced-hover:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }
    
    /* Pulse animation for important elements */
    .pulse {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    /* Gradient text effect */
    .gradient-text {
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    /* Enhanced focus states */
    .enhanced-focus:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(26, 138, 107, 0.3);
        border-color: var(--accent-green);
    }
`;

document.head.appendChild(enhancedStyles);

