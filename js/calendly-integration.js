// Calendly Integration for AdAstra Digital Marketing
// Handles all "Book a meeting" and "Book a call" functionality

class CalendlyIntegration {
    constructor() {
        // Your actual Calendly URL
        this.calendlyUrl = 'https://calendly.com/marcfreelance0319/amazon-ppc-expert-interview';
        
        // Different meeting types (all using your main link for now)
        this.meetingTypes = {
            consultation: 'https://calendly.com/marcfreelance0319/amazon-ppc-expert-interview',
            audit: 'https://calendly.com/marcfreelance0319/amazon-ppc-expert-interview',
            custom: 'https://calendly.com/marcfreelance0319/amazon-ppc-expert-interview'
        };
        
        this.init();
    }
    
    init() {
        this.loadCalendlyWidget();
        this.setupBookingButtons();
    }
    
    loadCalendlyWidget() {
        // Load Calendly's external script
        if (!document.querySelector('script[src*="calendly"]')) {
            const script = document.createElement('script');
            script.src = 'https://assets.calendly.com/assets/external/widget.js';
            script.async = true;
            document.head.appendChild(script);
            
            // Load Calendly CSS
            const link = document.createElement('link');
            link.href = 'https://assets.calendly.com/assets/external/widget.css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
    }
    
    setupBookingButtons() {
        // Find all booking buttons
        const bookingSelectors = [
            '.cta-button',
            '.hero-cta', 
            '.service-cta',
            '.large-cta',
            '[data-calendly]',
            'button:contains("Book")',
            'a:contains("Book")'
        ];
        
        // Get all potential booking elements
        const allButtons = document.querySelectorAll(bookingSelectors.join(', '));
        
        allButtons.forEach(button => {
            const buttonText = button.textContent.toLowerCase();
            const hasBookingText = buttonText.includes('book') || 
                                 buttonText.includes('schedule') ||
                                 buttonText.includes('meeting') ||
                                 buttonText.includes('call');
            
            if (hasBookingText || button.hasAttribute('data-calendly')) {
                this.setupSingleButton(button);
            }
        });
    }
    
    setupSingleButton(button) {
        // Remove any existing event listeners
        button.removeEventListener('click', this.handleBookingClick);
        
        // Add new event listener
        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleBookingClick(button);
        });
    }
    
    handleBookingClick(button) {
        // Determine which type of meeting based on context
        let meetingUrl = this.calendlyUrl;
        
        const buttonText = button.textContent.toLowerCase();
        const pageUrl = window.location.pathname.toLowerCase();
        
        // Determine meeting type based on context
        if (buttonText.includes('audit') || pageUrl.includes('audit')) {
            meetingUrl = this.meetingTypes.audit;
        } else if (buttonText.includes('custom') || pageUrl.includes('extension')) {
            meetingUrl = this.meetingTypes.custom;
        } else {
            meetingUrl = this.meetingTypes.consultation;
        }
        
        // Get any custom URL from data attribute
        if (button.hasAttribute('data-calendly-url')) {
            meetingUrl = button.getAttribute('data-calendly-url');
        }
        
        this.openCalendly(meetingUrl, button);
    }
    
    openCalendly(url, button) {
        // Add loading state to button
        const originalText = button.textContent;
        button.textContent = 'Opening calendar...';
        button.disabled = true;
        
        // Reset button after a delay
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 2000);
        
        // Try to use Calendly popup widget if available
        if (typeof Calendly !== 'undefined' && Calendly.initPopupWidget) {
            try {
                Calendly.initPopupWidget({
                    url: url,
                    parentElement: document.body,
                    prefill: this.getPrefillData(),
                    utm: this.getUTMData()
                });
                
                // Track the booking attempt
                this.trackBookingAttempt('popup', url);
                return;
            } catch (error) {
                console.warn('Calendly popup failed, falling back to new tab:', error);
            }
        }
        
        // Fallback to opening in new tab
        const newWindow = window.open(url, '_blank', 'width=800,height=600');
        
        if (!newWindow) {
            // Popup blocked, redirect in same window
            alert('Please allow popups for this site, or we\'ll redirect you to our booking page.');
            window.location.href = url;
        }
        
        // Track the booking attempt
        this.trackBookingAttempt('new_tab', url);
    }
    
    getPrefillData() {
        // Try to get user info from forms on the page
        const email = document.querySelector('input[type="email"]')?.value || '';
        const name = document.querySelector('input[name="name"], input[placeholder*="name"]')?.value || '';
        
        return {
            email: email,
            name: name,
            customAnswers: {
                a1: 'Amazon PPC Website'  // Custom question answer
            }
        };
    }
    
    getUTMData() {
        // Get UTM parameters from URL for tracking
        const urlParams = new URLSearchParams(window.location.search);
        return {
            utmCampaign: urlParams.get('utm_campaign') || 'website',
            utmSource: urlParams.get('utm_source') || 'direct',
            utmMedium: urlParams.get('utm_medium') || 'website',
            utmContent: urlParams.get('utm_content') || window.location.pathname
        };
    }
    
    trackBookingAttempt(method, url) {
        // Track booking attempts for analytics
        console.log(`Booking attempt: ${method} - ${url}`);
        
        // Google Analytics tracking if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'booking_attempt', {
                'event_category': 'Calendly',
                'event_label': method,
                'value': url
            });
        }
        
        // Facebook Pixel tracking if available
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Schedule', {
                content_name: 'Amazon PPC Consultation',
                content_category: 'Booking'
            });
        }
    }
    
    // Method to programmatically open booking
    openBooking(meetingType = 'consultation') {
        const url = this.meetingTypes[meetingType] || this.calendlyUrl;
        this.openCalendly(url, { textContent: 'Book Meeting', disabled: false });
    }
    
    // Method to update Calendly URLs
    updateCalendlyUrl(newUrl, meetingType = null) {
        if (meetingType) {
            this.meetingTypes[meetingType] = newUrl;
        } else {
            this.calendlyUrl = newUrl;
        }
    }
}

