// Stripe Payment Integration for AdAstra Chrome Extensions
// Handles payment processing for premium extensions and tools

class StripePayments {
    constructor() {
        // Replace with your actual Stripe publishable key
        this.publishableKey = 'pk_test_YOUR_PUBLISHABLE_KEY_HERE';
        this.stripe = null;
        
        // Product pricing (replace with your actual Stripe Price IDs)
        this.products = {
            'basic-extension': {
                priceId: 'price_basic_extension_id',
                name: 'Basic Amazon Extension',
                price: 97,
                description: 'Essential Amazon seller tools and analytics'
            },
            'pro-suite': {
                priceId: 'price_pro_suite_id', 
                name: 'Pro Extension Suite',
                price: 197,
                description: 'Complete toolkit with advanced features'
            },
            'custom-development': {
                priceId: 'price_custom_dev_id',
                name: 'Custom Extension Development',
                price: 497,
                description: 'Tailored solution for your specific needs'
            }
        };
        
        this.init();
    }
    
    async init() {
        try {
            await this.loadStripe();
            this.setupPaymentButtons();
            this.handleURLParameters();
        } catch (error) {
            console.error('Stripe initialization failed:', error);
            this.showError('Payment system unavailable. Please try again later.');
        }
    }
    
    async loadStripe() {
        return new Promise((resolve, reject) => {
            // Check if Stripe is already loaded
            if (window.Stripe) {
                this.stripe = window.Stripe(this.publishableKey);
                resolve();
                return;
            }
            
            // Load Stripe.js
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.async = true;
            
            script.onload = () => {
                try {
                    this.stripe = window.Stripe(this.publishableKey);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            
            script.onerror = () => {
                reject(new Error('Failed to load Stripe'));
            };
            
            document.head.appendChild(script);
        });
    }
    
    setupPaymentButtons() {
        // Find all payment buttons
        const paymentButtons = document.querySelectorAll('[data-stripe-product], .payment-btn');
        
        paymentButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                const productId = button.getAttribute('data-stripe-product') || 
                                button.getAttribute('data-product');
                
                if (productId) {
                    this.initiatePayment(productId, button);
                } else {
                    console.error('No product ID found on button:', button);
                }
            });
        });
    }
    
    async initiatePayment(productId, button) {
        if (!this.stripe) {
            this.showError('Payment system not ready. Please try again.');
            return;
        }
        
        const product = this.products[productId];
        if (!product) {
            this.showError('Product not found. Please try again.');
            return;
        }
        
        // Show loading state
        this.setButtonLoading(button, true);
        
        try {
            // Track the purchase attempt
            this.trackPurchaseAttempt(productId, product.price);
            
            // Create checkout session
            const session = await this.createCheckoutSession(productId, product);
            
            if (session.error) {
                throw new Error(session.error);
            }
            
            // Redirect to Stripe Checkout
            const result = await this.stripe.redirectToCheckout({
                sessionId: session.id
            });
            
            if (result.error) {
                throw new Error(result.error.message);
            }
            
        } catch (error) {
            console.error('Payment error:', error);
            this.showError('Payment failed. Please try again or contact support.');
            this.trackPurchaseError(productId, error.message);
        } finally {
            this.setButtonLoading(button, false);
        }
    }
    
    async createCheckoutSession(productId, product) {
        // This would typically call your backend endpoint
        // For demo purposes, we'll simulate the API call
        
        const checkoutData = {
            price_id: product.priceId,
            quantity: 1,
            mode: 'payment',
            success_url: window.location.origin + '/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: window.location.href,
            customer_email: this.getCustomerEmail(),
            metadata: {
                product_id: productId,
                source: 'website'
            }
        };
        
        try {
            // Replace this with your actual backend endpoint
            const response = await fetch('/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(checkoutData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            // Fallback: redirect directly to a pre-configured Stripe Payment Link
            const paymentLinks = {
                'basic-extension': 'https://buy.stripe.com/your-basic-extension-link',
                'pro-suite': 'https://buy.stripe.com/your-pro-suite-link', 
                'custom-development': 'https://buy.stripe.com/your-custom-dev-link'
            };
            
            const paymentLink = paymentLinks[productId];
            if (paymentLink) {
                window.location.href = paymentLink;
                return;
            }
            
            throw error;
        }
    }
    
    getCustomerEmail() {
        // Try to get email from forms on the page
        const emailInput = document.querySelector('input[type="email"]');
        return emailInput ? emailInput.value : '';
    }
    
    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.dataset.originalText = button.textContent;
            button.textContent = 'Processing...';
            button.disabled = true;
            button.style.cursor = 'not-allowed';
        } else {
            button.textContent = button.dataset.originalText || 'Purchase Now';
            button.disabled = false;
            button.style.cursor = 'pointer';
        }
    }
    
    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'stripe-error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 1rem;
            border-radius: 5px;
            z-index: 10000;
            max-width: 300px;
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
        
        // Allow manual close
        errorDiv.addEventListener('click', () => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        });
    }
    
    handleURLParameters() {
        // Handle success/cancel redirects
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        
        if (sessionId) {
            // Payment successful
            this.handlePaymentSuccess(sessionId);
        }
        
        if (urlParams.get('canceled') === 'true') {
            // Payment canceled
            this.handlePaymentCanceled();
        }
    }
    
    async handlePaymentSuccess(sessionId) {
        console.log('Payment successful:', sessionId);
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.innerHTML = `
            <h3>Payment Successful!</h3>
            <p>Thank you for your purchase. You should receive download instructions via email shortly.</p>
        `;
        successMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #4CAF50;
            color: white;
            padding: 2rem;
            border-radius: 10px;
            z-index: 10000;
            text-align: center;
        `;
        
        document.body.appendChild(successMessage);
        
        // Track successful purchase
        this.trackPurchaseSuccess(sessionId);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (successMessage.parentNode) {
                successMessage.parentNode.removeChild(successMessage);
            }
        }, 10000);
    }
    
    handlePaymentCanceled() {
        console.log('Payment was canceled');
        
        // Show canceled message
        const cancelMessage = document.createElement('div');
        cancelMessage.innerHTML = `
            <h3>Payment Canceled</h3>
            <p>Your payment was canceled. No charges were made.</p>
        `;
        cancelMessage.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff9800;
            color: white;
            padding: 1rem;
            border-radius: 5px;
            z-index: 10000;
        `;
        
        document.body.appendChild(cancelMessage);
        
        setTimeout(() => {
            if (cancelMessage.parentNode) {
                cancelMessage.parentNode.removeChild(cancelMessage);
            }
        }, 5000);
    }
    
    trackPurchaseAttempt(productId, price) {
        console.log(`Purchase attempt: ${productId} - $${price}`);
        
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'begin_checkout', {
                'event_category': 'E-commerce',
                'event_label': productId,
                'value': price,
                'currency': 'USD'
            });
        }
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'InitiateCheckout', {
                content_name: productId,
                content_category: 'Chrome Extension',
                value: price,
                currency: 'USD'
            });
        }
    }
    
    trackPurchaseSuccess(sessionId) {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'purchase', {
                'event_category': 'E-commerce',
                'transaction_id': sessionId,
                'currency': 'USD'
            });
        }
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Purchase', {
                currency: 'USD'
            });
        }
    }
    
    trackPurchaseError(productId, errorMessage) {
        console.error(`Purchase error for ${productId}:`, errorMessage);
        
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'purchase_error', {
                'event_category': 'E-commerce',
                'event_label': `${productId}: ${errorMessage}`,
                'value': 0
            });
        }
    }
}

