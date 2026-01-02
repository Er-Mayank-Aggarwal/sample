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
  let cartCount = 2; // Initial cart count from design

  addButtons.forEach(button => {
    button.addEventListener('click', function() {
      cartCount++;
      cartBadge.textContent = cartCount;
      
      // Visual feedback
      this.style.backgroundColor = '#4280FD';
      this.style.color = '#FFFFFF';
      this.textContent = 'ADDED';
      
      // Reset after 1 second
      setTimeout(() => {
        this.style.backgroundColor = '#FFFFFF';
        this.style.color = '#4280FD';
        this.textContent = 'ADD';
      }, 1000);
    });
  });

  // Search functionality
  const searchInput = document.querySelector('.search-input');
  const productCards = document.querySelectorAll('.product-card');

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

  // Back button functionality
  const backButton = document.querySelector('.back-btn');
  backButton.addEventListener('click', function() {
    // In a real app, this would navigate back
    console.log('Navigate back');
  });

  // Store action buttons
  const callButton = document.querySelector('.call-btn');
  const shareButton = document.querySelector('.share-btn');

  callButton.addEventListener('click', function() {
    console.log('Call store');
  });

  shareButton.addEventListener('click', function() {
    console.log('Share store');
  });

  // Grid view button
  const gridViewButton = document.querySelector('.grid-view-btn');
  gridViewButton.addEventListener('click', function() {
    console.log('Toggle grid view');
  });
});