// Embedded Calendly Widget
class CalendlyEmbed {
    constructor(containerId, url, options = {}) {
        this.container = document.getElementById(containerId);
        this.url = url;
        this.options = {
            height: '630px',
            ...options
        };
        
        if (this.container) {
            this.createEmbed();
        }
    }
    
    createEmbed() {
        // Create iframe for embedded calendar
        const iframe = document.createElement('iframe');
        iframe.src = this.url;
        iframe.width = '100%';
        iframe.height = this.options.height;
        iframe.frameBorder = '0';
        iframe.title = 'Schedule a meeting';
        
        // Clear container and add iframe
        this.container.innerHTML = '';
        this.container.appendChild(iframe);
        
        // Add loading message
        const loadingMsg = document.createElement('div');
        loadingMsg.textContent = 'Loading calendar...';
        loadingMsg.style.textAlign = 'center';
        loadingMsg.style.padding = '2rem';
        loadingMsg.style.color = '#666';
        
        this.container.insertBefore(loadingMsg, iframe);
        
        // Remove loading message when iframe loads
        iframe.addEventListener('load', () => {
            if (loadingMsg.parentNode) {
                loadingMsg.parentNode.removeChild(loadingMsg);
            }
        });
    }
}

// Auto-initialize Calendly integration
document.addEventListener('DOMContentLoaded', function() {
    // Initialize main Calendly integration
    window.calendlyIntegration = new CalendlyIntegration();
    
    // Initialize embedded calendars if they exist
    const embedContainer = document.getElementById('calendly-embed');
    if (embedContainer) {
        const embedUrl = embedContainer.getAttribute('data-url') || 
                         'https://calendly.com/marcfreelance0319/amazon-ppc-expert-interview';
        new CalendlyEmbed('calendly-embed', embedUrl);
    }
    
    console.log('Calendly integration loaded successfully!');
});

// Global function to open booking (can be called from anywhere)
window.openCalendlyBooking = function(meetingType = 'consultation') {
    if (window.calendlyIntegration) {
        window.calendlyIntegration.openBooking(meetingType);
    } else {
        console.error('Calendly integration not loaded');
    }
};

// Global function to update Calendly URLs
window.updateCalendlyUrl = function(newUrl, meetingType = null) {
    if (window.calendlyIntegration) {
        window.calendlyIntegration.updateCalendlyUrl(newUrl, meetingType);
    }
};