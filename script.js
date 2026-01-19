document.addEventListener('DOMContentLoaded', async function () {

  /* =========================================
     1. FETCH DATA & RENDER CONTENT
  ========================================= */
  console.log("Script initializing...");
  
  if (!window.StoreService) {
    console.error("StoreService missing! Check Catalog.html");
    return;
  }

  const storeData = await window.StoreService.getStoreData();
  const productsSection = document.getElementById('products-section');
  const modalList = document.getElementById('modalCategoryList'); 

  // Handle loading/error state
  if (!storeData || !storeData.categories) {
    if (productsSection) productsSection.innerHTML = "<div style='text-align:center; padding:20px; color:#666;'>Menu loading...</div>";
    return;
  }

  // Clear existing content
  if (productsSection) productsSection.innerHTML = '';
  if (modalList) modalList.innerHTML = '';

  // RENDER LOOP
  storeData.categories.forEach(category => {
    
    // Create Category Section
    const section = document.createElement('div');
    section.className = 'category-section';
    section.id = `${category.id}-section`;
    
    section.innerHTML = `
      <h3 class="category-title">${category.name}</h3>
      <div class="products-grid"></div> 
    `;
    
    const grid = section.querySelector('.products-grid');

    // Create Product Cards
    category.products.forEach(prod => {
      const cart = window.StoreService.getCart();
      const currentQty = cart[prod.name] ? cart[prod.name].qty : 0;
      const imgSrc = prod.image ? prod.image : 'fallback.jpeg';

      const card = document.createElement('div');
      card.className = 'product-card';
      
      card.innerHTML = `
        <div class="product-image-container">
           ${prod.discount ? `<div class="discount-badge">${prod.discount}</div>` : ''}
           <img src="${imgSrc}" class="product-image" alt="${prod.name}" onerror="this.src='fallback.jpeg'">
        </div>
        <div class="product-info">
           <div class="product-name">${prod.name}</div>
           <div class="product-quantity">${prod.unit || '1 Unit'}</div>
           <div class="product-pricing">
              <div class="price-stack">
                 <span class="current-price">₹${prod.price}</span>
                 ${prod.mrp ? `<span class="original-price">₹${prod.mrp}</span>` : ''}
              </div>
              ${getButtonHtml(currentQty)} 
           </div>
        </div>
      `;
      grid.appendChild(card);
    });

    if (productsSection) productsSection.appendChild(section);

    // Update Floating Menu
    if (modalList) {
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="#${category.id}-section" class="modal-category-link">
          ${category.name} <span class="category-count">${category.products.length}</span>
        </a>`;
      modalList.appendChild(li);
    }
  });

  /* =========================================
     2. CART INTERACTION (THE FIX IS HERE)
  ========================================= */
  
  function getButtonHtml(qty) {
    if (qty > 0) {
      return `
        <div class="qty-control">
          <button class="qty-btn minus">−</button>
          <span class="qty-value">${qty}</span>
          <button class="qty-btn plus">+</button>
        </div>`;
    }
    return `<button class="add-btn">ADD</button>`;
  }

  // Global Click Listener
  document.addEventListener('click', function (e) {
    
    // Ignore non-interaction clicks
    if (!e.target.matches('.add-btn, .plus, .minus')) return;

    const card = e.target.closest('.product-card');
    const name = card.querySelector('.product-name').textContent;
    const priceRaw = card.querySelector('.current-price').textContent;
    const price = parseFloat(priceRaw.replace(/[^\d.]/g, ''));
    const imgEl = card.querySelector('.product-image');
    const img = imgEl ? imgEl.src : 'fallback.jpeg';
    
    let cart = window.StoreService.getCart();

    // --- ADD CLICK ---
    if (e.target.classList.contains('add-btn')) {
      cart[name] = { price, qty: 1, img };
      // FIX: Replace ONLY the button with the controls (OuterHTML), don't touch the price
      e.target.outerHTML = getButtonHtml(1);
    }

    // --- PLUS CLICK ---
    else if (e.target.classList.contains('plus')) {
      cart[name].qty++;
      e.target.parentElement.querySelector('.qty-value').textContent = cart[name].qty;
    }

    // --- MINUS CLICK ---
    else if (e.target.classList.contains('minus')) {
      cart[name].qty--;
      if (cart[name].qty <= 0) {
        delete cart[name];
        // FIX: Find the .qty-control div and replace it with the ADD button
        const controlDiv = e.target.closest('.qty-control');
        controlDiv.outerHTML = `<button class="add-btn">ADD</button>`;
      } else {
        e.target.parentElement.querySelector('.qty-value').textContent = cart[name].qty;
      }
    }

    // Save & Update Badge
    window.StoreService.saveCart(cart);
    updateParentBadge();
  });

  /* =========================================
     3. UTILS & UI LOGIC
  ========================================= */

  function updateParentBadge() {
    const cart = window.StoreService.getCart();
    const count = Object.values(cart).reduce((a, b) => a + b.qty, 0);
    try {
      if (window.parent) {
        const badge = window.parent.document.querySelector('.cart-badge');
        if (badge) badge.textContent = count;
      }
    } catch (e) { }
  }
  
  // Initial Badge Check
  updateParentBadge();

  // Floating Menu Logic
  const floatingBtn = document.getElementById('floatingCategoryBtn');
  const categoryModal = document.getElementById('categoryModal');

  if (floatingBtn && categoryModal) {
    floatingBtn.addEventListener('click', () => categoryModal.style.display = 'block');
    categoryModal.addEventListener('click', (e) => {
      if (e.target === categoryModal) categoryModal.style.display = 'none';
    });
    // Event delegation for links
    if (modalList) {
        modalList.addEventListener('click', (e) => {
            const link = e.target.closest('.modal-category-link');
            if (link) {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const el = document.getElementById(targetId);
                if(el) el.scrollIntoView({behavior:'smooth'});
                categoryModal.style.display = 'none';
            }
        });
    }
  }

  // Grid/List Toggle
  let isList = false;
  const gridBtn = document.querySelector('.grid-view-btn');
  if (gridBtn) {
    gridBtn.addEventListener('click', () => {
      isList = !isList;
      document.querySelectorAll('.products-grid').forEach(g => g.classList.toggle('list-view', isList));
      gridBtn.innerHTML = isList ? '<i class="fas fa-th-large"></i>' : '<i class="fas fa-list"></i>';
    });
  }

  // Search
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const term = this.value.toLowerCase();
      document.querySelectorAll('.category-section').forEach(section => {
        let hasVisible = false;
        section.querySelectorAll('.product-card').forEach(card => {
          const name = card.querySelector('.product-name').textContent.toLowerCase();
          const show = name.includes(term);
          card.style.display = show ? '' : 'none';
          if (show) hasVisible = true;
          if (show && isList) card.closest('.products-grid').classList.add('list-view');
        });
        // Hide category section if no visible products
        section.style.display = hasVisible ? '' : 'none';
      });
    });
  }
});