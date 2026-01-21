// Initialize Mermaid
document.addEventListener('DOMContentLoaded', function () {
    mermaid.initialize({
        startOnLoad: true,
        theme: 'dark',
        securityLevel: 'loose',
        themeVariables: {
            primaryColor: '#6366f1',
            primaryTextColor: '#f9fafb',
            primaryBorderColor: '#818cf8',
            lineColor: '#6b7280',
            secondaryColor: '#1e293b',
            tertiaryColor: '#0f172a',
            background: '#1e293b',
            mainBkg: '#1e293b',
            nodeBkg: '#1e293b',
            clusterBkg: '#0f172a',
            titleColor: '#f9fafb',
            edgeLabelBackground: '#1e293b',
            textColor: '#f9fafb',
            fontSize: '14px'
        },
        er: {
            diagramPadding: 20,
            layoutDirection: 'TB',
            minEntityWidth: 100,
            minEntityHeight: 75,
            entityPadding: 15,
            stroke: '#6366f1',
            fill: '#1e293b',
            fontSize: 12
        }
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Mobile menu toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close menu when clicking a link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80; // Navbar height
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Tab functionality for workflow section
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');

        // Remove active class from all buttons and panels
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanels.forEach(panel => panel.classList.remove('active'));

        // Add active class to clicked button and corresponding panel
        button.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function highlightNavOnScroll() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNavOnScroll);

// Intersection Observer for fade-in animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Add animation classes to elements
document.querySelectorAll('.hierarchy-card, .table-card, .role-card, .feature-category, .rep-step, .flow-step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});

// Add visible state styles
const style = document.createElement('style');
style.textContent = `
    .hierarchy-card.visible, .table-card.visible, .role-card.visible, 
    .feature-category.visible, .rep-step.visible, .flow-step.visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// Stagger animation for grid items
function addStaggerAnimation() {
    const grids = document.querySelectorAll('.tables-grid, .roles-grid, .features-grid');

    grids.forEach(grid => {
        const children = grid.children;
        Array.from(children).forEach((child, index) => {
            child.style.transitionDelay = `${index * 0.1}s`;
        });
    });
}

addStaggerAnimation();

// Copy command to clipboard functionality
document.querySelectorAll('.command-item code').forEach(code => {
    code.style.cursor = 'pointer';
    code.title = 'Click to copy';

    code.addEventListener('click', async () => {
        const text = code.textContent;
        try {
            await navigator.clipboard.writeText(text);

            // Show feedback
            const originalText = code.textContent;
            code.textContent = 'Copied!';
            code.style.background = 'rgba(16, 185, 129, 0.2)';

            setTimeout(() => {
                code.textContent = originalText;
                code.style.background = '';
            }, 1500);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });
});

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    }
});

// Print-friendly: Remove animations when printing
window.matchMedia('print').addEventListener('change', (e) => {
    if (e.matches) {
        document.querySelectorAll('.hierarchy-card, .table-card, .role-card, .feature-category, .rep-step, .flow-step').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }
});

console.log('📚 Kas Kecil Documentation loaded successfully!');
console.log('💡 Version: 4.0.0');
