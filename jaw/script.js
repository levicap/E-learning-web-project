// Product data
const products = [
    {
      id: 1,
      name: "Lenovo Ideapad",
      description: "PC Portable performant avec 8GB RAM, 256GB SSD",
      price: 799,
      image: "/placeholder.svg?height=150&width=200",
      category: "laptops"
    },
    {
      id: 2,
      name: "HP Pavilion",
      description: "Design moderne, i5 11e Gén, écran Full HD",
      price: 899,
      image: "/placeholder.svg?height=150&width=200",
      category: "laptops"
    },
    {
      id: 3,
      name: "Dell Inspiron",
      description: "Fiabilité et performance à petit prix",
      price: 699,
      image: "/placeholder.svg?height=150&width=200",
      category: "laptops"
    },
    {
      id: 4,
      name: "SSD 500GB",
      description: "Disque SSD haute performance",
      price: 79,
      image: "/placeholder.svg?height=150&width=200",
      category: "components"
    },
    {
      id: 5,
      name: "Souris Gaming RGB",
      description: "Souris ergonomique avec éclairage RGB",
      price: 49,
      image: "/placeholder.svg?height=150&width=200",
      category: "accessories"
    },
    {
      id: 6,
      name: "Clavier Mécanique",
      description: "Clavier gaming avec switches mécaniques",
      price: 89,
      image: "/placeholder.svg?height=150&width=200",
      category: "accessories"
    },
    {
      id: 7,
      name: "Écran 24 pouces",
      description: "Écran Full HD 144Hz pour gaming",
      price: 199,
      image: "/placeholder.svg?height=150&width=200",
      category: "accessories"
    },
    {
      id: 8,
      name: "PC Gamer",
      description: "PC de bureau pour gaming haute performance",
      price: 1299,
      image: "/placeholder.svg?height=150&width=200",
      category: "desktops"
    },
    {
      id: 9,
      name: "PC Bureau",
      description: "PC de bureau pour usage professionnel",
      price: 899,
      image: "/placeholder.svg?height=150&width=200",
      category: "desktops"
    },
    {
      id: 10,
      name: "Carte Graphique RTX",
      description: "Carte graphique pour gaming et création",
      price: 499,
      image: "/placeholder.svg?height=150&width=200",
      category: "components"
    }
  ];
  
  // Cart functionality
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Update cart count
  function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count, #cart-count-mobile');
    cartCountElements.forEach(element => {
      element.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    });
  }
  
  // Initialize page
  document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // Add to cart buttons on home page and shop page
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', function() {
        const productElement = this.closest('.product');
        const productId = parseInt(productElement.dataset.id);
        addToCart(productId);
      });
    });
    
    // Shop page functionality
    if (window.location.pathname.includes('shop.html')) {
      loadProducts();
      
      // Category filter
      const categoryLinks = document.querySelectorAll('.category-link');
      categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const category = this.dataset.category;
          loadProducts(category);
          
          // Update active class
          categoryLinks.forEach(l => l.classList.remove('active'));
          this.classList.add('active');
          
          // Update URL without reloading
          const url = new URL(window.location);
          if (category === 'all') {
            url.searchParams.delete('category');
          } else {
            url.searchParams.set('category', category);
          }
          window.history.pushState({}, '', url);
        });
      });
      
      // Search functionality
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.addEventListener('input', function() {
          const searchTerm = this.value.toLowerCase().trim();
          filterProducts(searchTerm);
        });
      }
      
      // Check URL for category parameter
      const urlParams = new URLSearchParams(window.location.search);
      const categoryParam = urlParams.get('category');
      if (categoryParam) {
        const categoryLink = document.querySelector(`.category-link[data-category="${categoryParam}"]`);
        if (categoryLink) {
          categoryLink.click();
        }
      }
    }
    
    // Cart page functionality
    if (window.location.pathname.includes('cart.html')) {
      renderCart();
      
      // Checkout button
      const checkoutBtn = document.getElementById('checkout-btn');
      if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
          if (cart.length > 0) {
            document.getElementById('order-modal').style.display = 'flex';
          }
        });
      }
      
      // Close modals
      const closeButtons = document.querySelectorAll('.close-modal');
      closeButtons.forEach(button => {
        button.addEventListener('click', function() {
          this.closest('.modal').style.display = 'none';
        });
      });
      
      // Order form submission
      const orderForm = document.getElementById('order-form');
      if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          // Generate random order number
          const orderNumber = 'ORD-' + Math.floor(Math.random() * 1000000);
          document.getElementById('order-number').textContent = orderNumber;
          
          // Hide order modal and show confirmation
          document.getElementById('order-modal').style.display = 'none';
          document.getElementById('confirmation-modal').style.display = 'flex';
          
          // Clear cart
          cart = [];
          localStorage.setItem('cart', JSON.stringify(cart));
          updateCartCount();
        });
      }
      
      // Continue shopping button
      const continueShoppingBtn = document.getElementById('continue-shopping');
      if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
          window.location.href = 'index.html';
        });
      }
    }
  });
  
  // Add product to cart
  function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show confirmation
    alert(`${product.name} a été ajouté au panier!`);
  }
  
  // Load products on shop page
  function loadProducts(category = 'all') {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    // Filter products by category
    let filteredProducts = products;
    if (category !== 'all') {
      filteredProducts = products.filter(product => product.category === category);
    }
    
    // Update category title
    const categoryTitle = document.getElementById('category-title');
    if (categoryTitle) {
      if (category === 'all') {
        categoryTitle.textContent = 'Tous les produits';
      } else {
        const categoryNames = {
          'laptops': 'Ordinateurs Portables',
          'desktops': 'Ordinateurs de Bureau',
          'accessories': 'Accessoires',
          'components': 'Composants'
        };
        categoryTitle.textContent = categoryNames[category] || 'Produits';
      }
    }
    
    // Clear container
    productsContainer.innerHTML = '';
    
    // Add products
    if (filteredProducts.length === 0) {
      productsContainer.innerHTML = '<p class="no-products">Aucun produit trouvé dans cette catégorie.</p>';
      return;
    }
    
    filteredProducts.forEach(product => {
      const productElement = document.createElement('div');
      productElement.className = 'product';
      productElement.dataset.id = product.id;
      productElement.dataset.category = product.category;
      
      productElement.innerHTML = `
        <img src="${product.image}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="price">${product.price} €</div>
        <button class="add-to-cart">Ajouter au panier</button>
      `;
      
      productsContainer.appendChild(productElement);
    });
    
    // Add event listeners to new buttons
    const addToCartButtons = productsContainer.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
      button.addEventListener('click', function() {
        const productElement = this.closest('.product');
        const productId = parseInt(productElement.dataset.id);
        addToCart(productId);
      });
    });
  }
  
  // Filter products by search term
  function filterProducts(searchTerm) {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    const productElements = productsContainer.querySelectorAll('.product');
    
    productElements.forEach(element => {
      const title = element.querySelector('h3').textContent.toLowerCase();
      const description = element.querySelector('p').textContent.toLowerCase();
      
      if (title.includes(searchTerm) || description.includes(searchTerm)) {
        element.style.display = 'block';
      } else {
        element.style.display = 'none';
      }
    });
  }
  
  // Render cart on cart page
  function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartEmptyMessage = document.getElementById('cart-empty');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartItemsContainer || !cartEmptyMessage || !cartSummary) return;
    
    if (cart.length === 0) {
      cartItemsContainer.style.display = 'none';
      cartSummary.style.display = 'none';
      cartEmptyMessage.style.display = 'block';
      return;
    }
    
    cartItemsContainer.style.display = 'block';
    cartSummary.style.display = 'block';
    cartEmptyMessage.style.display = 'none';
    
    // Clear container
    cartItemsContainer.innerHTML = '';
    
    // Add cart items
    cart.forEach(item => {
      const cartItemElement = document.createElement('div');
      cartItemElement.className = 'cart-item';
      
      cartItemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}" />
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">${item.price} €</div>
        </div>
        <div class="cart-item-actions">
          <div class="quantity-control">
            <button class="quantity-btn decrease" data-id="${item.id}">-</button>
            <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
            <button class="quantity-btn increase" data-id="${item.id}">+</button>
          </div>
          <button class="remove-item" data-id="${item.id}">🗑️</button>
        </div>
      `;
      
      cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Add event listeners
    const decreaseButtons = document.querySelectorAll('.quantity-btn.decrease');
    const increaseButtons = document.querySelectorAll('.quantity-btn.increase');
    const quantityInputs = document.querySelectorAll('.quantity-input');
    const removeButtons = document.querySelectorAll('.remove-item');
    
    decreaseButtons.forEach(button => {
      button.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        updateQuantity(id, -1);
      });
    });
    
    increaseButtons.forEach(button => {
      button.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        updateQuantity(id, 1);
      });
    });
    
    quantityInputs.forEach(input => {
      input.addEventListener('change', function() {
        const id = parseInt(this.dataset.id);
        const quantity = parseInt(this.value);
        if (quantity < 1) this.value = 1;
        setQuantity(id, Math.max(1, quantity));
      });
    });
    
    removeButtons.forEach(button => {
      button.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        removeFromCart(id);
      });
    });
    
    // Update summary
    updateCartSummary();
  }
  
  // Update item quantity
  function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (!item) return;
    
    item.quantity = Math.max(1, item.quantity + change);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
  }
  
  // Set item quantity
  function setQuantity(id, quantity) {
    const item = cart.find(item => item.id === id);
    if (!item) return;
    
    item.quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
  }
  
  // Remove item from cart
  function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
  }
  
  // Update cart summary
  function updateCartSummary() {
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    
    if (!subtotalElement || !shippingElement || !totalElement) return;
    
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? (subtotal > 100 ? 0 : 10) : 0;
    const total = subtotal + shipping;
    
    subtotalElement.textContent = `${subtotal} €`;
    shippingElement.textContent = shipping === 0 ? 'Gratuit' : `${shipping} €`;
    totalElement.textContent = `${total} €`;
  }