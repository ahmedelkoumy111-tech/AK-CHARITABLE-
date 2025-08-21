// Dashboard JavaScript Functions

// PayPal and Stripe configuration
const PAYPAL_CLIENT_ID = 'AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUXlkA59kJXE7M6R'; // PayPal Sandbox Client ID
const stripe = Stripe('pk_test_51234567890abcdefghijklmnopqrstuvwxyz'); // Stripe Test Publishable Key

// PayPal Plan ID for €1 monthly subscription
const PAYPAL_PLAN_ID = 'P-1234567890ABCDEFGHIJKLMN'; // This would be created in PayPal dashboard

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // Load user data
    loadUserData();
    
    // Initialize payment methods
    initializePaymentMethods();
    
    // Set up event listeners
    setupEventListeners();
}

function loadUserData() {
    // In a real application, this would fetch data from your backend
    const userData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        monthsActive: 12,
        totalDonated: 12,
        subscriptionStatus: 'active',
        nextPayment: 'January 15, 2025',
        currentBeneficiary: 'Red Cross International'
    };
    
    // Update UI with user data
    document.getElementById('userName').textContent = userData.name;
    
    // Update stats
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers[0].textContent = userData.monthsActive;
    statNumbers[1].textContent = `€${userData.totalDonated}`;
}

function setupEventListeners() {
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('addPaymentModal');
        if (event.target === modal) {
            closeAddPaymentModal();
        }
    });
}

// Subscription Management Functions
function pauseSubscription() {
    if (confirm('Are you sure you want to pause your monthly subscription?')) {
        // In a real application, this would call your backend API
        showNotification('Subscription paused successfully', 'success');
        
        // Update UI
        const statusBadge = document.querySelector('.status-badge');
        statusBadge.textContent = 'Paused';
        statusBadge.className = 'status-badge paused';
    }
}

function cancelSubscription() {
    if (confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
        // In a real application, this would call your backend API
        showNotification('Subscription cancelled successfully', 'info');
        
        // Redirect to main page after a delay
        setTimeout(() => {
            window.location.href = 'ak.html';
        }, 2000);
    }
}

// Payment Methods Functions
function showAddPaymentModal() {
    document.getElementById('addPaymentModal').style.display = 'block';
}

function closeAddPaymentModal() {
    document.getElementById('addPaymentModal').style.display = 'none';
}

function setAsPrimary(method) {
    // Update UI to show new primary method
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(pm => {
        const badge = pm.querySelector('.status-badge');
        const actions = pm.querySelector('.method-actions');
        
        if (pm.dataset.method === method) {
            if (badge) {
                badge.textContent = 'Primary';
                badge.className = 'status-badge active';
            } else {
                const newBadge = document.createElement('div');
                newBadge.className = 'method-status';
                newBadge.innerHTML = '<span class="status-badge active">Primary</span>';
                pm.appendChild(newBadge);
            }
            if (actions) actions.remove();
        } else {
            if (badge) {
                const parent = badge.parentElement;
                parent.remove();
                const newActions = document.createElement('div');
                newActions.className = 'method-actions';
                newActions.innerHTML = `<button class="btn btn-link" onclick="setAsPrimary('${pm.dataset.method}')">Set as Primary</button>`;
                pm.appendChild(newActions);
            }
        }
    });
    
    showNotification('Primary payment method updated', 'success');
}

