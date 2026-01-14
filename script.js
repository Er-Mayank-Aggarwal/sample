// Floating category menu logic
document.addEventListener('DOMContentLoaded', function () {
  // ...existing code...
  const floatingBtn = document.getElementById('floatingCategoryBtn');
  const categoryModal = document.getElementById('categoryModal');
  const modalLinks = document.querySelectorAll('.modal-category-link');

  // Show modal on button click
  if (floatingBtn && categoryModal) {
    floatingBtn.addEventListener('click', function (e) {
      categoryModal.style.display = 'block';
    });
    // Hide modal when clicking outside
    categoryModal.addEventListener('click', function (e) {
      if (e.target === categoryModal) {
        categoryModal.style.display = 'none';
      }
    });
    // Hide modal on ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        categoryModal.style.display = 'none';
      }
    });
    // Scroll to category and close modal
    modalLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
        categoryModal.style.display = 'none';
      });
    });
  }

  // Category counts
  function updateCategoryCounts() {
    const croissantCount = document.querySelectorAll('#croissant-section .product-card').length;
    const beveragesCount = document.querySelectorAll('#beverages-section .product-card').length;
    const pastriesCount = document.querySelectorAll('#pastries-section .product-card').length;
    document.getElementById('count-croissant').textContent = croissantCount;
    document.getElementById('count-beverages').textContent = beveragesCount;
    document.getElementById('count-pastries').textContent = pastriesCount;
  }
  updateCategoryCounts();
});
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
    
    // Get Image Source
    const imgEl = card.querySelector('.product-image');
    const imgSrc = imgEl ? imgEl.src : ''; 

    // 🔥 FIX: Capture the "Original Price" (Strike-through) so we don't lose it
    const originalPriceEl = card.querySelector('.original-price');
    const originalPriceHTML = originalPriceEl ? originalPriceEl.outerHTML : '';

    /* ADD BUTTON CLICK */
    if (e.target.classList.contains('add-btn')) {
      cart[name] = { price, qty: 1, img: imgSrc };
      
      saveCart();
      updateCartBadge();

      const pricing = e.target.closest('.product-pricing');
      pricing.innerHTML = `
        <div class="price-stack">
          <span class="current-price">${priceRaw}</span>
          ${originalPriceHTML} 
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
      
      if (cart[name].qty <= 0) {
        delete cart[name];
        saveCart();
        updateCartBadge();

        // 🔥 FIX: When reverting to "ADD", put the Original Price back too!
        e.target.closest('.product-pricing').innerHTML = `
          <div class="price-stack">
            <span class="current-price">${priceRaw}</span>
            ${originalPriceHTML}
          </div>
          <button class="add-btn">ADD</button>
        `;
      } else {
        saveCart();
        updateCartBadge();
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
    
    // 🔥 FIX: Capture original price on load too
    const originalPriceEl = card.querySelector('.original-price');
    const originalPriceHTML = originalPriceEl ? originalPriceEl.outerHTML : '';

    if (cart[name]) {
      const pricing = card.querySelector('.product-pricing');
      pricing.innerHTML = `
        <div class="price-stack">
          <span class="current-price">${priceEl.textContent}</span>
          ${originalPriceHTML}
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

  /* ================================
     OPEN PRODUCT DETAIL PAGE
  ================================ */
  document.addEventListener('click', function(e) {
      const card = e.target.closest('.product-card');
      if (!card) return;

      if (e.target.closest('.add-btn') || 
          e.target.closest('.qty-control') || 
          e.target.closest('.qty-btn')) {
          return;
      }

      const name = card.querySelector('.product-name').textContent;
      const priceRaw = card.querySelector('.current-price').textContent;
      const price = parseFloat(priceRaw.replace(/[^\d.]/g, ''));
      const imageSrc = card.querySelector('.product-image').src;

      const productData = {
          name: name,
          price: price,
          image: imageSrc
      };

      localStorage.setItem('selectedProduct', JSON.stringify(productData));

      try {
          window.parent.openProduct();
      } catch (err) {
          console.error("Could not open product page via parent", err);
      }
  });

  updateCartBadge();
});