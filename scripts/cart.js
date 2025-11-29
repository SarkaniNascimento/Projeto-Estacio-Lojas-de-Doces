// ===== CONFIGURAÇÕES GLOBAIS =====
let cart = [];
let isCartOpen = false;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadCartFromStorage();
});

// ===== EVENT LISTENERS =====
function initializeEventListeners() {

    // Carrinho
    document.getElementById('cart-toggle').addEventListener('click', toggleCart);
    document.getElementById('close-cart').addEventListener('click', closeCart);
    document.getElementById('cart-overlay').addEventListener('click', closeCart);
    document.getElementById('checkout-btn').addEventListener('click', handleCheckout);

    // Produtos
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', addToCart);
    });

    // Quantidade
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', handleQuantityChange);
    });
}

// ===== CARRINHO DE COMPRAS =====
function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (isCartOpen) {
        closeCart();
    } else {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('active');
        isCartOpen = true;
        document.body.style.overflow = 'hidden';
        
        // Animação de entrada
        cartSidebar.style.animation = 'slideInRight 0.3s ease';
    }
}

function closeCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('active');
    isCartOpen = false;
    document.body.style.overflow = 'auto';
}

function addToCart(e) {
    const btn = e.target.closest('.add-to-cart-btn');
    const productCard = btn.closest('.product-card');
    const quantityElement = productCard.querySelector('.qty-value');
    
    const product = {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: parseFloat(btn.dataset.price),
        quantity: parseInt(quantityElement.textContent),
        image: productCard.querySelector('img').src
    };

    // Verificar se o produto já existe no carrinho
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += product.quantity;
    } else {
        cart.push(product);
    }

    // Animação do botão
    btn.style.transform = 'scale(0.95)';
    btn.innerHTML = '<i class="fas fa-check"></i> Adicionado!';
    
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
        btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Adicionar';
    }, 1000);

    updateCartUI();
    saveCartToStorage();
    showToast('Produto adicionado ao carrinho!');
    
    // Animação de pulso no ícone do carrinho
    const cartIcon = document.getElementById('cart-toggle');
    cartIcon.style.animation = 'pulse 0.6s ease';
    setTimeout(() => {
        cartIcon.style.animation = '';
    }, 600);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    saveCartToStorage();
    showToast('Produto removido do carrinho!');
}

function updateCartQuantity(productId, change) {
    const productIndex = cart.findIndex(item => item.id === productId);
    if (productIndex > -1) {
        cart[productIndex].quantity += change;
        if (cart[productIndex].quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartUI();
            saveCartToStorage();
        }
    }
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.querySelector('.cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    // Atualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Atualizar total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2).replace('.', ',');
    
    // Atualizar itens do carrinho
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Seu carrinho está vazio</p>
                <small>Adicione alguns doces deliciosos!</small>
            </div>
        `;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                    <div class="cart-item-quantity">
                        <button onclick="updateCartQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateCartQuantity('${item.id}', 1)">+</button>
                        <button class="remove-item" onclick="removeFromCart('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// ===== QUANTIDADE DE PRODUTOS =====
function handleQuantityChange(e) {
    const btn = e.target;
    const quantityContainer = btn.closest('.quantity-selector');
    const quantityValue = quantityContainer.querySelector('.qty-value');
    let currentValue = parseInt(quantityValue.textContent);
    
    if (btn.classList.contains('plus')) {
        currentValue++;
    } else if (btn.classList.contains('minus') && currentValue > 1) {
        currentValue--;
    }
    
    quantityValue.textContent = currentValue;
    
    // Animação
    quantityValue.style.transform = 'scale(1.2)';
    setTimeout(() => {
        quantityValue.style.transform = 'scale(1)';
    }, 150);
}

// ===== CHECKOUT =====
function handleCheckout() {
    if (cart.length === 0) {
        showToast('Seu carrinho está vazio!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const message = `Olá! Gostaria de finalizar minha compra:\n\n${cart.map(item => 
        `${item.name} - Qtd: ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}`
    ).join('\n')}\n\nTotal: R$ ${total.toFixed(2).replace('.', ',')}`;
    
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    showToast('Redirecionando para WhatsApp...');
}

// ===== MENU MOBILE =====
function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    const menuToggle = document.getElementById('menu-toggle');
    
    nav.classList.toggle('mobile-open');
    menuToggle.classList.toggle('active');
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== STORAGE =====
function saveCartToStorage() {
    localStorage.setItem('docesDeliciososCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('docesDeliciososCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}