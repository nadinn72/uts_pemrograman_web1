// checkout.js - Checkout functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Load cart data from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkoutCart = JSON.parse(localStorage.getItem('checkoutCart')) || cart;
    
    // Display order items
    displayOrderItems(checkoutCart);
    
    // Update shipping estimate based on method
    document.getElementById('shippingMethod').addEventListener('change', updateShippingEstimate);
    
    // Auto-fill customer info if available
    autoFillCustomerInfo(currentUser);
    
    // Handle form submission
    document.getElementById('customerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        processOrder(checkoutCart);
    });
});

function displayOrderItems(cart) {
    const orderItems = document.getElementById('orderItems');
    const subtotalElement = document.getElementById('subtotal');
    const totalAmountElement = document.getElementById('totalAmount');
    
    if (cart.length === 0) {
        orderItems.innerHTML = '<p class="no-items">Keranjang belanja kosong</p>';
        subtotalElement.textContent = 'Rp 0';
        totalAmountElement.textContent = 'Rp 15.000';
        return;
    }
    
    let subtotal = 0;
    orderItems.innerHTML = '';
    
    cart.forEach((item, index) => {
        const price = parsePrice(item.harga);
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;
        
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div class="order-item-cover">
                ${item.namaBarang.charAt(0)}
            </div>
            <div class="order-item-details">
                <h4>${item.namaBarang}</h4>
                <div class="order-item-meta">
                    <span class="meta-badge">${item.kodeBarang}</span>
                    <span class="meta-badge">${item.jenisBarang}</span>
                    <span class="meta-badge">Qty: ${item.quantity}</span>
                </div>
                <div class="order-item-price">${item.harga} x ${item.quantity}</div>
            </div>
            <div class="order-item-total">
                Rp ${itemTotal.toLocaleString()}
            </div>
        `;
        orderItems.appendChild(orderItem);
    });
    
    const shippingCost = 15000;
    const total = subtotal + shippingCost;
    
    subtotalElement.textContent = `Rp ${subtotal.toLocaleString()}`;
    totalAmountElement.textContent = `Rp ${total.toLocaleString()}`;
}

function parsePrice(priceString) {
    // Convert "Rp 180.000" to 180000
    return parseInt(priceString.replace(/[^\d]/g, ''));
}

function updateShippingEstimate() {
    const shippingMethod = document.getElementById('shippingMethod').value;
    const estimateElement = document.getElementById('estimatedDelivery');
    
    let estimate = '';
    switch(shippingMethod) {
        case 'jne':
            estimate = '2-3 hari';
            break;
        case 'pos':
            estimate = '3-5 hari';
            break;
        case 'tiki':
            estimate = '1-2 hari';
            break;
        default:
            estimate = 'Pilih kurir';
    }
    
    estimateElement.value = estimate;
}

function autoFillCustomerInfo(user) {
    // Auto-fill with user data if available
    document.getElementById('customerName').value = user.nama || '';
    document.getElementById('customerEmail').value = user.email || '';
    
    // You can add more auto-fill logic here if user data has more fields
}

function processOrder(cart) {
    if (cart.length === 0) {
        showNotification('Keranjang belanja kosong!', 'error');
        return;
    }
    
    // Get form data
    const formData = {
        customerName: document.getElementById('customerName').value,
        customerEmail: document.getElementById('customerEmail').value,
        customerPhone: document.getElementById('customerPhone').value,
        customerAddress: document.getElementById('customerAddress').value,
        paymentMethod: document.getElementById('paymentMethod').value,
        shippingMethod: document.getElementById('shippingMethod').value,
        estimatedDelivery: document.getElementById('estimatedDelivery').value
    };
    
    // Validate form
    if (!validateForm(formData)) {
        return;
    }
    
    // Calculate totals
    const subtotal = cart.reduce((total, item) => {
        return total + (parsePrice(item.harga) * item.quantity);
    }, 0);
    
    const shippingCost = 15000;
    const total = subtotal + shippingCost;
    
    // Generate order data
    const orderData = {
        orderId: generateOrderId(),
        orderDate: new Date().toISOString(),
        customer: formData,
        items: cart,
        subtotal: subtotal,
        shippingCost: shippingCost,
        total: total,
        status: 'pending',
        trackingNumber: generateTrackingNumber()
    };
    
    // Save order to localStorage
    saveOrder(orderData);
    
    // Clear cart
    localStorage.removeItem('cart');
    localStorage.removeItem('checkoutCart');
    
    // Show success modal
    showSuccessModal(orderData);
}

function validateForm(formData) {
    // Basic validation
    if (!formData.customerName.trim()) {
        showNotification('Nama lengkap harus diisi', 'error');
        return false;
    }
    
    if (!formData.customerEmail.trim() || !isValidEmail(formData.customerEmail)) {
        showNotification('Email harus valid', 'error');
        return false;
    }
    
    if (!formData.customerPhone.trim() || !isValidPhone(formData.customerPhone)) {
        showNotification('Nomor telepon harus valid', 'error');
        return false;
    }
    
    if (!formData.customerAddress.trim()) {
        showNotification('Alamat lengkap harus diisi', 'error');
        return false;
    }
    
    if (!formData.paymentMethod) {
        showNotification('Metode pembayaran harus dipilih', 'error');
        return false;
    }
    
    if (!formData.shippingMethod) {
        showNotification('Kurir pengiriman harus dipilih', 'error');
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10,13}$/;
    return phoneRegex.test(phone.replace(/[^\d]/g, ''));
}

function generateOrderId() {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `ORD${timestamp}${random}`;
}

function generateTrackingNumber() {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    return `TRK${timestamp}${random}`;
}

function saveOrder(orderData) {
    // Get existing orders or initialize empty array
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Add new order
    orders.push(orderData);
    
    // Save back to localStorage
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Also save to tracking data
    saveToTrackingData(orderData);
}

function saveToTrackingData(orderData) {
    // Get existing tracking data or initialize empty object
    const trackingData = JSON.parse(localStorage.getItem('trackingData')) || {};
    
    // Create tracking entry
    trackingData[orderData.trackingNumber] = {
        nomorDO: orderData.trackingNumber,
        nama: orderData.customer.customerName,
        status: 'Dalam Perjalanan',
        ekspedisi: getShippingCompany(orderData.customer.shippingMethod),
        tanggalKirim: formatDateForTracking(new Date()),
        paket: orderData.trackingNumber,
        total: `Rp ${orderData.total.toLocaleString()}`,
        perjalanan: [
            {
                waktu: new Date().toISOString(),
                keterangan: 'Pesanan diproses: Menunggu konfirmasi pembayaran'
            }
        ]
    };
    
    // Save tracking data
    localStorage.setItem('trackingData', JSON.stringify(trackingData));
}

function getShippingCompany(shippingMethod) {
    switch(shippingMethod) {
        case 'jne': return 'JNE';
        case 'pos': return 'Pos Indonesia';
        case 'tiki': return 'TIKI';
        default: return 'JNE';
    }
}

function formatDateForTracking(date) {
    return date.toISOString().split('T')[0];
}

function showSuccessModal(orderData) {
    const successModal = document.getElementById('successModal');
    const successOrderDetails = document.getElementById('successOrderDetails');
    
    // Populate order details
    successOrderDetails.innerHTML = `
        <div class="order-detail-item">
            <strong>Nomor Pesanan:</strong>
            <span>${orderData.orderId}</span>
        </div>
        <div class="order-detail-item">
            <strong>Nomor Tracking:</strong>
            <span>${orderData.trackingNumber}</span>
        </div>
        <div class="order-detail-item">
            <strong>Total Pembayaran:</strong>
            <span>Rp ${orderData.total.toLocaleString()}</span>
        </div>
        <div class="order-detail-item">
            <strong>Metode Pembayaran:</strong>
            <span>${getPaymentMethodText(orderData.customer.paymentMethod)}</span>
        </div>
        <div class="order-detail-item">
            <strong>Estimasi Pengiriman:</strong>
            <span>${orderData.customer.estimatedDelivery}</span>
        </div>
    `;
    
    // Show modal
    successModal.style.display = 'block';
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });
}

function getPaymentMethodText(method) {
    switch(method) {
        case 'transfer': return 'Transfer Bank';
        case 'credit': return 'Kartu Kredit';
        case 'cod': return 'COD (Bayar di Tempat)';
        default: return method;
    }
}

function viewOrderHistory() {
    window.location.href = 'history.html';
}

function goToDashboard() {
    window.location.href = 'dashboard.html';
}

// Global notification function
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';
    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-text">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 3000);
}

// Close modal with escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const successModal = document.getElementById('successModal');
        if (successModal) {
            successModal.style.display = 'none';
        }
    }
});