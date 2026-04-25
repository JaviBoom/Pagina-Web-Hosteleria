const PRODUCTS_STORAGE_KEY = 'merigon_products';
const ADMIN_SESSION_KEY = 'merigon_admin_session';
const ADMIN_ROLE_KEY = 'merigon_admin_role';
const ADMIN_EMAIL_KEY = 'merigon_admin_email';

// Reemplaza estos valores con tus datos reales de Google Cloud.
const GOOGLE_CLIENT_ID = 'PON_AQUI_TU_CLIENT_ID_GOOGLE.apps.googleusercontent.com';
const ALLOWED_DEVELOPER_EMAIL = 'javiboomsev@gmail.com';

const defaultProducts = [
    {
        id: crypto.randomUUID(),
        name: 'Tarrina de Chocolate',
        desc: 'Chocolate belga y crema fresca',
        price: 'EUR 3.50 / unidad',
        image: 'assets/img/logo.jpg',
        category: 'Tarrinas'
    },
    {
        id: crypto.randomUUID(),
        name: 'Tarrina de Vainilla',
        desc: 'Vainilla natural y crumble',
        price: 'EUR 3.20 / unidad',
        image: 'assets/img/logo.jpg',
        category: 'Tarrinas'
    },
    {
        id: crypto.randomUUID(),
        name: 'Tarrina de Fresa',
        desc: 'Compota de fresa casera',
        price: 'EUR 3.80 / unidad',
        image: 'assets/img/logo.jpg',
        category: 'Tarrinas'
    },
    {
        id: crypto.randomUUID(),
        name: 'Tarta de Chocolate',
        desc: 'Ideal para celebraciones',
        price: 'Desde EUR 22.00',
        image: 'assets/img/logo.jpg',
        category: 'Tartas'
    },
    {
        id: crypto.randomUUID(),
        name: 'Tarta de Vainilla',
        desc: 'Sabor clasico con crema',
        price: 'Desde EUR 20.00',
        image: 'assets/img/logo.jpg',
        category: 'Tartas'
    },
    {
        id: crypto.randomUUID(),
        name: 'Tarta de Fresa',
        desc: 'Fresas frescas y crema ligera',
        price: 'Desde EUR 24.00',
        image: 'assets/img/logo.jpg',
        category: 'Tartas'
    }
];

const loginSection = document.getElementById('loginSection');
const googleSignInButton = document.getElementById('googleSignInButton');
const loginWarning = document.getElementById('loginWarning');
const adminPanel = document.getElementById('adminPanel');
const sessionBadge = document.getElementById('sessionBadge');
const developerTools = document.getElementById('developerTools');
const developerEmail = document.getElementById('developerEmail');
const productForm = document.getElementById('productForm');
const productList = document.getElementById('productList');
const logoutBtn = document.getElementById('logoutBtn');
const resetCatalogBtn = document.getElementById('resetCatalogBtn');

let products = [];
let isAdminSession = localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
let adminRole = localStorage.getItem(ADMIN_ROLE_KEY) || '';
let currentEmail = localStorage.getItem(ADMIN_EMAIL_KEY) || '';

function decodeJwtPayload(jwtToken) {
    const parts = jwtToken.split('.');
    if (parts.length !== 3) {
        return null;
    }

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

    try {
        return JSON.parse(atob(padded));
    } catch (error) {
        return null;
    }
}

function showWarning(message) {
    if (!loginWarning) {
        return;
    }

    loginWarning.hidden = false;
    loginWarning.textContent = message;
}

function clearWarning() {
    if (!loginWarning) {
        return;
    }

    loginWarning.hidden = true;
    loginWarning.textContent = '';
}

function saveSession(email, role) {
    isAdminSession = true;
    adminRole = role;
    currentEmail = email;
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    localStorage.setItem(ADMIN_ROLE_KEY, role);
    localStorage.setItem(ADMIN_EMAIL_KEY, email);
}

function clearSession() {
    isAdminSession = false;
    adminRole = '';
    currentEmail = '';
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_ROLE_KEY);
    localStorage.removeItem(ADMIN_EMAIL_KEY);
}

function hasValidStoredSession() {
    const allowedEmail = ALLOWED_DEVELOPER_EMAIL.toLowerCase();
    return isAdminSession && adminRole === 'superadmin' && currentEmail.toLowerCase() === allowedEmail;
}

