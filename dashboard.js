// dashboard.js - Dashboard functionality

// Data pengguna
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Inisialisasi cart jika belum ada
if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify([]));
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    const greetingElement = document.getElementById('greeting');
    const welcomeTitle = document.getElementById('welcome-title');
    const logoutBtn = document.getElementById('logoutBtn');
    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const featuredBooksContainer = document.getElementById('featured-books');
    const closeButtons = document.querySelectorAll('.close');
    const searchInput = document.getElementById('searchInput');
    
    // Set greeting berdasarkan waktu
    const hour = new Date().getHours();
    let greeting = '';
    let timeOfDay = '';
    
    if (hour < 12) {
        greeting = 'Selamat Pagi';
        timeOfDay = 'pagi';
    } else if (hour < 18) {
        greeting = 'Selamat Siang';
        timeOfDay = 'siang';
    } else {
        greeting = 'Selamat Sore';
        timeOfDay = 'sore';
    }
    
    greetingElement.textContent = `${greeting}, ${currentUser.nama}!`;
    welcomeTitle.textContent = `Selamat ${timeOfDay}! Selamat Datang di BookStore, ${currentUser.nama.split(' ')[0]}!`;
    
    // Display featured books - PERBAIKAN: Gunakan data yang benar
    displayFeaturedBooks();
    
    // Update cart count
    updateCartCount();
    
    // Event Listeners
    logoutBtn.addEventListener('click', handleLogout);
    cartBtn.addEventListener('click', showCartModal);
    
    // Search functionality
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBooks();
        }
    });
    
    // Close modal events
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            cartModal.style.display = 'none';
            document.getElementById('book-detail-modal').style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (e.target === document.getElementById('book-detail-modal')) {
            document.getElementById('book-detail-modal').style.display = 'none';
        }
    });
    
    // Functions
    function displayFeaturedBooks(books = getBooksData()) { // PERBAIKAN: Gunakan fungsi getBooksData()
        featuredBooksContainer.innerHTML = '';
        
        const booksToDisplay = books.length > 0 ? books : getBooksData();
        
        if (booksToDisplay.length === 0) {
            featuredBooksContainer.innerHTML = `
                <div class="no-books" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <p style="color: var(--text-light); font-style: italic;">Tidak ada buku yang ditemukan</p>
                </div>
            `;
            return;
        }
        
        booksToDisplay.forEach((book, index) => {
            const bookCard = createBookCard(book, index);
            featuredBooksContainer.appendChild(bookCard);
        });
    }
    
    function createBookCard(book, index) {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card pink-card';
        bookCard.innerHTML = `
            <div class="book-cover-container" onclick="showFullScreenImage('${book.cover}')">
                <img src="${book.cover}" alt="${book.namaBarang}" class="book-cover" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDIwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNFQ0VGIi8+CjxwYXRoIGQ9Ik03NSA3NUgxMjVWMTI1SDc1Vjc1WiIgZmlsbD0iI0U5MUU2MyIvPgo8dGV4dCB4PSIxMDAiIHk9IjE3MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0U5MUU2MyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5Cb29rIENvdmVyPC90ZXh0Pgo8L3N2Zz4K'">
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.namaBarang}</h3>
                <div class="book-meta">
                    <div class="meta-item">
                        <strong>Kode:</strong>
                        <span>${book.kodeBarang}</span>
                    </div>
                    <div class="meta-item">
                        <strong>Jenis:</strong>
                        <span>${book.jenisBarang}</span>
                    </div>
                    <div class="meta-item">
                        <strong>Stok:</strong>
                        <span>${book.stok} buku</span>
                    </div>
                </div>
                <div class="book-price">${book.harga}</div>
                <div class="book-actions">
                    <button class="btn-cart" onclick="addToCart(${index})">
                        🛒 Keranjang
                    </button>
                    <button class="btn-detail" onclick="showBookDetail(${index})">
                        📖 Detail
                    </button>
                </div>
            </div>
        `;
        return bookCard;
    }
    
    function handleLogout() {
        localStorage.removeItem('currentUser');
        showNotification('Logout berhasil!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
    
    function showCartModal() {
        displayCartItems();
        cartModal.style.display = 'block';
    }
    
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart'));
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        document.getElementById('cart-count').textContent = cartCount;
    }
});