// PayPal Integration
function setupPayPal() {
    closeAddPaymentModal();
    
    // Show PayPal button container
    const container = document.getElementById('paypal-button-container');
    container.style.display = 'block';
    container.innerHTML = `
        <div style="background: var(--card-bg); padding: 2rem; border-radius: 12px; margin: 1rem 0;">
            <h3 style="margin-bottom: 1rem; color: var(--text-light);">PayPal Monthly Subscription - €1.00</h3>
            <div id="paypal-buttons"></div>
            <button onclick="cancelPayPalSetup()" class="btn btn-secondary" style="width: 100%; margin-top: 1rem;">Cancel</button>
        </div>
    `;
    
    // Create PayPal subscription button
    paypal.Buttons({
        style: {
            shape: 'rect',
            color: 'blue',
            layout: 'vertical',
            label: 'subscribe'
        },
        createSubscription: function(data, actions) {
            return actions.subscription.create({
                'plan_id': PAYPAL_PLAN_ID,
                'quantity': '1',
                'custom_id': 'AK_CHARITY_' + Date.now(),
                'application_context': {
                    'brand_name': 'AK Charitable Organization',
                    'locale': 'en-US',
                    'shipping_preference': 'NO_SHIPPING',
                    'user_action': 'SUBSCRIBE_NOW',
                    'payment_method': {
                        'payer_selected': 'PAYPAL',
                        'payee_preferred': 'IMMEDIATE_PAYMENT_REQUIRED'
                    },
                    'return_url': window.location.origin + '/dashboard.html?success=paypal',
                    'cancel_url': window.location.origin + '/dashboard.html?cancelled=paypal'
                },
                'subscriber': {
                    'name': {
                        'given_name': document.getElementById('userName').textContent.split(' ')[0] || 'User',
                        'surname': document.getElementById('userName').textContent.split(' ')[1] || 'Member'
                    },
                    'email_address': 'user@example.com' // In real app, get from user data
                }
            });
        },
        onApprove: function(data, actions) {
            showNotification('PayPal subscription created successfully! Subscription ID: ' + data.subscriptionID, 'success');
            
            // Add PayPal method to UI
            addPaymentMethodToUI('paypal', 'PayPal Account');
            
            // Update subscription status
            updateSubscriptionStatus('active', 'PayPal');
            
            // Hide container
            container.style.display = 'none';
            
            // In a real application, save subscription ID to backend
            console.log('PayPal Subscription ID:', data.subscriptionID);
            localStorage.setItem('paypal_subscription_id', data.subscriptionID);
        },
        onError: function(err) {
            showNotification('Error setting up PayPal subscription: ' + err.message, 'error');
            console.error('PayPal error:', err);
            container.style.display = 'none';
        },
        onCancel: function(data) {
            showNotification('PayPal subscription setup was cancelled', 'warning');
            container.style.display = 'none';
        }
    }).render('#paypal-buttons');
}

function cancelPayPalSetup() {
    document.getElementById('paypal-button-container').style.display = 'none';
}

// Stripe Integration
function setupStripe() {
    closeAddPaymentModal();
    
    // Show Stripe card element container
    const container = document.getElementById('stripe-card-element');
    container.style.display = 'block';
    container.innerHTML = `
        <div style="background: var(--card-bg); padding: 2rem; border-radius: 12px; margin: 1rem 0; border: 1px solid var(--border-color);">
            <h3 style="margin-bottom: 1rem; color: var(--text-light);">Add Credit/Debit Card - €1.00/month</h3>
            <div id="card-element" style="padding: 1rem; background: var(--input-bg); border-radius: 8px; margin-bottom: 1rem; border: 2px solid transparent;"></div>
            <div id="card-errors" role="alert" style="color: var(--danger-color); margin-bottom: 1rem; font-size: 0.875rem;"></div>
            <button id="submit-card" class="btn btn-primary" style="width: 100%;">
                <i class="fas fa-credit-card"></i> Subscribe with Card - €1.00/month
            </button>
            <button onclick="cancelStripeSetup()" class="btn btn-secondary" style="width: 100%; margin-top: 0.5rem;">Cancel</button>
        </div>
    `;
    
    // Create Stripe Elements
    const elements = stripe.elements({
        appearance: {
            theme: 'night',
            variables: {
                colorPrimary: '#1a8a6b',
                colorBackground: '#2a2a2a',
                colorText: '#ffffff',
                colorDanger: '#ef4444',
                fontFamily: 'Segoe UI, system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px'
            }
        }
    });
    
    const cardElement = elements.create('card', {
        style: {
            base: {
                fontSize: '16px',
                color: '#ffffff',
                fontFamily: 'Segoe UI, system-ui, sans-serif',
                '::placeholder': {
                    color: '#b0b0b0',
                },
                iconColor: '#1a8a6b'
            },
            invalid: {
                color: '#ef4444',
                iconColor: '#ef4444'
            }
        },
        hidePostalCode: true
    });
    
    cardElement.mount('#card-element');
    
    // Handle real-time validation errors from the card Element
    cardElement.on('change', ({error}) => {
        const displayError = document.getElementById('card-errors');
        if (error) {
            displayError.textContent = error.message;
        } else {
            displayError.textContent = '';
        }
    });
    
    // Handle form submission
    document.getElementById('submit-card').addEventListener('click', async function(event) {
        event.preventDefault();
        
        const submitButton = this;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        try {
            // Create payment method
            const {error, paymentMethod} = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: document.getElementById('userName').textContent || 'AK Charity Member',
                    email: 'user@example.com' // In real app, get from user data
                }
            });
            
            if (error) {
                document.getElementById('card-errors').textContent = error.message;
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-credit-card"></i> Subscribe with Card - €1.00/month';
                return;
            }
            
            // In a real application, you would send the payment method to your backend
            // to create a subscription. For demo purposes, we'll simulate success
            await simulateStripeSubscription(paymentMethod);
            
        } catch (err) {
            document.getElementById('card-errors').textContent = 'An unexpected error occurred.';
            console.error('Stripe error:', err);
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-credit-card"></i> Subscribe with Card - €1.00/month';
        }
    });
}

