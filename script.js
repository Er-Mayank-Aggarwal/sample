document.addEventListener('DOMContentLoaded', function () {

  /* ================================
     STATE
  ================================= */
  let cart = JSON.parse(localStorage.getItem("cart")) || {};
  let isList = false;

  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function getCartCount() {
    return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
  }

  function updateCartBadge() {
    const count = getCartCount();
    const badge = document.querySelector('.cart-badge');
    if (badge) badge.textContent = count;
    try {
      if (window.parent !== window) {
        const parentBadge = window.parent.document.querySelector('.cart-badge');
        if (parentBadge) parentBadge.textContent = count;
      }
    } catch (e) {}
  }

  /* ================================
     ADD / QTY CONTROL
  ================================= */
  document.addEventListener('click', function (e) {
    const card = e.target.closest('.product-card');
    if (!card) return;

    const name = card.querySelector('.product-name').textContent;
    // Get Price (Numbers only)
    const priceRaw = card.querySelector('.current-price').textContent;
    const price = parseFloat(priceRaw.replace(/[^\d.]/g, ''));
    
    // 🔥 NEW: Get Image Source
    const imgEl = card.querySelector('.product-image');
    const imgSrc = imgEl ? imgEl.src : ''; 

    /* ADD BUTTON CLICK */
    if (e.target.classList.contains('add-btn')) {
      // Save Image to Cart Object
      cart[name] = { price, qty: 1, img: imgSrc };
      
      saveCart();
      updateCartBadge();

      const pricing = e.target.closest('.product-pricing');
      pricing.innerHTML = `
        <div class="price-stack">
          <span class="current-price">${priceRaw}</span>
        </div>
        <div class="qty-control">
          <button class="qty-btn minus">−</button>
          <span class="qty-value">1</span>
          <button class="qty-btn plus">+</button>
        </div>
      `;
    }

    /* PLUS CLICK */
    if (e.target.classList.contains('plus')) {
      cart[name].qty++;
      saveCart();
      updateCartBadge();
      e.target.parentElement.querySelector('.qty-value').textContent = cart[name].qty;
    }

    /* MINUS CLICK */
    if (e.target.classList.contains('minus')) {
      cart[name].qty--;
      saveCart();
      updateCartBadge();

      if (cart[name].qty === 0) {
        delete cart[name];
        e.target.closest('.product-pricing').innerHTML = `
          <div class="price-stack">
            <span class="current-price">${priceRaw}</span>
          </div>
          <button class="add-btn">ADD</button>
        `;
      } else {
        e.target.parentElement.querySelector('.qty-value').textContent = cart[name].qty;
      }
    }
  });

  /* ================================
     INIT STATE (Restore UI)
  ================================= */
  document.querySelectorAll('.product-card').forEach(card => {
    const name = card.querySelector('.product-name').textContent;
    const priceEl = card.querySelector('.current-price');

    if (cart[name]) {
      const pricing = card.querySelector('.product-pricing');
      pricing.innerHTML = `
        <div class="price-stack">
          <span class="current-price">${priceEl.textContent}</span>
        </div>
        <div class="qty-control">
          <button class="qty-btn minus">−</button>
          <span class="qty-value">${cart[name].qty}</span>
          <button class="qty-btn plus">+</button>
        </div>
      `;
    }
  });

  /* ================================
     SEARCH & FILTER
  ================================= */
  const searchInput = document.querySelector('.search-input');
  const productCards = document.querySelectorAll('.product-card');

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const term = this.value.toLowerCase();
      productCards.forEach(card => {
        const name = card.querySelector('.product-name').textContent.toLowerCase();
        const displayStyle = name.includes(term) ? '' : 'none';
        card.style.display = displayStyle;
        if (displayStyle !== 'none' && isList) {
             card.closest('.products-grid').classList.add('list-view');
        }
      });
    });
  }

  const gridBtn = document.querySelector('.grid-view-btn');
  const grids = document.querySelectorAll('.products-grid');
  if (gridBtn) {
    gridBtn.addEventListener('click', () => {
      isList = !isList;
      grids.forEach(grid => grid.classList.toggle('list-view', isList));
      gridBtn.innerHTML = isList ? '<i class="fas fa-th-large"></i>' : '<i class="fas fa-list"></i>';
    });
  }

  const filterButtons = document.querySelectorAll('.filter-btn');
  const categorySections = document.querySelectorAll('.category-section');
  
  filterButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      filterButtons.forEach(b => b.classList.remove('filter-active'));
      this.classList.add('filter-active');
      const filter = this.textContent.toLowerCase();

      categorySections.forEach(section => {
        const title = section.querySelector('.category-title').textContent.toLowerCase();
        if (filter === 'all' || title.includes(filter)) {
          section.style.display = 'block';
        } else {
          section.style.display = 'none';
        }
      });
    });
  });

  updateCartBadge();
});