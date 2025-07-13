// Enhanced renderCart.js with all requested features
document.addEventListener('DOMContentLoaded', function() {
  // Initialize cart on page load
  renderCart();

  // Add event delegation for dynamic elements
  document.addEventListener('click', function(e) {
    // Handle quantity changes
    if (e.target.classList.contains('quantity-input')) {
      const itemId = e.target.closest('.cart-item').dataset.id;
      const newQuantity = parseInt(e.target.value);
      updateCartItemQuantity(itemId, newQuantity);
    }

    // Handle item removal
    if (e.target.classList.contains('remove-item-btn')) {
      const itemId = e.target.closest('.cart-item').dataset.id;
      removeCartItem(itemId);
    }
  });
});

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartItemQuantity(itemId, newQuantity) {
  const cart = getCart();
  const itemIndex = cart.findIndex(item => item.id === itemId);

  if (itemIndex !== -1) {
    if (newQuantity > 0) {
      cart[itemIndex].quantity = newQuantity;
    } else {
      cart.splice(itemIndex, 1); // Remove if quantity is 0 or less
    }
    saveCart(cart);
    renderCart();
  }
}

function removeCartItem(itemId) {
  const cart = getCart();
  const updatedCart = cart.filter(item => item.id !== itemId);
  saveCart(updatedCart);
  renderCart();
}

function renderCart() {
  const cart = getCart();
  const cartContainer = document.getElementById('cartItemsContainer');
  const emptyCart = document.getElementById('emptyCart');
  const checkoutSection = document.getElementById('checkoutSection');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartTax = document.getElementById('cartTax');
  const cartShipping = document.getElementById('cartShipping');
  const cartTotal = document.getElementById('cartTotal');

  // Show/hide empty cart message
  if (cart.length === 0) {
    emptyCart.style.display = 'block';
    checkoutSection.style.display = 'none';
    cartContainer.innerHTML = '';
    return;
  }

  emptyCart.style.display = 'none';
  checkoutSection.style.display = 'block';

  // Build cart items HTML
  let html = '';
  let subtotal = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    html += `
      <div class="cart-item" data-id="${item.id}">
        <div class="item-info">
          <h3>${item.name}</h3>
          ${item.size ? <p>Size: ${item.size}</p> : ''}
          ${item.color ? <p>Color: ${item.color}</p> : ''}
        </div>
        <div class="item-price">
          <p>GHS ${item.price.toFixed(2)}</p>
        </div>
        <div class="item-quantity">
          <input type="number" min="1" value="${item.quantity}" class="quantity-input">
        </div>
        <div class="item-total">
          <p>GHS ${itemTotal.toFixed(2)}</p>
        </div>
        <div class="item-actions">
          <button class="remove-item-btn">Remove</button>
        </div>
      </div>
    `;
  });

  cartContainer.innerHTML = html;

  // Calculate totals
  const tax = subtotal * 0.05; // 5% tax
  const shipping = 20; // fixed shipping
  const total = subtotal + tax + shipping;

  // Update totals display
  cartSubtotal.textContent = `GHS ${subtotal.toFixed(2)}`;
  cartTax.textContent = `GHS ${tax.toFixed(2)}`;
  cartShipping.textContent = `GHS ${shipping.toFixed(2)}`;
  cartTotal.textContent = `GHS ${total.toFixed(2)}`;
}

// Initialize cart on page load
window.onload = renderCart;