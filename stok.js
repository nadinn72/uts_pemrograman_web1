// stok.js - Stock management functionality
document.addEventListener('DOMContentLoaded', function() {
    const booksTableBody = document.getElementById('booksTableBody');
    const addBookBtn = document.getElementById('addBookBtn');
    const addBookModal = document.getElementById('addBookModal');
    const addBookForm = document.getElementById('addBookForm');
    const closeButtons = document.querySelectorAll('.close');
    const totalBooksElement = document.getElementById('total-books');
    const totalStockElement = document.getElementById('total-stock');
    
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Display books in table
    function displayBooks() {
        booksTableBody.innerHTML = '';
        
        let totalBooks = 0;
        let totalStock = 0;
        
        dataKatalogBuku.forEach((book, index) => {
            totalBooks++;
            totalStock += book.stok;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${book.cover}" alt="${book.namaBarang}" class="book-cover-small"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNzAiIHZpZXdCb3g9IjAgMCA1MCA3MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjRjNFQ0VGIi8+CjxwYXRoIGQ9Ik0xOCAyOEgzMlY0MkgxOFYyOFoiIGZpbGw9IiNFOTFFNjMiLz4KPHRleHQgeD0iMjUiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTkyN0IwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCI+Qm9vazwvdGV4dD4KPC9zdmc+'">
                </td>
                <td>
                    <strong>${book.namaBarang}</strong>
                </td>
                <td>${book.kodeBarang}</td>
                <td>${book.jenisBarang}</td>
                <td>${book.edisi}</td>
                <td>${book.stok}</td>
                <td>${book.harga}</td>
                <td>
                    <button class="btn-secondary" onclick="editBook(${index})">Edit</button>
                </td>
            `;
            booksTableBody.appendChild(row);
        });
        
        // Update statistics
        totalBooksElement.textContent = totalBooks;
        totalStockElement.textContent = totalStock.toLocaleString();
    }
    
    // Show add book modal
    addBookBtn.addEventListener('click', function() {
        addBookModal.style.display = 'block';
    });
    
    // Handle add book form submission
    addBookForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newBook = {
            kodeBarang: document.getElementById('newKodeBarang').value,
            namaBarang: document.getElementById('newNamaBarang').value,
            jenisBarang: document.getElementById('newJenisBarang').value,
            edisi: document.getElementById('newEdisi').value,
            stok: parseInt(document.getElementById('newStok').value),
            harga: document.getElementById('newHarga').value,
            cover: document.getElementById('newCover').value
        };
        
        // Add to data array
        dataKatalogBuku.push(newBook);
        
        // Update display
        displayBooks();
        
        // Close modal and reset form
        addBookModal.style.display = 'none';
        addBookForm.reset();
        
        showNotification('Buku berhasil ditambahkan!');
    });
    
    // Close modal
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            addBookModal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === addBookModal) {
            addBookModal.style.display = 'none';
        }
    });
    
    // Initial display
    displayBooks();
});

// Global function for editing books
function editBook(index) {
    const book = dataKatalogBuku[index];
    
    const editHtml = `
        <div class="book-edit-modal">
            <h3>Edit Buku: ${book.namaBarang}</h3>
            <form onsubmit="updateBook(${index}); return false;">
                <div class="form-row">
                    <div class="input-group">
                        <label>Stok</label>
                        <input type="number" id="edit-stock-${index}" value="${book.stok}" required>
                    </div>
                    <div class="input-group">
                        <label>Harga</label>
                        <input type="text" id="edit-price-${index}" value="${book.harga}" required>
                    </div>
                </div>
                <button type="submit" class="btn-primary">Update Buku</button>
            </form>
        </div>
    `;
    
    showCustomModal('Edit Buku', editHtml);
}

function updateBook(index) {
    const newStock = parseInt(document.getElementById(`edit-stock-${index}`).value);
    const newPrice = document.getElementById(`edit-price-${index}`).value;
    
    dataKatalogBuku[index].stok = newStock;
    dataKatalogBuku[index].harga = newPrice;
    
    // Refresh the table
    document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    location.reload(); // Simple refresh to update the table
    
    showNotification('Buku berhasil diperbarui!');
}