/*
 * script.js
 *
 * This file contains the JavaScript logic for the Pokémon card e‑commerce site.
 * It handles adding products to the cart, persisting the cart to localStorage,
 * updating the cart count in the navigation bar, filtering the product list,
 * and rendering the cart table.
 */

// Utility to get cart from localStorage
function getCart() {
  const cartJSON = localStorage.getItem('cart');
  return cartJSON ? JSON.parse(cartJSON) : [];
}

// Utility to save cart to localStorage
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart count in navbar
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const countElements = document.querySelectorAll('.cart-count');
  countElements.forEach((el) => (el.textContent = count));
}

// Add item to cart
function addToCart(product) {
  const cart = getCart();
  const existingIndex = cart.findIndex((item) => item.id === product.id);
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
  updateCartCount();
  alert(`${product.name} added to cart!`);
}

// Remove item from cart
function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== productId);
  saveCart(cart);
  renderCartTable();
  updateCartCount();
}

// Change quantity of an item
function changeQuantity(productId, newQty) {
  const cart = getCart();
  const item = cart.find((i) => i.id === productId);
  if (item) {
    item.quantity = parseInt(newQty, 10);
    if (item.quantity <= 0) {
      // Remove item if quantity is zero or less
      removeFromCart(productId);
      return;
    }
    saveCart(cart);
    renderCartTable();
    updateCartCount();
  }
}

// Render cart table on cart.html
function renderCartTable() {
  const tableBody = document.querySelector('#cart-items');
  const totalElement = document.querySelector('#cart-total');
  if (!tableBody) return;
  const cart = getCart();
  tableBody.innerHTML = '';
  let total = 0;
  cart.forEach((item) => {
    const row = document.createElement('tr');
    // Image cell
    const imgCell = document.createElement('td');
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    imgCell.appendChild(img);
    row.appendChild(imgCell);
    // Name cell
    const nameCell = document.createElement('td');
    nameCell.textContent = item.name;
    row.appendChild(nameCell);
    // Price cell
    const priceCell = document.createElement('td');
    priceCell.textContent = `$${item.price.toFixed(2)}`;
    row.appendChild(priceCell);
    // Quantity cell with input
    const qtyCell = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '1';
    input.value = item.quantity;
    input.addEventListener('change', (e) => {
      changeQuantity(item.id, e.target.value);
    });
    qtyCell.appendChild(input);
    row.appendChild(qtyCell);
    // Subtotal cell
    const subtotal = item.price * item.quantity;
    total += subtotal;
    const subtotalCell = document.createElement('td');
    subtotalCell.textContent = `$${subtotal.toFixed(2)}`;
    row.appendChild(subtotalCell);
    // Remove button
    const removeCell = document.createElement('td');
    const btn = document.createElement('button');
    btn.textContent = 'Remove';
    btn.classList.add('btn-add');
    btn.addEventListener('click', () => removeFromCart(item.id));
    removeCell.appendChild(btn);
    row.appendChild(removeCell);
    tableBody.appendChild(row);
  });
  // Display total
  if (totalElement) {
    totalElement.textContent = `$${total.toFixed(2)}`;
  }
}

// Filter products by search and category
function setupProductFilters() {
  const searchInput = document.querySelector('#search-input');
  const categorySelect = document.querySelector('#category-select');
  const productCards = document.querySelectorAll('.product-card');
  const applyFilters = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categorySelect.value;
    productCards.forEach((card) => {
      const name = card.dataset.name.toLowerCase();
      const cat = card.dataset.category;
      const matchesSearch = name.includes(searchTerm);
      const matchesCategory = category === 'all' || category === cat;
      card.style.display = matchesSearch && matchesCategory ? 'flex' : 'none';
    });
  };
  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (categorySelect) categorySelect.addEventListener('change', applyFilters);
}

// Initialise event listeners on products page
function setupAddToCartButtons() {
  const buttons = document.querySelectorAll('.btn-add');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      if (!card) return;
      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = parseFloat(card.dataset.price);
      const image = card.dataset.image;
      addToCart({ id, name, price, image });
    });
  });
}

// Document ready handler
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  // Bind Add to Cart buttons on any page that contains product cards
  setupAddToCartButtons();
  // Initialise product filters on products page
  if (document.body.classList.contains('products-page')) {
    setupProductFilters();
  }
  // Render cart if on cart page
  if (document.body.classList.contains('cart-page')) {
    renderCartTable();
  }
});