async function simulateStripeSubscription(paymentMethod) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate successful subscription creation
    const subscriptionId = 'sub_' + Math.random().toString(36).substr(2, 9);
    
    showNotification('Card subscription created successfully! Subscription ID: ' + subscriptionId, 'success');
    
    // Add Stripe method to UI
    const last4 = paymentMethod.card.last4;
    const brand = paymentMethod.card.brand.charAt(0).toUpperCase() + paymentMethod.card.brand.slice(1);
    addPaymentMethodToUI('stripe', `${brand} **** ${last4}`);
    
    // Update subscription status
    updateSubscriptionStatus('active', 'Credit Card');
    
    // Hide container
    document.getElementById('stripe-card-element').style.display = 'none';
    
    // Store subscription info
    localStorage.setItem('stripe_subscription_id', subscriptionId);
    localStorage.setItem('stripe_payment_method_id', paymentMethod.id);
    
    console.log('Stripe Subscription ID:', subscriptionId);
    console.log('Stripe Payment Method:', paymentMethod);
}

function cancelStripeSetup() {
    document.getElementById('stripe-card-element').style.display = 'none';
}

function addPaymentMethodToUI(type, displayName) {
    const container = document.querySelector('.payment-methods-card .card-content');
    const newMethod = document.createElement('div');
    newMethod.className = 'payment-method';
    newMethod.dataset.method = type;
    
    const icon = type === 'paypal' ? 'fab fa-paypal' : 'fas fa-credit-card';
    
    newMethod.innerHTML = `
        <div class="method-info">
            <i class="${icon}"></i>
            <span>${displayName}</span>
        </div>
        <div class="method-actions">
            <button class="btn btn-link" onclick="setAsPrimary('${type}')">Set as Primary</button>
        </div>
    `;
    
    container.appendChild(newMethod);
}

// Quick Actions Functions
function makeOneTimeDonation() {
    // In a real application, this would open a donation modal
    showNotification('One-time donation feature coming soon!', 'info');
}

function updateAmount() {
    const newAmount = prompt('Enter new monthly donation amount (€):', '1.00');
    if (newAmount && !isNaN(newAmount) && parseFloat(newAmount) > 0) {
        // In a real application, this would update the subscription
        document.querySelector('.amount').textContent = `€${parseFloat(newAmount).toFixed(2)} / month`;
        showNotification(`Monthly donation updated to €${parseFloat(newAmount).toFixed(2)}`, 'success');
    }
}

function shareWithFriends() {
    if (navigator.share) {
        navigator.share({
            title: 'AK Charitable Organization',
            text: 'Join me in making a difference with just €1 per month!',
            url: window.location.origin + '/ak.html'
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const url = window.location.origin + '/ak.html';
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Link copied to clipboard!', 'success');
        });
    }
}

function downloadReceipts() {
    // In a real application, this would generate and download receipts
    showNotification('Receipts download feature coming soon!', 'info');
}

function viewAllHistory() {
    // In a real application, this would navigate to a full history page
    showNotification('Full history page coming soon!', 'info');
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        zIndex: '1001',
        opacity: '0',
        transform: 'translateY(-20px)',
        transition: 'all 0.3s ease'
    });
    
    // Set background color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize payment methods on page load
function initializePaymentMethods() {
    // This would typically load saved payment methods from your backend
    console.log('Payment methods initialized');
}



// Subscription Management Functions
function updateSubscriptionStatus(status, paymentMethod) {
    const statusBadge = document.querySelector('.subscription-card .status-badge');
    const nextPaymentDiv = document.querySelector('.next-payment');
    const beneficiaryDiv = document.querySelector('.beneficiary');
    
    if (statusBadge) {
        statusBadge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        statusBadge.className = `status-badge ${status}`;
    }
    
    if (nextPaymentDiv && status === 'active') {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextPaymentDiv.textContent = `Next payment: ${nextMonth.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })} via ${paymentMethod}`;
    }
}

