// cart-api.js
// cart-api.js (LOCAL ONLY)

// Helper to get the cart from StoreService
function getCart() {
  return window.StoreService.getCart();
}

// Helper to save the cart
function saveCart(cart) {
  window.StoreService.saveCart(cart);
}

// ========== GET CART ==========
export async function fetchCart() {
  // Returns the cart object from localStorage
  return getCart();
}

// ========== ADD TO CART ==========
export async function addItem(product_id, qty = 1, name, price, img) {
  // name, price, img must be provided by the caller
  const cart = getCart();
  if (!cart[name]) {
    cart[name] = { id: product_id, price, qty, img };
  } else {
    cart[name].qty += qty;
  }
  saveCart(cart);
  return true;
}

// ========== UPDATE QTY ==========
export async function updateItem(product_id, qty, name) {
  const cart = getCart();
  if (cart[name]) {
    cart[name].qty = qty;
    if (qty <= 0) delete cart[name];
    saveCart(cart);
    return true;
  }
  return false;
}

// ========== REMOVE ITEM ==========
export async function removeItem(product_id, name) {
  const cart = getCart();
  if (cart[name]) {
    delete cart[name];
    saveCart(cart);
    return true;
  }
  return false;
}

// ========== CLEAR CART ==========
export async function clearCart() {
  saveCart({});
  return true;
}