// Pricing Display Component
class PricingDisplay {
    constructor() {
        this.setupPricingCards();
    }
    
    setupPricingCards() {
        const pricingContainers = document.querySelectorAll('.pricing-cards, .extension-pricing');
        
        pricingContainers.forEach(container => {
            this.addPricingCards(container);
        });
    }
    
    addPricingCards(container) {
        const pricingHTML = `
            <div class="price-card">
                <h3>Basic Extension</h3>
                <div class="price">$97</div>
                <p>Essential Amazon seller tools</p>
                <ul>
                    <li>Product research</li>
                    <li>Keyword analysis</li>
                    <li>Basic analytics</li>
                </ul>
                <button class="payment-btn" data-stripe-product="basic-extension">
                    Purchase Now
                </button>
            </div>
            
            <div class="price-card popular">
                <div class="popular-badge">Most Popular</div>
                <h3>Pro Suite</h3>
                <div class="price">$197</div>
                <p>Complete Amazon toolkit</p>
                <ul>
                    <li>Everything in Basic</li>
                    <li>Competitor tracking</li>
                    <li>Advanced analytics</li>
                    <li>Automated alerts</li>
                </ul>
                <button class="payment-btn" data-stripe-product="pro-suite">
                    Purchase Now
                </button>
            </div>
            
            <div class="price-card">
                <h3>Custom Development</h3>
                <div class="price">$497+</div>
                <p>Tailored to your business</p>
                <ul>
                    <li>Custom features</li>
                    <li>Personal consultation</li>
                    <li>Ongoing support</li>
                    <li>Source code access</li>
                </ul>
                <button class="payment-btn" data-calendly>
                    Book Consultation
                </button>
            </div>
        `;
        
        container.innerHTML = pricingHTML;
    }
}

// Auto-initialize Stripe integration
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Stripe payments
    window.stripePayments = new StripePayments();
    
    // Initialize pricing display
    const pricingDisplay = new PricingDisplay();
    
    console.log('Stripe payment integration loaded successfully!');
});

// Global functions
window.initStripePayment = function(productId) {
    if (window.stripePayments) {
        window.stripePayments.initiatePayment(productId);
    }
};