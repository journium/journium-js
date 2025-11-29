// Journium JavaScript SDK Demo Application
// This demonstrates various tracking capabilities using vanilla JavaScript

class JourniumDemo {
    constructor() {
        this.journium = null;
        this.eventCounts = {
            total: 0,
            custom_events: 0,
            interactions: 0,
            ecommerce: 0
        };
        this.pageViews = 1;
        this.sessionStart = Date.now();
        this.currentPage = 'home';

        this.init();
    }

    // Initialize the Journium SDK and set up event listeners
    init() {
        this.initializeJournium();
        this.setupNavigation();
        this.setupEventTracking();
        this.startSessionTimer();
        this.setupFormTracking();
        
        // Track initial page view
        this.trackPageView('home');
    }

    // Initialize Journium SDK
    initializeJournium() {
        try {
            // Initialize Journium with minimal configuration
            // Only include required local configs - remote config will handle the rest
            this.journium = window.Journium.init({
                token: 'client_abcdef1234567890abcdef1234567890',
                apiHost: 'http://localhost:3006', // Events monitor endpoint
                //apiHost: 'https://ingestion.bhushan-685.workers.dev',
                debug: true,  // Always set locally - never configured remotely
                flushAt: 1,   // Demo: send events immediately
                flushInterval: 1000,  // Demo: flush every 1 second
                // autocapture: true by default - set to false to disable
            });

            // Start auto-capture for automatic tracking
            this.journium.startAutoCapture();

            this.log('✅ Journium SDK initialized successfully');
            this.updateDebugInfo();

        } catch (error) {
            this.log('❌ Failed to initialize Journium SDK:', error);
        }
    }

    // Set up single-page navigation
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const pages = document.querySelectorAll('.page');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = e.target.getAttribute('data-page');
                
