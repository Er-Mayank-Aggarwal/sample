document.addEventListener('DOMContentLoaded', function () {

  /* ================================
     STATE
  ================================= */
  let cartCount = 0;
  let isList = false;

  /* ================================
     CATEGORY FILTER
  ================================= */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const categorySections = document.querySelectorAll('.category-section');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', function () {

      filterButtons.forEach(b => b.classList.remove('filter-active'));
      this.classList.add('filter-active');

      const filter = this.textContent.toLowerCase();

      categorySections.forEach(section => {
        const title = section
          .querySelector('.category-title')
          .textContent
          .toLowerCase();

        if (filter === 'all' || title.includes(filter)) {
          section.style.display = 'block';

          section.querySelectorAll('.products-grid')
            .forEach(grid => grid.classList.toggle('list-view', isList));

        } else {
          section.style.display = 'none';
        }
      });
    });
  });

  /* ================================
     CART COUNT
  ================================= */
  function updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    if (badge) badge.textContent = cartCount;

    try {
      if (window.parent !== window) {
        const parentBadge = window.parent.document.querySelector('.cart-badge');
        if (parentBadge) parentBadge.textContent = cartCount;
      }
    } catch (e) {}
  }

  /* ================================
     ADD / QTY CONTROL
  ================================= */
  document.addEventListener('click', function (e) {

    if (e.target.classList.contains('add-btn')) {
      const pricing = e.target.closest('.product-pricing');
      cartCount++;
      updateCartBadge();

      const qtyBox = document.createElement('div');
      qtyBox.className = 'qty-control';
      qtyBox.innerHTML = `
        <button class="qty-btn minus">−</button>
        <span class="qty-value">1</span>
        <button class="qty-btn plus">+</button>
      `;

      pricing.replaceChild(qtyBox, e.target);
    }

    if (e.target.classList.contains('plus')) {
      const value = e.target.parentElement.querySelector('.qty-value');
      value.textContent = +value.textContent + 1;
      cartCount++;
      updateCartBadge();
    }

    if (e.target.classList.contains('minus')) {
      const qtyBox = e.target.parentElement;
      const pricing = qtyBox.closest('.product-pricing');
      const value = qtyBox.querySelector('.qty-value');

      let qty = +value.textContent - 1;
      cartCount--;
      updateCartBadge();

      if (qty === 0) {
        const addBtn = document.createElement('button');
        addBtn.className = 'add-btn';
        addBtn.textContent = 'ADD';
        pricing.replaceChild(addBtn, qtyBox);
      } else {
        value.textContent = qty;
      }
    }
  });

  /* ================================
   SEARCH (VIEW SAFE)
================================ */
const searchInput = document.querySelector('.search-input');
const productCards = document.querySelectorAll('.product-card');

if (searchInput) {
  searchInput.addEventListener('input', function () {
    const term = this.value.toLowerCase();

    productCards.forEach(card => {
      const name = card
        .querySelector('.product-name')
        .textContent
        .toLowerCase();

      if (name.includes(term)) {
        card.style.display = ''; // let CSS decide layout
      } else {
        card.style.display = 'none';
      }

      // 🔥 RE-APPLY LIST/GRID STATE
      const grid = card.closest('.products-grid');
      if (grid) {
        grid.classList.toggle('list-view', isList);
      }
    });
  });
}

  /* ================================
     GRID ↔ LIST TOGGLE
  ================================= */
  const gridBtn = document.querySelector('.grid-view-btn');
  const grids = document.querySelectorAll('.products-grid');

  if (gridBtn) {
    gridBtn.addEventListener('click', () => {
      isList = !isList;

      grids.forEach(grid =>
        grid.classList.toggle('list-view', isList)
      );

      gridBtn.innerHTML = isList
        ? '<i class="fas fa-th-large"></i>'
        : '<i class="fas fa-list"></i>';
    });
  }

});
