// Initialize cart if not exists
if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify([]));
}

// Add to cart function
function addToCart(productId, productName, price, quantity = 1, image = '') {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price,
            quantity,
            image
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showCartNotification(productName);
}

// Update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    document.querySelectorAll('.cart-count').forEach(element => {
        element.textContent = totalItems;
    });
}

// Show add to cart notification
function showCartNotification(productName) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <p>${productName} has been added to your cart!</p>
        <a href="cart.html" class="btn btn-small">View Cart</a>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Render cart items
function renderCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const emptyCart = document.getElementById('emptyCart');
    const checkoutSection = document.getElementById('checkoutSection');
    
    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        checkoutSection.style.display = 'none';
        cartContainer.innerHTML = '';
        return;
    }
    
    emptyCart.style.display = 'none';
    checkoutSection.style.display = 'block';
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image || 'images/placeholder-product.jpg'}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>GHS ${item.price.toFixed(2)}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                    </div>
                </div>
                <div class="cart-item-total">
                    <p>GHS ${itemTotal.toFixed(2)}</p>
                    <button class="remove-item" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartContainer.innerHTML = html;
    cartTotal.textContent = `GHS ${total.toFixed(2)}`;
    
    // Add event listeners
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const action = this.getAttribute('data-action');
            updateCartQuantity(productId, action);
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            removeFromCart(productId);
        });
    });
}

// Update cart quantity
function updateCartQuantity(productId, action) {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const item = cart.find(item => item.id === productId);
    
    if (action === 'increase') {
        item.quantity += 1;
    } else if (action === 'decrease' && item.quantity > 1) {
        item.quantity -= 1;
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
}

// Remove from cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    cart = cart.filter(item => item.id !== productId);
    
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
}

// Checkout function
function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    if (cart.length === 0) return;
    
    // In a real app, you would process payment here
    // For demo, we'll just clear the cart
    localStorage.setItem('cart', JSON.stringify([]));
    updateCartCount();
    
    alert('Thank you for your purchase! Your order has been placed.');
    window.location.href = 'index.html';
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('cartItems')) {
        renderCartItems();
    }
    
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            const productImage = this.getAttribute('data-image') || '';
            
            addToCart(productId, productName, productPrice, 1, productImage);
        });
    });
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
});