// Enhanced Payment Method Management
function addPaymentMethodToUI(type, displayName) {
    const container = document.querySelector('.payment-methods-card .card-content');
    
    // Remove existing methods of the same type
    const existingMethods = container.querySelectorAll(`[data-method="${type}"]`);
    existingMethods.forEach(method => method.remove());
    
    const newMethod = document.createElement('div');
    newMethod.className = 'payment-method active';
    newMethod.dataset.method = type;
    
    const icon = type === 'paypal' ? 'fab fa-paypal' : 'fas fa-credit-card';
    
    newMethod.innerHTML = `
        <div class="method-info">
            <i class="${icon}"></i>
            <span>${displayName}</span>
        </div>
        <div class="method-status">
            <span class="status-badge active">Primary</span>
        </div>
    `;
    
    // Set all other methods as non-primary
    const otherMethods = container.querySelectorAll('.payment-method');
    otherMethods.forEach(method => {
        if (method !== newMethod) {
            method.classList.remove('active');
            const statusDiv = method.querySelector('.method-status');
            if (statusDiv) {
                statusDiv.innerHTML = '<button class="btn btn-link" onclick="setAsPrimary(\'' + method.dataset.method + '\')">Set as Primary</button>';
            }
        }
    });
    
    container.appendChild(newMethod);
}

// Enhanced Subscription Actions
function pauseSubscription() {
    const currentStatus = document.querySelector('.status-badge').textContent.toLowerCase();
    
    if (currentStatus === 'paused') {
        if (confirm('Do you want to resume your monthly subscription?')) {
            updateSubscriptionStatus('active', 'PayPal');
            showNotification('Subscription resumed successfully', 'success');
            
            // Update button text
            const pauseBtn = document.querySelector('button[onclick="pauseSubscription()"]');
            if (pauseBtn) {
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            }
        }
    } else {
        if (confirm('Are you sure you want to pause your monthly subscription? You can resume it anytime.')) {
            updateSubscriptionStatus('paused', 'PayPal');
            showNotification('Subscription paused successfully', 'warning');
            
            // Update button text
            const pauseBtn = document.querySelector('button[onclick="pauseSubscription()"]');
            if (pauseBtn) {
                pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            }
        }
    }
}

// URL Parameter Handling for Payment Success/Failure
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get('success') === 'paypal') {
        showNotification('Welcome back! Your PayPal subscription is now active.', 'success');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (urlParams.get('cancelled') === 'paypal') {
        showNotification('PayPal subscription setup was cancelled. You can try again anytime.', 'info');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Initialize URL parameter handling
document.addEventListener('DOMContentLoaded', function() {
    handleURLParameters();
});

// Demo Data Population
function populateDemoData() {
    // Check if user has existing subscriptions
    const paypalSub = localStorage.getItem('paypal_subscription_id');
    const stripeSub = localStorage.getItem('stripe_subscription_id');
    
    if (paypalSub) {
        addPaymentMethodToUI('paypal', 'PayPal Account');
        updateSubscriptionStatus('active', 'PayPal');
    } else if (stripeSub) {
        const paymentMethodId = localStorage.getItem('stripe_payment_method_id');
        addPaymentMethodToUI('stripe', 'Visa **** 1234');
        updateSubscriptionStatus('active', 'Credit Card');
    }
}

// Call demo data population on load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(populateDemoData, 1000);
});

// Utility function to format currency
function formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(amount);
}

// Enhanced notification system with different types
function showNotification(message, type = 'info', duration = 4000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Add icon based on type
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        color: 'white',
        fontWeight: '500',
        zIndex: '1001',
        opacity: '0',
        transform: 'translateY(-20px)',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        maxWidth: '400px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)'
    });
    
    // Set background color based on type
    const colors = {
        success: 'linear-gradient(135deg, #10b981, #059669)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
        info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    };
    notification.style.background = colors[type] || colors.info;
    
    // Style the close button
    const closeBtn = notification.querySelector('.notification-close');
    Object.assign(closeBtn.style, {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '1.2rem',
        cursor: 'pointer',
        padding: '0',
        marginLeft: 'auto',
        opacity: '0.7',
        transition: 'opacity 0.3s ease'
    });
    
    closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
    closeBtn.onmouseout = () => closeBtn.style.opacity = '0.7';
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Remove after duration
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, duration);
}