function onGoogleLogin(response) {
    const payload = decodeJwtPayload(response.credential || '');
    if (!payload) {
        showWarning('No se pudo validar la sesion de Google. Intentalo otra vez.');
        return;
    }

    const email = (payload.email || '').toLowerCase();
    const emailVerified = payload.email_verified === true;
    const allowedEmail = ALLOWED_DEVELOPER_EMAIL.toLowerCase();

    if (!emailVerified) {
        showWarning('Tu correo de Google no esta verificado.');
        return;
    }

    if (email !== allowedEmail) {
        showWarning('Esta cuenta no tiene permiso de desarrollador.');
        clearSession();
        updateAdminUI();
        return;
    }

    clearWarning();
    saveSession(email, 'superadmin');
    updateAdminUI();
    renderProductList();
    document.getElementById('productName')?.focus();
}

function initGoogleLogin() {
    if (hasValidStoredSession()) {
        return;
    }

    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
        showWarning('No se pudo cargar Google Sign-In. Revisa conexion o bloqueo del navegador.');
        return;
    }

    if (GOOGLE_CLIENT_ID.startsWith('PON_AQUI_')) {
        showWarning('Configura tu GOOGLE_CLIENT_ID en admin.html para activar el acceso real.');
        return;
    }

    window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: onGoogleLogin,
        auto_select: true,
        ux_mode: 'popup'
    });

    window.google.accounts.id.renderButton(googleSignInButton, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill'
    });

    window.google.accounts.id.prompt();
}

function saveProducts() {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

function loadProducts() {
    const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!storedProducts) {
        products = [...defaultProducts];
        saveProducts();
        return;
    }

    try {
        const parsed = JSON.parse(storedProducts);
        products = Array.isArray(parsed) ? parsed : [...defaultProducts];
    } catch (error) {
        products = [...defaultProducts];
        saveProducts();
    }
}

function updateAdminUI() {
    adminPanel.hidden = !isAdminSession;
    loginSection.hidden = isAdminSession;
    if (sessionBadge) {
        sessionBadge.textContent = isAdminSession
            ? `Sesion iniciada como ${adminRole || 'admin'}`
            : '';
    }

    const isSuperAdmin = isAdminSession && adminRole === 'superadmin';
    developerTools.hidden = !isSuperAdmin;
    if (isSuperAdmin && developerEmail) {
        developerEmail.textContent = currentEmail;
    }
}

function renderProductList() {
    if (!products.length) {
        productList.innerHTML = '<li class="empty">No hay productos para eliminar.</li>';
        return;
    }

    productList.innerHTML = products.map((product) => `
        <li class="product-item">
            <div>
                <strong>${product.name}</strong>
                <p>${product.price}</p>
            </div>
            <button class="btn secondary remove-btn" type="button" data-id="${product.id}">Eliminar</button>
        </li>
    `).join('');
}

loadProducts();
if (!hasValidStoredSession()) {
    clearSession();
}
updateAdminUI();
renderProductList();

if (!isAdminSession) {
    initGoogleLogin();
}

logoutBtn.addEventListener('click', () => {
    clearSession();
    updateAdminUI();
    clearWarning();

    if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.disableAutoSelect();
    }

    initGoogleLogin();
});

resetCatalogBtn.addEventListener('click', () => {
    if (!isAdminSession || adminRole !== 'superadmin') {
        return;
    }

    const confirmed = window.confirm('Se restablecera el catalogo por defecto. Continuar?');
    if (!confirmed) {
        return;
    }

    products = [...defaultProducts];
    saveProducts();
    renderProductList();
});

productForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!isAdminSession) {
        return;
    }

    const name = document.getElementById('productName').value.trim();
    const desc = document.getElementById('productDesc').value.trim();
    const price = document.getElementById('productPrice').value.trim();
    const category = document.getElementById('productCategory').value.trim();
    const image = document.getElementById('productImage').value.trim();

    if (!name || !desc || !price || !category || !image) {
        alert('Completa todos los campos.');
        return;
    }

    products.unshift({
        id: crypto.randomUUID(),
        name,
        desc,
        price,
        category,
        image
    });

    saveProducts();
    renderProductList();
    productForm.reset();
    document.getElementById('productName').focus();
});

productList.addEventListener('click', (event) => {
    const removeBtn = event.target.closest('.remove-btn');
    if (!removeBtn || !isAdminSession) {
        return;
    }

    const productId = removeBtn.dataset.id;
    products = products.filter((product) => product.id !== productId);
    saveProducts();
    renderProductList();
});
