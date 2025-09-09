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
const productModal = document.getElementById('product-modal');
const productDetails = document.getElementById('product-details');
const closeBtns = document.querySelectorAll('.close');
const categoryLinks = document.querySelectorAll('.categories a');

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
        <span>${item.name} (x${item.quantity})</span>
        <span>₹${itemTotal.toFixed(2)}</span>
        <button class="cart-item-remove" data-id="${item.id}">&times;</button>
      `;
      cartItems.appendChild(div);
    });
    cartItems.innerHTML += `<hr><h4>Total: ₹${total.toFixed(2)}</h4>`;
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
  window.location.href = "error.html";
  cart = [];
  saveCart();
  updateCart();
  cartModal.style.display = 'none';
});
closeBtns.forEach(btn => btn.addEventListener('click', () => {
  cartModal.style.display = 'none';
  productModal.style.display = 'none';
}));
window.addEventListener('click', e => {
  if (e.target===cartModal) cartModal.style.display='none';
  if (e.target===productModal) productModal.style.display='none';
});
cartItems.addEventListener('click', e => {
  if(e.target.classList.contains('cart-item-remove')){
    const id = parseInt(e.target.dataset.id);
    cart = cart.filter(item=>item.id!==id);
    updateCart();
    saveCart();
    showCart();
  }
});
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

// --- INITIALIZE ---
fetch('products.json')
  .then(res=>res.json())
  .then(data=>{
    products=data;
    loadProducts(products);
    updateCart();
  })
  .catch(err=>{
    console.error('Error loading products:', err);
    productGrid.innerHTML='<p>Failed to load products.</p>';
  });
