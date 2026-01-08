// Harga per produk
const PRODUCT_PRICES = {
    'nasi-daun-jeruk': 7000,
    'ayam-ketumbar': 9000,
    'paket-lengkap': 13000
};

// Default price untuk paket lengkap
let PRICE_PER_PORTION = 13000;

// Cek produk yang dipilih saat halaman load
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    
    if (productId && PRODUCT_PRICES[productId]) {
        PRICE_PER_PORTION = PRODUCT_PRICES[productId];
        console.log(`Selected product: ${productId}, Price: ${PRICE_PER_PORTION}`);
    }
    
    updateTotalPrice();
});

function updateTotalPrice() {
    const quantityInput = document.getElementById('quantity');
    const totalElement = document.getElementById('totalPrice');
    
    if (quantityInput && totalElement) {
        const quantity = parseInt(quantityInput.value) || 1;
        const total = quantity * PRICE_PER_PORTION;
        totalElement.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    }
}

// Event listener untuk quantity change
const quantityInput = document.getElementById('quantity');
if (quantityInput) {
    quantityInput.addEventListener('input', updateTotalPrice);
}   

// Sisanya tetap sama seperti kode asli Anda...

// Function untuk menampilkan modal sukses
function showSuccessModal() {
    // Hapus modal yang ada jika ada
    const existingModal = document.querySelector('.success-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Buat modal baru
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="success-icon">✅</div>
            <h3>Pesanan Berhasil!</h3>
            <p>Terima kasih! Pesanan Anda telah berhasil dipesan dan akan segera diproses oleh admin.</p>
            <button onclick="closeSuccessModal()" class="ok-btn">OK</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Function untuk menutup modal sukses
function closeSuccessModal() {
    const modal = document.querySelector('.success-modal');
    if (modal) {
        modal.remove();
    }
    // Redirect ke halaman utama setelah modal ditutup
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

// Function untuk menampilkan loading state
function showLoading(show = true) {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        if (show) {
            submitBtn.textContent = 'Memproses...';
            submitBtn.disabled = true;
        } else {
            submitBtn.textContent = 'Pesan Sekarang';
            submitBtn.disabled = false;
        }
    }
}

// Form submission
const orderForm = document.getElementById('orderForm');
if (orderForm) {
    orderForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Form submitted');
        
        if (!this.checkValidity()) {
            e.stopPropagation();
            this.classList.add('was-validated');
            return;
        }
        
        // Show loading state
        showLoading(true);
        
        const formData = new FormData(this);
        const orderData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            quantity: parseInt(formData.get('quantity')),
            paymentMethod: formData.get('payment_method'),
            total: parseInt(formData.get('quantity')) * PRICE_PER_PORTION,
            status: 'pending',
            timestamp: new Date().toISOString(),
            createdAt: new Date().toLocaleDateString('id-ID'),
            orderId: 'ORD-' + Date.now() // Generate simple order ID
        };
        
        console.log('Order data:', orderData);
        
        try {
            // Save to Firebase
            const docRef = await db.collection('orders').add(orderData);
            console.log('Saved to Firebase successfully with ID:', docRef.id);
            
            // Hide loading state
            showLoading(false);
            
            // Reset form
            this.reset();
            this.classList.remove('was-validated');
            
            // Reset total price display
            document.getElementById('totalPrice').textContent = `Rp ${PRICE_PER_PORTION.toLocaleString('id-ID')}`;
            
            // Show success modal instead of WhatsApp redirect
            showSuccessModal();
            
        } catch (error) {
            console.error('Error saving to Firebase:', error);
            
            // Hide loading state
            showLoading(false);
            
            // Show error message
            alert('Terjadi kesalahan saat menyimpan pesanan: ' + error.message);
        }
    });
}

// Add CSS for modal if not already exists
if (!document.querySelector('#success-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'success-modal-styles';
    style.textContent = `
        .success-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease-in-out;
        }

        .modal-content {
            background: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease-in-out;
        }

        .success-icon {
            font-size: 60px;
            margin-bottom: 20px;
        }

        .modal-content h3 {
            color: #2e7d32;
            margin-bottom: 15px;
            font-size: 24px;
        }

        .modal-content p {
            color: #666;
            margin-bottom: 25px;
            line-height: 1.5;
        }

        .ok-btn {
            background: #4caf50;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: background 0.3s ease;
        }

        .ok-btn:hover {
            background: #45a049;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideUp {
            from { 
                opacity: 0;
                transform: translateY(30px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}