// Products storage
let products = [];

// Cart storage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM elements
const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const cartBtn = document.getElementById('cart-btn');
const cartCount = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
const checkoutBtn = document.getElementById('checkout-btn');
const continueShoppingBtn = document.getElementById('continue-shopping-btn');
const productModal = document.getElementById('product-modal');
const productDetails = document.getElementById('product-details');
const closeBtns = document.querySelectorAll('.close');
const categoryLinks = document.querySelectorAll('.categories a');
const checkoutModal = document.getElementById('checkout-modal');
const checkoutForm = document.getElementById('checkout-form');


// --- FUNCTIONS ---

function loadProducts(productsToLoad) {
  productGrid.innerHTML = '';

  if (productsToLoad.length === 0) {
    productGrid.innerHTML = `<p>No products found.</p>`;
    return;
  }

  productsToLoad.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image">
      <div class="product-name">${product.name}</div>
      <div class="product-price">₹${product.price}</div>
      <div class="product-rating">★ ${product.rating}</div>
      <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
    `;
    card.addEventListener('click', e => {
      if (!e.target.classList.contains('add-to-cart-btn')) {
        showProductDetails(product);
      }
    });
    productGrid.appendChild(card);
  });

  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const productId = parseInt(e.target.dataset.id);
      addToCart(productId);
    });
  });
}

function searchProducts() {
  const query = searchInput.value.toLowerCase().trim();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  );
  loadProducts(filtered);
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity++;
  else cart.push({ ...product, quantity: 1 });
  updateCart();
  saveCart();
}

function updateCart() {
  cartCount.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function showCart() {
  cartItems.innerHTML = '';
  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Your cart is empty.</p>';
  } else {
    let total = 0;
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn qty-minus" data-id="${item.id}">-</button>
          <span class="qty-display">${item.quantity}</span>
          <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
        </div>
        <div class="cart-item-total">₹${itemTotal.toFixed(2)}</div>
        <button class="cart-item-remove" data-id="${item.id}">&times;</button>
      `;
      cartItems.appendChild(div);
    });
    cartItems.innerHTML += `<hr><div class="cart-total"><strong>Total: ₹${total.toFixed(2)}</strong></div>`;
  }
  cartModal.style.display = 'block';
}

function showProductDetails(product) {
  productDetails.innerHTML = `
    <img src="${product.image}" alt="${product.name}" style="width:100%;max-width:300px;">
    <h3>${product.name}</h3>
    <p>${product.description}</p>
    <p>Price: ₹${product.price}</p>
    <p>Rating: ★ ${product.rating}</p>
    <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
  `;
  productModal.style.display = 'block';
}

searchBtn.addEventListener('click', searchProducts);
searchInput.addEventListener('input', searchProducts);
searchInput.addEventListener('keypress', e => { if (e.key==='Enter') searchProducts(); });
cartBtn.addEventListener('click', showCart);
checkoutBtn.addEventListener('click', () => {
  cartModal.style.display = 'none';
  checkoutModal.style.display = 'block';
});
continueShoppingBtn.addEventListener('click', () => {
  cartModal.style.display = 'none';
});
closeBtns.forEach(btn => btn.addEventListener('click', () => {
  cartModal.style.display = 'none';
  productModal.style.display = 'none';
  checkoutModal.style.display = 'none';
}));
window.addEventListener('click', e => {
  if (e.target===cartModal) cartModal.style.display='none';
  if (e.target===productModal) productModal.style.display='none';
  if (e.target===checkoutModal) checkoutModal.style.display='none';
});
cartItems.addEventListener('click', e => {
  const id = parseInt(e.target.dataset.id);
  if(e.target.classList.contains('cart-item-remove')){
    cart = cart.filter(item=>item.id!==id);
    updateCart();
    saveCart();
    showCart();
  } else if (e.target.classList.contains('qty-plus')) {
    increaseQuantity(id);
  } else if (e.target.classList.contains('qty-minus')) {
    decreaseQuantity(id);
  }
});

function increaseQuantity(id) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.quantity++;
    updateCart();
    saveCart();
    showCart();
  }
}

function decreaseQuantity(id) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.quantity--;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    updateCart();
    saveCart();
    showCart();
  }
}
productDetails.addEventListener('click', e=>{
  if(e.target.classList.contains('add-to-cart-btn')){
    const id = parseInt(e.target.dataset.id);
    addToCart(id);
    productModal.style.display='none';
  }
});

// --- CATEGORY FILTER ---
categoryLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const cat = link.getAttribute('data-category');
    let filtered = (cat==='all') ? products : products.filter(p=>p.category===cat);
    searchInput.value = '';
    loadProducts(filtered);
  });
});

function fetchProducts() {
  return fetch('products.json')
    .then(res => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    });
}

checkoutForm.addEventListener('submit', e => {
  e.preventDefault();
  // Redirect to error.html on submit
  window.location.href = 'error.html';
});

// --- LOGIN/SIGNUP MODALS ---
const loginBtn = document.getElementById('login-btn');
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');

// Open login modal
loginBtn.addEventListener('click', () => {
  loginModal.style.display = 'block';
});

// Switch to signup modal
switchToSignup.addEventListener('click', e => {
  e.preventDefault();
  loginModal.style.display = 'none';
  signupModal.style.display = 'block';
});

// Switch to login modal
switchToLogin.addEventListener('click', e => {
  e.preventDefault();
  signupModal.style.display = 'none';
  loginModal.style.display = 'block';
});

// Close modals
document.querySelectorAll('#login-modal .close, #signup-modal .close').forEach(btn => {
  btn.addEventListener('click', () => {
    loginModal.style.display = 'none';
    signupModal.style.display = 'none';
  });
});

// Close on outside click
window.addEventListener('click', e => {
  if (e.target === loginModal) loginModal.style.display = 'none';
  if (e.target === signupModal) signupModal.style.display = 'none';
});

// Validation functions
function validateEmailOrPhone(value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;
  return emailRegex.test(value) || phoneRegex.test(value);
}

function validatePassword(password) {
  return password.length >= 8 && password.length <= 12;
}

// Login form validation
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!validateEmailOrPhone(email)) {
    alert('Please enter a valid Gmail address or 10-digit mobile number.');
    return;
  }

  if (!validatePassword(password)) {
    alert('Password must be 8-12 digits long.');
    return;
  }

  // Simulate login success (in real app, send to server)
  alert('Login successful!');
  loginModal.style.display = 'none';
  // Here you can redirect or update UI for logged-in user
});

// Signup form validation
signupForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;

  if (!validateEmailOrPhone(email)) {
    alert('Please enter a valid Gmail address or 10-digit mobile number.');
    return;
  }

  if (!validatePassword(password)) {
    alert('Password must be 8-12 digits long.');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }

  // Simulate signup success (in real app, send to server)
  alert('Signup successful! Please login.');
  signupModal.style.display = 'none';
  loginModal.style.display = 'block';
});

// --- INITIALIZE ---
fetchProducts()
  .then(data => {
    products = data;
    loadProducts(products);
    updateCart();
  })
  .catch(err => {
    console.error('Error loading products:', err);
    productGrid.innerHTML = '<p>Failed to load products.</p>';
  });

// Show login modal on page load
window.addEventListener('load', () => {
  loginModal.style.display = 'block';
});
