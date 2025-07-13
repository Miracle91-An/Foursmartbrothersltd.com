import { supabase } from 'auth.js';

// DOM Elements
const contentSections = document.querySelectorAll('.content-section');
const navLinks = document.querySelectorAll('.sidebar nav ul li a');
const logoutBtn = document.getElementById('logout');
const profileForm = document.getElementById('profile-form');
const passwordForm = document.getElementById('password-form');
const enable2FA = document.getElementById('enable-2fa');
const deleteAccountBtn = document.getElementById('delete-account');
const deleteModal = document.getElementById('delete-modal');
const confirmDelete = document.getElementById('confirm-delete');
const cancelDelete = document.getElementById('cancel-delete');

// Current User
let currentUser = null;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) window.location.href = 'login.html';
  
  currentUser = user;
  loadUserData();
  loadProducts();
  loadOrders();
  setupEventListeners();
});

// Load User Data
async function loadUserData() {
  // Get profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single();
  
  // Update UI
  document.getElementById('user-name').textContent = profile?.name || 'User';
  document.getElementById('profile-name').value = profile?.name || '';
  document.getElementById('profile-email').value = currentUser.email;
  document.getElementById('profile-phone').value = profile?.phone || '';
  
  // Set 2FA status
  if (profile?.two_factor_enabled) {
    enable2FA.checked = true;
    document.getElementById('2fa-options').classList.remove('hidden');
  }
}

// Load Products
async function loadProducts() {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true);
  
  const productGrid = document.getElementById('product-grid');
  productGrid.innerHTML = '';
  
  products.forEach(product => {
    productGrid.innerHTML += `
      <div class="product-card">
        <div class="product-image">
          <img src="assets/products/${product.image}" alt="${product.name}">
        </div>
        <div class="product-details">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-price">$${product.price.toFixed(2)}</p>
          <button class="add-to-cart" data-id="${product.id}">
            <i class="fas fa-cart-plus"></i> Add to Cart
          </button>
        </div>
      </div>
    `;
  });
}

// Load Orders
async function loadOrders() {
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });
  
  const orderHistory = document.getElementById('order-history');
  orderHistory.innerHTML = '';
  
  orders.forEach(order => {
    const statusClass = order.status === 'completed' ? 'status-completed' : 
                       order.status === 'cancelled' ? 'status-cancelled' : 'status-pending';
    
    orderHistory.innerHTML += `
      <tr>
        <td>#${order.id}</td>
        <td>${new Date(order.created_at).toLocaleDateString()}</td>
        <td>${order.items.length} items</td>
        <td>$${order.total.toFixed(2)}</td>
        <td class="${statusClass}">${order.status}</td>
      </tr>
    `;
  });
  
  // Update stats
  document.getElementById('active-orders').textContent = 
    orders.filter(o => o.status === 'pending').length;
  document.getElementById('completed-orders').textContent = 
    orders.filter(o => o.status === 'completed').length;
}

// Setup Event Listeners
function setupEventListeners() {
  // Navigation
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('href');
      
      // Update active link
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      // Show target section
      contentSections.forEach(section => section.classList.add('hidden'));
      document.querySelector(target).classList.remove('hidden');
    });
  });
  
  // Logout
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await signOut();
  });
  
  // Profile Form
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const updates = {
      name: document.getElementById('profile-name').value,
      phone: document.getElementById('profile-phone').value,
      updated_at: new Date()
    };
    
    try {
      await updateProfile(updates);
      alert('Profile updated successfully!');
      loadUserData();
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    }
  });
  
  // Password Form
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    
    try {
      // Verify current password
      const { error } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPassword
      });
      
      if (error) throw new Error('Current password is incorrect');
      
      // Update password
      await changePassword(newPassword);
      alert('Password updated successfully!');
      passwordForm.reset();
    } catch (error) {
      alert('Error changing password: ' + error.message);
    }
  });
  
  // 2FA Toggle
  enable2FA.addEventListener('change', () => {
    document.getElementById('2fa-options').classList.toggle('hidden', !enable2FA.checked);
  });
  
  // Delete Account
  deleteAccountBtn.addEventListener('click', () => {
    deleteModal.classList.remove('hidden');
  });
  
  confirmDelete.addEventListener('click', async () => {
    try {
      await deleteAccount();
    } catch (error) {
      alert('Error deleting account: ' + error.message);
    }
  });
  
  cancelDelete.addEventListener('click', () => {
    deleteModal.classList.add('hidden');
  });
}