// PERBAIKAN: Fungsi untuk mendapatkan data buku
function getBooksData() {
    // Coba beberapa sumber data yang mungkin
    if (typeof dataKatalogBuku !== 'undefined' && dataKatalogBuku.length > 0) {
        return dataKatalogBuku;
    } else if (typeof books !== 'undefined' && books.length > 0) {
        return books;
    } else if (typeof window.booksData !== 'undefined' && window.booksData.length > 0) {
        return window.booksData;
    } else {
        // Fallback data jika tidak ada data yang tersedia
        return [
            {
                kodeBarang: "ASP4301",
                namaBarang: "Pengantar Ilmu Komunikasi",
                jenisBarang: "Buku Ajar",
                edisi: "2",
                stok: 548,
                harga: "Rp 180.000",
                cover: "https://via.placeholder.com/200x250/fce4ec/e91e63?text=Buku+Komunikasi"
            },
            {
                kodeBarang: "EKMA4002",
                namaBarang: "Manajemen Keuangan",
                jenisBarang: "Buku Ajar", 
                edisi: "1",
                stok: 392,
                harga: "Rp 220.000",
                cover: "https://via.placeholder.com/200x250/fce4ec/e91e63?text=Manajemen+Keuangan"
            },
            {
                kodeBarang: "EKMA4310",
                namaBarang: "Kepemimpinan",
                jenisBarang: "Buku Ajar",
                edisi: "1",
                stok: 278,
                harga: "Rp 150.000",
                cover: "https://via.placeholder.com/200x250/fce4ec/e91e63?text=Kepemimpinan"
            }
        ];
    }
}

// Global functions for book actions
function addToCart(bookIndex) {
    const books = getBooksData();
    const book = books[bookIndex];
    
    if (!book) {
        showNotification('Buku tidak ditemukan!', 'error');
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cart'));
    
    // Check if book already in cart
    const existingItem = cart.find(item => item.kodeBarang === book.kodeBarang);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...book,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`"${book.namaBarang}" ditambahkan ke keranjang!`);
    
    // Tampilkan modal keranjang otomatis
    setTimeout(() => {
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            cartModal.style.display = 'block';
            displayCartItems();
        }
    }, 500);
}

function showBookDetail(bookIndex) {
    const books = getBooksData();
    const book = books[bookIndex];
    
    if (!book) {
        showNotification('Detail buku tidak ditemukan!', 'error');
        return;
    }
    
    const detailHtml = `
        <div class="book-detail-content">
            <div class="detail-cover-container" onclick="showFullScreenImage('${book.cover}')">
                <img src="${book.cover}" alt="${book.namaBarang}" class="detail-cover"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDIwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNFQ0VGIi8+CjxwYXRoIGQ9Ik03NSA3NUgxMjVWMTI1SDc1Vjc1WiIgZmlsbD0iI0U5MUU2MyIvPgo8dGV4dCB4PSIxMDAiIHk9IjE3MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0U5MUU2MyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5Cb29rIENvdmVyPC90ZXh0Pgo8L3N2Zz4K'">
                <div class="zoom-indicator">Klik untuk zoom</div>
            </div>
            <div class="book-detail-info">
                <h2>${book.namaBarang}</h2>
                <div class="book-detail-meta">
                    <div class="detail-meta-item">
                        <strong>Kode Barang:</strong>
                        <span>${book.kodeBarang}</span>
                    </div>
                    <div class="detail-meta-item">
                        <strong>Jenis:</strong>
                        <span>${book.jenisBarang}</span>
                    </div>
                    <div class="detail-meta-item">
                        <strong>Edisi:</strong>
                        <span>${book.edisi || '1'}</span>
                    </div>
                    <div class="detail-meta-item">
                        <strong>Stok:</strong>
                        <span>${book.stok} buku tersedia</span>
                    </div>
                </div>
                <div class="book-price-large">${book.harga}</div>
                <button class="btn-checkout" onclick="addToCart(${bookIndex}); closeModal()" style="width: 100%; margin-top: 20px;">
                    Tambah ke Keranjang
                </button>
            </div>
        </div>
    `;
    
    const detailContent = document.getElementById('book-detail-content');
    if (detailContent) {
        detailContent.innerHTML = detailHtml;
        document.getElementById('book-detail-modal').style.display = 'block';
    }
}

