document.addEventListener('DOMContentLoaded', function() {
  // Category filter functionality
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('filter-active'));
      // Add active class to clicked button
      this.classList.add('filter-active');
    });
  });

  // Add to cart functionality
  const addButtons = document.querySelectorAll('.add-btn');
  const cartBadge = document.querySelector('.cart-badge');
  
  // Get cart count from parent window if in iframe, otherwise from local badge
  let cartCount = 0;
  try {
    if (window.parent !== window && window.parent.document.querySelector('.cart-badge')) {
      cartCount = parseInt(window.parent.document.querySelector('.cart-badge').textContent) || 0;
    } else if (cartBadge) {
      cartCount = parseInt(cartBadge.textContent) || 0;
    }
  } catch(err) {
    cartCount = cartBadge ? parseInt(cartBadge.textContent) || 0 : 0;
  }

  addButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      cartCount++;
      
      // Update local badge if it exists
      if (cartBadge) {
        cartBadge.textContent = cartCount;
      }
      
      // Update parent window cart count if inside iframe
      try {
        if (window.parent !== window) {
          const parentBadge = window.parent.document.querySelector('.cart-badge');
          if (parentBadge) {
            parentBadge.textContent = cartCount;
          }
        }
      } catch(err) {
        console.log('Cannot access parent window');
      }
      
      // Visual feedback
      this.style.backgroundColor = '#4280FD';
      this.style.color = '#FFFFFF';
      this.textContent = 'ADDED';
      
      // Reset after 1.5 seconds
      setTimeout(() => {
        this.style.backgroundColor = '#FFFFFF';
        this.style.color = '#4280FD';
        this.textContent = 'ADD';
      }, 1500);
    });
  });

  // Search functionality
  const searchInput = document.querySelector('.search-input');
  const productCards = document.querySelectorAll('.product-card');

  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      
      productCards.forEach(card => {
        const productName = card.querySelector('.product-name').textContent.toLowerCase();
        if (productName.includes(searchTerm)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // Grid view button - Toggle between grid and list view
  const gridViewButton = document.querySelector('.grid-view-btn');
  const productsGrid = document.querySelector('.products-grid');
  let isGridView = true;

  if (gridViewButton && productsGrid) {
    gridViewButton.addEventListener('click', function(e) {
      e.preventDefault();
      isGridView = !isGridView;

      if (isGridView) {
        // Switch to grid view (2 columns)
        productsGrid.style.gridTemplateColumns = '1fr 1fr';
        productsGrid.style.gap = '16px';
      } else {
        // Switch to list view (1 column)
        productsGrid.style.gridTemplateColumns = '1fr';
        productsGrid.style.gap = '12px';
      }

      // Add visual feedback to button
      gridViewButton.style.opacity = '0.6';
      setTimeout(() => {
        gridViewButton.style.opacity = '1';
      }, 200);
    });
  }

  // Back button functionality
  const backButton = document.querySelector('.back-btn');
  if (backButton) {
    backButton.addEventListener('click', function() {
      console.log('Navigate back');
    });
  }
});
