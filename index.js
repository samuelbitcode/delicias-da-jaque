// ==========================================
// CONFIGURAÇÃO DO FIREBASE (COM OS SEUS DADOS)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB04Huego0T-ICpMBHgQzgjMiF8K2I-eMQ",
    authDomain: "deliciasdajaque.firebaseapp.com",
    projectId: "deliciasdajaque",
    storageBucket: "deliciasdajaque.firebasestorage.app",
    messagingSenderId: "232605016457",
    appId: "1:232605016457:web:bf9d1f3b3937f4d298158"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
const PHONE_NUMBER = "556292525200";

// ==========================================
// DADOS DO CATÁLOGO E CARRINHO
// ==========================================
const products = [
    {
        id: 1,
        name: "Bolo Temático Stitch",
        category: "bolos",
        price: 75.00,
        description: "Bolo decorado artesanal com topo do Stitch, recheio especial e acabamento vibrante.",
        image: "BoloStith(Destaque).png"
    },
    {
        id: 2,
        name: "Bolo Natalino Infantil",
        category: "bolos",
        price: 75.00,
        description: "Bolo festivo com topo personalizado 'Meu Primeiro Natal' e recheio cremoso.",
        image: "image_d79119.png"
    },
    {
        id: 3,
        name: "Bolo Temático Superman",
        category: "bolos",
        price: 75.00,
        description: "Bolo decorado para aniversários infantis com topo azul e vermelho do Superman.",
        image: "BoloSuperman.png"
    },
    {
        id: 4,
        name: "Bolo de Casamento Clássico",
        category: "bolos",
        price: 75.00,
        description: "Bolo elegante em andares com acabamento impecável e flores delicadas.",
        image: "BoloDeCasamento.png"
    },
    {
        id: 5,
        name: "Bolo Rosa Simples",
        category: "bolos",
        price: 75.00,
        description: "Bolo confeitado em tons de rosa, delicado e saboroso para pequenas comemorações.",
        image: "BoloRosaSimples.png"
    },
    {
        id: 6,
        name: "Cupcake Gourmet Personalizado",
        category: "docinhos",
        price: 3.50,
        description: "Cupcake individual fofinho recheado com cobertura alta decorada.",
        image: "Cupcake.png"
    },
    {
        id: 7,
        name: "Cento de Brigadeiros Tradicionais",
        category: "docinhos",
        price: 95.00,
        description: "Caixa com 100 unidades de brigadeiro tradicional enrolado com carinho.",
        image: "Brigadeiros.png"
    },
    {
        id: 8,
        name: "Copinho de Chocolate Recheado",
        category: "docinhos",
        price: 3.50,
        description: "Delicioso copinho de chocolate recheado com creme especial e confeitos.",
        image: "Docinhos2.png"
    }
];

let cart = [];
let currentProduct = null;
let currentQty = 1;

// Referências DOM
const productGrid = document.getElementById('productGrid');
const cartModal = document.getElementById('cartModal');
const cartBtn = document.getElementById('cartBtn');
const closeCart = document.getElementById('closeCart');
const cartItemsContainer = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotalValue = document.getElementById('cartTotalValue');
const checkoutBtn = document.getElementById('checkoutBtn');

// Detalhes do Produto
const productDetailPage = document.getElementById('productDetailPage');
const backToCatalog = document.getElementById('backToCatalog');
const detailImg = document.getElementById('detailImg');
const detailCategory = document.getElementById('detailCategory');
const detailTitle = document.getElementById('detailTitle');
const detailPrice = document.getElementById('detailPrice');
const detailDesc = document.getElementById('detailDesc');
const qtyVal = document.getElementById('qtyVal');
const qtyMinus = document.getElementById('qtyMinus');
const qtyPlus = document.getElementById('qtyPlus');
const detailAddToCartBtn = document.getElementById('detailAddToCartBtn');
const detailBuyNowBtn = document.getElementById('detailBuyNowBtn');

// Autenticação
const userAccountBtn = document.getElementById('userAccountBtn');
const userNameDisplay = document.getElementById('userNameDisplay');
const authModal = document.getElementById('authModal');
const closeAuth = document.getElementById('closeAuth');
const authForm = document.getElementById('authForm');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const authSwitchText = document.getElementById('authSwitchText');
const authSwitchBtn = document.getElementById('authSwitchBtn');
const userInfoSection = document.getElementById('userInfoSection');
const loggedUserEmail = document.getElementById('loggedUserEmail');
const logoutBtn = document.getElementById('logoutBtn');

let isRegistering = false;