                if (targetPage && targetPage !== this.currentPage) {
                    this.navigateToPage(targetPage);
                }
            });
        });
    }

    // Handle page navigation
    navigateToPage(pageName) {
        // Hide current page
        document.querySelector(`#${this.currentPage}`).classList.remove('active');
        document.querySelector(`.nav-link[data-page="${this.currentPage}"]`).classList.remove('active');

        // Show target page
        document.querySelector(`#${pageName}`).classList.add('active');
        document.querySelector(`.nav-link[data-page="${pageName}"]`).classList.add('active');

        // Update current page
        this.currentPage = pageName;

        // Track page view
        this.trackPageView(pageName);
        this.updatePageViewCount();
        this.updateDebugInfo();
    }

    // Track page view events
    trackPageView(pageName) {
        if (this.journium) {
            this.journium.capturePageview({
                page_name: pageName,
                page_type: 'spa_page',
                framework: 'vanilla_js',
                timestamp: new Date().toISOString(),
                session_duration: this.getSessionDuration()
            });

            this.log(`📄 Page view tracked: ${pageName}`);
        }
    }

    // Set up event tracking for interactive elements
    setupEventTracking() {
        // CTA buttons
        document.getElementById('cta-primary')?.addEventListener('click', () => {
            this.trackEvent('cta_clicked', {
                cta_type: 'primary',
                cta_text: 'Get Started',
                page: this.currentPage,
                position: 'hero'
            });
        });

        document.getElementById('cta-secondary')?.addEventListener('click', () => {
            this.trackEvent('cta_clicked', {
                cta_type: 'secondary',
                cta_text: 'Learn More',
                page: this.currentPage,
                position: 'hero'
            });
        });

        // Feature demo buttons
        document.querySelectorAll('.btn-feature').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const eventType = e.target.getAttribute('data-event');
                const feature = e.target.getAttribute('data-feature');
                const type = e.target.getAttribute('data-type');
                const product = e.target.getAttribute('data-product');

                if (eventType === 'feature_explored') {
                    this.trackEvent('feature_explored', {
                        feature_name: feature,
                        page: this.currentPage,
                        exploration_method: 'button_click'
                    });
                    this.incrementEventCount('custom_events');
                } else if (eventType === 'interaction_demo') {
                    this.trackEvent('interaction_demo', {
                        interaction_type: type,
                        page: this.currentPage,
                        demo_category: 'user_interactions'
                    });
                    this.incrementEventCount('interactions');
                } else if (eventType === 'add_to_cart') {
                    this.trackEvent('add_to_cart', {
                        product_id: product,
                        product_name: 'Demo Product',
                        price: 49.99,
                        currency: 'USD',
                        quantity: 1,
                        page: this.currentPage
                    });
                    this.incrementEventCount('ecommerce');
                }
            });
        });

        // Product interaction tracking
        document.querySelectorAll('.product-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                const productName = e.target.getAttribute('data-product-name');
                const productCard = e.target.closest('.product-card');
                const productId = productCard?.getAttribute('data-product-id');
                const priceElement = productCard?.querySelector('.product-price');
                const price = priceElement ? parseFloat(priceElement.textContent.replace('$', '')) : 0;

                if (action === 'view') {
                    this.trackEvent('product_viewed', {
                        product_id: productId,
                        product_name: productName,
                        price: price,
                        currency: 'USD',
                        page: this.currentPage,
                        view_method: 'button_click'
                    });
                } else if (action === 'add_to_cart') {
                    this.trackEvent('add_to_cart', {
                        product_id: productId,
                        product_name: productName,
                        price: price,
                        currency: 'USD',
                        quantity: 1,
                        page: this.currentPage,
                        add_method: 'product_card'
                    });
                    this.incrementEventCount('ecommerce');
                }
            });
        });
    }

    // Set up form tracking
    setupFormTracking() {
        const contactForm = document.getElementById('contact-form');
        const formInputs = contactForm?.querySelectorAll('input, textarea, select');

        // Track form field interactions
        formInputs?.forEach(input => {
            input.addEventListener('focus', () => {
                this.trackEvent('form_field_focused', {
                    field_name: input.name,
                    field_type: input.type || input.tagName.toLowerCase(),
                    form_name: 'contact',
                    page: this.currentPage
                });
            });

            input.addEventListener('blur', () => {
                this.trackEvent('form_field_completed', {
                    field_name: input.name,
                    field_type: input.type || input.tagName.toLowerCase(),
                    form_name: 'contact',
                    field_length: input.value.length,
                    page: this.currentPage
                });
            });
        });

        // Track form submission
        contactForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            
            this.trackEvent('contact_form_submitted', {
                form_name: 'contact',
                has_name: !!data.name,
                has_email: !!data.email,
                has_company: !!data.company,
                has_message: !!data.message,
                interest_level: data.interest || 'not_specified',
                message_length: data.message?.length || 0,
                page: this.currentPage,
                form_completion_time: this.getFormCompletionTime()
            });

            // Show success message
            contactForm.style.display = 'none';
            document.getElementById('form-success').style.display = 'block';

            this.log('📝 Contact form submitted successfully');
        });
    }

    // Track custom events
    trackEvent(eventName, properties = {}) {
        if (this.journium) {
            const enrichedProperties = {
                ...properties,
                session_id: this.getSessionId(),
                session_duration: this.getSessionDuration(),
                user_agent: navigator.userAgent,
                screen_resolution: `${screen.width}x${screen.height}`,
                viewport_size: `${window.innerWidth}x${window.innerHeight}`,
                timestamp: new Date().toISOString()
            };

            this.journium.track(eventName, enrichedProperties);
            this.incrementEventCount('total');
            this.log(`🎯 Event tracked: ${eventName}`, enrichedProperties);
        }
    }

    // Increment event counters
    incrementEventCount(type) {
        this.eventCounts[type]++;
        this.updateEventCountDisplay(type);
        this.updateTotalEventsDisplay();
    }

    // Update event count displays
    updateEventCountDisplay(type) {
        const countElement = document.querySelector(`[data-count="${type}"]`);
        if (countElement) {
            countElement.textContent = this.eventCounts[type];
        }
    }

    updateTotalEventsDisplay() {
        const totalElement = document.getElementById('total-events');
        if (totalElement) {
            totalElement.textContent = this.eventCounts.total;
        }
    }

    updatePageViewCount() {
        this.pageViews++;
        const pageViewElement = document.getElementById('total-pageviews');
        if (pageViewElement) {
            pageViewElement.textContent = this.pageViews;
        }
    }

    // Start session duration timer
    startSessionTimer() {
        setInterval(() => {
            const durationElement = document.getElementById('session-duration');
            if (durationElement) {
                durationElement.textContent = this.formatDuration(this.getSessionDuration());
            }
        }, 1000);
    }

    // Utility methods
    getSessionDuration() {
        return Date.now() - this.sessionStart;
    }

    getSessionId() {
        // Simple session ID for demo purposes
        return `demo-session-${this.sessionStart}`;
    }

    getFormCompletionTime() {
        // In a real app, you'd track when the user started filling the form
        return Date.now() - this.sessionStart;
    }

    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Update debug information
    updateDebugInfo() {
        const debugEvents = document.getElementById('debug-events');
        const debugPage = document.getElementById('debug-page');
        const debugSession = document.getElementById('debug-session');

        if (debugEvents) debugEvents.textContent = this.eventCounts.total;
        if (debugPage) debugPage.textContent = this.currentPage;
        if (debugSession) debugSession.textContent = 'Active';
    }

    // Logging utility
    log(message, data = null) {
        console.log(`🔍 Journium Demo: ${message}`, data || '');
    }
}

// Initialize the demo when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure Journium SDK is fully loaded
    setTimeout(() => {
        new JourniumDemo();
    }, 100);
});

// Handle page unload - flush any remaining events
window.addEventListener('beforeunload', () => {
    if (window.journiumDemo?.journium) {
        window.journiumDemo.journium.flush();
    }
});