function filterByCategory(category) {
    const books = getBooksData();
    const filteredBooks = books.filter(book => book.jenisBarang === category);
    
    const featuredBooksContainer = document.getElementById('featured-books');
    if (featuredBooksContainer) {
        featuredBooksContainer.innerHTML = '';
        
        if (filteredBooks.length === 0) {
            featuredBooksContainer.innerHTML = `
                <div class="no-books" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <p style="color: var(--text-light); font-style: italic;">Tidak ada buku dalam kategori ${category}</p>
                </div>
            `;
        } else {
            filteredBooks.forEach((book, index) => {
                const bookCard = createBookCard(book, index);
                featuredBooksContainer.appendChild(bookCard);
            });
        }
    }
    
    showNotification(`Menampilkan buku kategori: ${category}`);
}

function showAllBooks() {
    const books = getBooksData();
    const featuredBooksContainer = document.getElementById('featured-books');
    
    if (featuredBooksContainer) {
        featuredBooksContainer.innerHTML = '';
        books.forEach((book, index) => {
            const bookCard = createBookCard(book, index);
            featuredBooksContainer.appendChild(bookCard);
        });
    }
    
    showNotification('Menampilkan semua buku');
}

function searchBooks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const books = getBooksData();
    
    if (!searchTerm) {
        showAllBooks();
        return;
    }
    
    const filteredBooks = books.filter(book => 
        book.namaBarang.toLowerCase().includes(searchTerm) ||
        book.kodeBarang.toLowerCase().includes(searchTerm) ||
        book.jenisBarang.toLowerCase().includes(searchTerm)
    );
    
    const featuredBooksContainer = document.getElementById('featured-books');
    if (featuredBooksContainer) {
        featuredBooksContainer.innerHTML = '';
        
        if (filteredBooks.length === 0) {
            featuredBooksContainer.innerHTML = `
                <div class="no-books" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <p style="color: var(--text-light); font-style: italic;">Tidak ada hasil untuk "${searchTerm}"</p>
                </div>
            `;
        } else {
            filteredBooks.forEach((book, index) => {
                const bookCard = createBookCard(book, index);
                featuredBooksContainer.appendChild(bookCard);
            });
        }
    }
    
    showNotification(`Menampilkan hasil pencarian: "${searchTerm}"`);
}

function displayCartItems() {
    const cartItems = document.getElementById('cart-items');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    const cart = JSON.parse(localStorage.getItem('cart'));
    
    if (!cartItems) return;
    
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="no-items">Keranjang belanja kosong</p>';
        if (cartTotalAmount) cartTotalAmount.textContent = '0';
        return;
    }
    
    let total = 0;
    
    cart.forEach((item, index) => {
        const price = parseInt(item.harga.replace(/[^\d]/g, ''));
        const itemTotal = price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-cover">
                    ${item.namaBarang.charAt(0)}
                </div>
                <div class="cart-item-details">
                    <h4>${item.namaBarang}</h4>
                    <div class="cart-item-meta">
                        <span class="meta-badge">${item.kodeBarang}</span>
                        <span class="meta-badge">${item.jenisBarang}</span>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="updateCartQuantity(${index}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateCartQuantity(${index}, 1)">+</button>
                        </div>
                        <span class="cart-item-price">Rp ${itemTotal.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${index})">Hapus</button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    if (cartTotalAmount) {
        cartTotalAmount.textContent = total.toLocaleString();
    }
}

