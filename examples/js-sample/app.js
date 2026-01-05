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
        this.currentUser = null;

        this.init();
    }

    // Initialize the Journium SDK and set up event listeners
    init() {
        this.initializeJournium();
        this.setupNavigation();
        this.setupEventTracking();
        this.setupAuthFunctionality();
        this.checkLoginStatus();
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
            this.journium = window.JourniumAnalytics.init({
                publishableKey: 'client_abcdef1234567890abcdef1234567890',
                // apiHost defaults to 'https://events.journium.app'
                apiHost: 'http://localhost:3006', // For demo: Events monitor endpoint
                //apiHost: 'https://ingestion.bhushan-685.workers.dev',
                options: {
                    debug: true,  // Always set locally - never configured remotely
                    flushAt: 1,   // Demo: send events immediately
                    flushInterval: 1000,  // Demo: flush every 1 second
                    // autocapture: true by default - set to false to disable
                }
            });

            // Start auto-capture for automatic tracking
            this.journium.startAutocapture();

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

    // Set up authentication functionality
    setupAuthFunctionality() {
        // Login button
        document.getElementById('login-btn')?.addEventListener('click', () => {
            this.showLoginModal();
        });

        // Signup button
        document.getElementById('signup-btn')?.addEventListener('click', () => {
            this.showSignupModal();
        });

        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.logout();
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideAllModals();
            });
        });

        // Switch between login and signup
        document.getElementById('switch-to-signup')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideAllModals();
            this.showSignupModal();
        });

        document.getElementById('switch-to-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideAllModals();
            this.showLoginModal();
        });

        // Login form submission
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(e.target);
        });

        // Signup form submission
        document.getElementById('signup-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup(e.target);
        });

        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAllModals();
                }
            });
        });
    }

    // Check if user is already logged in
    checkLoginStatus() {
        const savedUser = localStorage.getItem('journium_demo_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.updateAuthUI();
                
                // Re-identify user with Journium
                if (this.journium) {
                    this.journium.identify(this.currentUser.id, {
                        name: this.currentUser.name,
                        email: this.currentUser.email,
                        company: this.currentUser.company,
                        login_type: 'existing_session'
                    });
                }
                
                this.log('✅ User session restored', this.currentUser);
            } catch (error) {
                this.log('❌ Failed to restore user session', error);
                localStorage.removeItem('journium_demo_user');
            }
        }
    }

    // Show login modal
    showLoginModal() {
        document.getElementById('login-modal').style.display = 'flex';
        
        this.trackEvent('auth_modal_opened', {
            modal_type: 'login',
            trigger: 'login_button'
        });
    }

    // Show signup modal
    showSignupModal() {
        document.getElementById('signup-modal').style.display = 'flex';
        
        this.trackEvent('auth_modal_opened', {
            modal_type: 'signup',
            trigger: 'signup_button'
        });
    }

    // Hide all modals
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Handle login form submission
    handleLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');

        // Simulate login (in real app, this would be an API call)
        const user = this.simulateLogin(email, password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('journium_demo_user', JSON.stringify(user));
            
            // Identify user with Journium SDK
            if (this.journium) {
                this.journium.identify(user.id, {
                    name: user.name,
                    email: user.email,
                    company: user.company,
                    login_method: 'email',
                    login_type: 'manual'
                });
            }
            
            this.updateAuthUI();
            this.hideAllModals();
            form.reset();
            
            this.trackEvent('user_logged_in', {
                method: 'email',
                user_id: user.id,
                has_company: !!user.company
            });
            
            this.log('✅ User logged in successfully', user);
        } else {
            alert('Invalid credentials. Try any email/password for demo.');
        }
    }

    // Handle signup form submission
    handleSignup(form) {
        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const company = formData.get('company') || null;
        const password = formData.get('password');

        // Simulate signup (in real app, this would be an API call)
        const user = this.simulateSignup(name, email, company, password);
        
        this.currentUser = user;
        localStorage.setItem('journium_demo_user', JSON.stringify(user));
        
        // Identify user with Journium SDK
        if (this.journium) {
            this.journium.identify(user.id, {
                name: user.name,
                email: user.email,
                company: user.company,
                signup_method: 'email',
                signup_date: user.signupDate
            });
        }
        
        this.updateAuthUI();
        this.hideAllModals();
        form.reset();
        
        this.trackEvent('user_signed_up', {
            method: 'email',
            user_id: user.id,
            has_company: !!user.company,
            signup_source: 'demo_app'
        });
        
        this.log('✅ User signed up successfully', user);
    }

    // Logout user
    logout() {
        if (this.currentUser) {
            this.trackEvent('user_logged_out', {
                user_id: this.currentUser.id,
                session_duration: this.getSessionDuration()
            });
        }
        
        // Reset user identity in Journium SDK
        if (this.journium) {
            this.journium.reset();
        }
        
        this.currentUser = null;
        localStorage.removeItem('journium_demo_user');
        this.updateAuthUI();
        
        this.log('✅ User logged out successfully');
    }

    // Update authentication UI
    updateAuthUI() {
        const loggedOutEl = document.getElementById('auth-logged-out');
        const loggedInEl = document.getElementById('auth-logged-in');
        const userNameEl = document.getElementById('user-name');

        if (this.currentUser) {
            loggedOutEl.style.display = 'none';
            loggedInEl.style.display = 'flex';
            userNameEl.textContent = this.currentUser.name;
        } else {
            loggedOutEl.style.display = 'flex';
            loggedInEl.style.display = 'none';
        }
    }

    // Simulate login (replace with real API call)
    simulateLogin(email, password) {
        // For demo purposes, accept any email/password
        const userId = `user_${email.split('@')[0]}_${Date.now()}`;
        return {
            id: userId,
            name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'Demo User',
            email: email,
            company: 'Demo Company',
            loginDate: new Date().toISOString()
        };
    }

    // Simulate signup (replace with real API call)
    simulateSignup(name, email, company, password) {
        const userId = `user_${email.split('@')[0]}_${Date.now()}`;
        return {
            id: userId,
            name: name,
            email: email,
            company: company,
            signupDate: new Date().toISOString()
        };
    }

    // Update debug information
    updateDebugInfo() {
        const debugEvents = document.getElementById('debug-events');
        const debugPage = document.getElementById('debug-page');
        const debugSession = document.getElementById('debug-session');

        if (debugEvents) debugEvents.textContent = this.eventCounts.total;
        if (debugPage) debugPage.textContent = this.currentPage;
        if (debugSession) {
            debugSession.textContent = this.currentUser ? `${this.currentUser.name}` : 'Anonymous';
        }
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