// Exibir Produtos
function displayProducts(items) {
    productGrid.innerHTML = items.map(product => `
        <div class="product-card" onclick="openProductModal(${product.id})">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='Cupcake.png'">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-bottom">
                    <span class="price">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
                    <button class="btn-primary" onclick="event.stopPropagation(); addToCart(${product.id}, 1)">
                        <i class="fa-solid fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filtros
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const filter = e.target.getAttribute('data-filter');
        if (filter === 'todos') {
            displayProducts(products);
        } else {
            displayProducts(products.filter(p => p.category === filter));
        }
    });
});

// Detalhes
window.openProductModal = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentProduct = product;
    currentQty = 1;

    detailImg.src = product.image;
    detailCategory.innerText = product.category;
    detailTitle.innerText = product.name;
    detailPrice.innerText = `R$ ${product.price.toFixed(2).replace('.', ',')}`;
    detailDesc.innerText = product.description;
    qtyVal.innerText = currentQty;

    productDetailPage.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

backToCatalog.addEventListener('click', () => {
    productDetailPage.style.display = 'none';
});

qtyMinus.addEventListener('click', () => {
    if (currentQty > 1) {
        currentQty--;
        qtyVal.innerText = currentQty;
    }
});

qtyPlus.addEventListener('click', () => {
    currentQty++;
    qtyVal.innerText = currentQty;
});

detailAddToCartBtn.addEventListener('click', () => {
    if (currentProduct) {
        addToCart(currentProduct.id, currentQty);
        productDetailPage.style.display = 'none';
    }
});

detailBuyNowBtn.addEventListener('click', () => {
    if (currentProduct) {
        const total = currentProduct.price * currentQty;
        const msg = `Olá Jaque! Gostaria de encomendar agora:\n- ${currentQty}x ${currentProduct.name} (Total: R$ ${total.toFixed(2).replace('.', ',')})`;
        window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    }
});

// Carrinho
window.addToCart = function(productId, qty = 1) {
    const product = products.find(p => p.id === productId);
    for (let i = 0; i < qty; i++) {
        cart.push(product);
    }
    updateCartUI();
    saveCartToCloud();
    cartModal.classList.add('open');
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCartUI();
    saveCartToCloud();
}

function updateCartUI() {
    cartCount.innerText = cart.length;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Seu carrinho está vazio.</p>';
        cartTotalValue.innerText = 'R$ 0,00';
        return;
    }

    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <span>R$ ${item.price.toFixed(2).replace('.', ',')}</span>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotalValue.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

async function saveCartToCloud() {
    if (!currentUser) return;
    try {
        const cartRef = doc(db, "carts", currentUser.uid);
        const cartData = cart.map(item => item.id);
        await setDoc(cartRef, { items: cartData });
    } catch (error) {
        console.error("Erro ao salvar carrinho:", error);
    }
}

async function loadCartFromCloud() {
    if (!currentUser) return;
    try {
        const cartRef = doc(db, "carts", currentUser.uid);
        const docSnap = await getDoc(cartRef);
        if (docSnap.exists()) {
            const itemIds = docSnap.data().items || [];
            cart = itemIds.map(id => products.find(p => p.id === id)).filter(Boolean);
            updateCartUI();
        }
    } catch (error) {
        console.error("Erro ao carregar carrinho:", error);
    }
}

cartBtn.addEventListener('click', () => cartModal.classList.add('open'));
closeCart.addEventListener('click', () => cartModal.classList.remove('open'));

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return alert('Seu carrinho está vazio!');

    let msg = "Olá Jaque! Gostaria de fazer o seguinte pedido:\n\n";
    cart.forEach(item => {
        msg += `- ${item.name}: R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
    });
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    msg += `\n*Total:* R$ ${total.toFixed(2).replace('.', ',')}`;

    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
});

// Autenticação Firebase
userAccountBtn.addEventListener('click', () => authModal.classList.add('open'));
closeAuth.addEventListener('click', () => authModal.classList.remove('open'));

authSwitchBtn.addEventListener('click', () => {
    isRegistering = !isRegistering;
    if (isRegistering) {
        authTitle.innerText = "Criar Conta";
        authSubtitle.innerText = "Cadastre-se para guardar seus pedidos!";
        authSubmitBtn.innerText = "Cadastrar";
        authSwitchText.innerText = "Já tem uma conta?";
        authSwitchBtn.innerText = "Entrar";
    } else {
        authTitle.innerText = "Entrar na sua Conta";
        authSubtitle.innerText = "Acesse para salvar o seu carrinho na nuvem!";
        authSubmitBtn.innerText = "Entrar";
        authSwitchText.innerText = "Ainda não tem conta?";
        authSwitchBtn.innerText = "Criar conta agora";
    }
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = authEmail.value;
    const password = authPassword.value;

    try {
        if (isRegistering) {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Conta criada com sucesso!");
        } else {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Login efetuado com sucesso!");
        }
        authModal.classList.remove('open');
    } catch (error) {
        alert("Erro: " + error.message);
    }
});

logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    cart = [];
    updateCartUI();
    authModal.classList.remove('open');
});

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        userNameDisplay.innerText = user.email.split('@')[0];
        loggedUserEmail.innerText = user.email;
        authForm.style.display = 'none';
        userInfoSection.style.display = 'block';
        loadCartFromCloud();
    } else {
        userNameDisplay.innerText = "Entrar";
        authForm.style.display = 'block';
        userInfoSection.style.display = 'none';
    }
});

// ==========================================
// SISTEMA DE AVALIAÇÕES (FIREBASE)
// ==========================================
const openReviewsBtn = document.getElementById('openReviewsBtn');
const reviewsModal = document.getElementById('reviewsModal');
const closeReviews = document.getElementById('closeReviews');
const reviewForm = document.getElementById('reviewForm');
const reviewsList = document.getElementById('reviewsList');

if (openReviewsBtn) {
    openReviewsBtn.addEventListener('click', () => {
        if (reviewsModal) {
            reviewsModal.classList.add('open');
        }
    });
}

if (closeReviews) {
    closeReviews.addEventListener('click', () => {
        if (reviewsModal) {
            reviewsModal.classList.remove('open');
        }
    });
}

if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reviewName').value;
        const text = document.getElementById('reviewText').value;

        try {
            await addDoc(collection(db, "reviews"), {
                name: name,
                text: text,
                date: new Date().toISOString()
            });

            alert("Avaliação enviada com sucesso! Muito obrigado pelo carinho.");
            reviewForm.reset();
            reviewsModal.classList.remove('open');
            loadReviewsFromCloud();
        } catch (error) {
            console.error("Erro ao enviar avaliação:", error);
            alert("Erro ao enviar avaliação. Tente novamente.");
        }
    });
}

async function loadReviewsFromCloud() {
    try {
        const querySnapshot = await getDocs(collection(db, "reviews"));
        let cloudReviewsHTML = '';
        
        querySnapshot.forEach((docSnap) => {
            const rev = docSnap.data();
            cloudReviewsHTML += `
                <div class="testimonial-card" style="margin-bottom: 1rem;">
                    <div class="stars"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div>
                    <p>"${rev.text}"</p>
                    <h4>${rev.name}</h4>
                </div>
            `;
        });

        if (cloudReviewsHTML && reviewsList) {
            reviewsList.innerHTML += cloudReviewsHTML;
        }
    } catch (error) {
        console.error("Erro ao carregar avaliações:", error);
    }
}

// Chatbot IA
const chatToggle = document.getElementById('chatToggle');
const chatBox = document.getElementById('chatBox');
const chatClose = document.getElementById('chatClose');
const sendBtn = document.getElementById('sendBtn');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

if (chatToggle) {
    chatToggle.addEventListener('click', () => chatBox.classList.toggle('open'));
}
if (chatClose) {
    chatClose.addEventListener('click', () => chatBox.classList.remove('open'));
}

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    chatInput.value = '';

    setTimeout(() => {
        let botResponse = "Você pode clicar em qualquer foto do catálogo para abrir os detalhes ou nos chamar no WhatsApp: (62) 9252-5200.";
        const lower = text.toLowerCase();

        if (lower.includes('natal') || lower.includes('destaque')) {
            botResponse = "O Bolo Natalino Infantil é o nosso queridinho da semana! Custa R$ 105,00.";
        } else if (lower.includes('stitch')) {
            botResponse = "O Bolo do Stitch custa R$ 110,00.";
        } else if (lower.includes('superman')) {
            botResponse = "O bolo do Superman custa R$ 100,00!";
        } else if (lower.includes('casamento')) {
            botResponse = "O bolo de casamento clássico custa R$ 150,00.";
        } else if (lower.includes('brigadeiro') || lower.includes('docinho')) {
            botResponse = "O cento de brigadeiros tradicionais custa R$ 120,00.";
        }

        addMessage(botResponse, 'bot');
    }, 800);
}

if (sendBtn) {
    sendBtn.addEventListener('click', handleSendMessage);
}
if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });
}

// Splash Screen
window.addEventListener('load', () => {
    const splashScreen = document.getElementById('splashScreen');
    setTimeout(() => {
        splashScreen.classList.add('fade-out');
    }, 4000);
});

document.addEventListener('DOMContentLoaded', () => {
    displayProducts(products);
    loadReviewsFromCloud();
});