function updateCartQuantity(index, change) {
    const cart = JSON.parse(localStorage.getItem('cart'));
    
    if (cart[index]) {
        cart[index].quantity += change;
        
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        updateCartCount();
    }
}

function removeFromCart(index) {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const removedItem = cart[index];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    displayCartItems();
    updateCartCount();
    showNotification(`"${removedItem.namaBarang}" dihapus dari keranjang`);
}

function goToCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    
    if (cart.length === 0) {
        showNotification('Keranjang belanja kosong!', 'error');
        return;
    }
    
    // Save cart to localStorage for checkout page
    localStorage.setItem('checkoutCart', JSON.stringify(cart));
    window.location.href = 'checkout.html';
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        
        // Add animation
        cartCountElement.classList.add('cart-count-animate');
        setTimeout(() => {
            cartCountElement.classList.remove('cart-count-animate');
        }, 600);
    }
}

// ===== FUNGSI UNTUK ZOOM GAMBAR FULL SCREEN =====
function showFullScreenImage(imageSrc) {
    const fullscreenContainer = document.getElementById('fullscreen-image-container');
    const fullscreenImage = document.getElementById('fullscreen-image');
    
    if (fullscreenContainer && fullscreenImage) {
        fullscreenImage.src = imageSrc;
        fullscreenContainer.classList.add('active');
        
        // Prevent body scroll ketika fullscreen image aktif
        document.body.style.overflow = 'hidden';
    }
}

function closeFullScreenImage() {
    const fullscreenContainer = document.getElementById('fullscreen-image-container');
    
    if (fullscreenContainer) {
        fullscreenContainer.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
}

// Event listener untuk klik di luar gambar untuk menutup
document.addEventListener('DOMContentLoaded', function() {
    const fullscreenContainer = document.getElementById('fullscreen-image-container');
    
    if (fullscreenContainer) {
        fullscreenContainer.addEventListener('click', function(e) {
            if (e.target === fullscreenContainer) {
                closeFullScreenImage();
            }
        });
    }
    
    // Event listener untuk ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeFullScreenImage();
        }
    });
});

// Global notification function
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';
    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-text">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 3000);
}

// Pastikan fungsi createBookCard tersedia secara global
function createBookCard(book, index) {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card pink-card';
    bookCard.innerHTML = `
        <div class="book-cover-container" onclick="showFullScreenImage('${book.cover}')">
            <img src="${book.cover}" alt="${book.namaBarang}" class="book-cover" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDIwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNFQ0VGIi8+CjxwYXRoIGQ9Ik03NSA3NUgxMjVWMTI1SDc1Vjc1WiIgZmlsbD0iI0U5MUU2MyIvPgo8dGV4dCB4PSIxMDAiIHk9IjE3MCIgdGV4dC1hbmNob3I9Im1pZDBsZSIgZmlsbD0iI0U5MUU2MyIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5Cb29rIENvdmVyPC90ZXh0Pgo8L3N2Zz4K'">
        </div>
        <div class="book-info">
            <h3 class="book-title">${book.namaBarang}</h3>
            <div class="book-meta">
                <div class="meta-item">
                    <strong>Kode:</strong>
                    <span>${book.kodeBarang}</span>
                </div>
                <div class="meta-item">
                    <strong>Jenis:</strong>
                    <span>${book.jenisBarang}</span>
                </div>
                <div class="meta-item">
                    <strong>Stok:</strong>
                    <span>${book.stok} buku</span>
                </div>
            </div>
            <div class="book-price">${book.harga}</div>
            <div class="book-actions">
                <button class="btn-cart" onclick="addToCart(${index})">
                    🛒 Keranjang
                </button>
                <button class="btn-detail" onclick="showBookDetail(${index})">
                    📖 Detail
                </button>
            </div>
        </div>
    `;
    return bookCard;
}