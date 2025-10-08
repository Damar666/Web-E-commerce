// Cek apakah kita di halaman admin
const ordersTable = document.getElementById('ordersTable');

// Hanya jalankan jika di halaman admin
if (ordersTable) {
    // Check if admin is logged in
    if (!localStorage.getItem('adminLoggedIn')) {
        window.location.href = 'admin-login.html';
    }

    // Variable untuk menyimpan listener
    let ordersListener = null;

    // Load orders from Firebase dengan real-time listener
    function loadOrders() {
        try {
            console.log('Setting up real-time orders listener...');
            
            // Jika sudah ada listener sebelumnya, unsubscribe dulu
            if (ordersListener) {
                ordersListener();
            }
            
            // Setup real-time listener
            ordersListener = db.collection('orders')
                .orderBy('timestamp', 'desc') // Urutkan berdasarkan waktu, terbaru dulu
                .onSnapshot((querySnapshot) => {
                    console.log('Orders updated, reloading...');
                    
                    ordersTable.innerHTML = '';
                    
                    let totalOrders = 0;
                    let pendingOrders = 0;
                    let completedOrders = 0;
                    let totalRevenue = 0;
                    
                    // Get today's date for filtering today's orders
                    const today = new Date().toLocaleDateString('id-ID');
                    let todayOrders = 0;
                    
                    querySnapshot.forEach((doc) => {
                        const order = doc.data();
                        const orderId = doc.id;
                        
                        console.log('Order found:', order);
                        
                        // Parse timestamp
                        let orderDate;
                        if (order.timestamp) {
                            if (typeof order.timestamp === 'string') {
                                orderDate = new Date(order.timestamp);
                            } else if (order.timestamp.toDate) {
                                // Firebase Timestamp
                                orderDate = order.timestamp.toDate();
                            } else {
                                orderDate = new Date();
                            }
                        } else {
                            orderDate = new Date();
                        }
                        
                        // Check if order is from today
                        const orderDateString = orderDate.toLocaleDateString('id-ID');
                        if (orderDateString === today) {
                            todayOrders++;
                        }
                        
                        // Create table row
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${orderDate.toLocaleString('id-ID')}</td>
                            <td>${order.name || 'N/A'}</td>
                            <td>${order.phone || 'N/A'}</td>
                            <td>${order.totalItems || order.quantity || 0} porsi</td>
                             <td>Rp ${(order.grandTotal || order.total || 0).toLocaleString('id-ID')}</td>
                            <td><span class="badge bg-${getPaymentMethodColor(order.paymentMethod)}">${formatPaymentMethod(order.paymentMethod)}</span></td>
                            <td><span class="badge bg-${getStatusColor(order.status)}">${formatStatus(order.status)}</span></td>
                            <td>
                                <select class="form-select form-select-sm" onchange="updateOrderStatus('${orderId}', this.value)" ${order.status === 'completed' ? 'disabled' : ''}>
                                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Sedang Diproses</option>
                                    <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Siap</option>
                                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Selesai</option>
                                </select>
                            </td>
                        `;
                        ordersTable.appendChild(row);
                        
                        // Update statistics
                        totalOrders++;
                        if (order.status === 'pending' || order.status === 'preparing' || order.status === 'ready') {
                            pendingOrders++;
                        } else if (order.status === 'completed') {
                            completedOrders++;
                            totalRevenue += (order.total || 0);
                        }
                    });
                    
                    // Update dashboard numbers
                    document.getElementById('totalOrders').textContent = todayOrders;
                    document.getElementById('pendingOrders').textContent = pendingOrders;
                    document.getElementById('completedOrders').textContent = completedOrders;
                    document.getElementById('totalRevenue').textContent = `Rp ${totalRevenue.toLocaleString('id-ID')}`;
                    
                    // Show message if no orders
                    if (totalOrders === 0) {
                        ordersTable.innerHTML = `
                            <tr>
                                <td colspan="8" class="text-center text-muted">
                                    <i>Belum ada pesanan</i>
                                </td>
                            </tr>
                        `;
                    }
                    
                }, (error) => {
                    console.error('Error in real-time listener:', error);
                    // Fallback to regular get() if real-time fails
                    loadOrdersStatic();
                });
                
        } catch (error) {
            console.error('Error setting up real-time listener:', error);
            // Fallback to static loading
            loadOrdersStatic();
        }
    }

    // Fallback function for static loading
    async function loadOrdersStatic() {
        try {
            console.log('Loading orders statically from Firebase...');
            const querySnapshot = await db.collection('orders')
                .orderBy('timestamp', 'desc')
                .get();
            
            ordersTable.innerHTML = '';
            
            let totalOrders = 0;
            let pendingOrders = 0;
            let completedOrders = 0;
            let totalRevenue = 0;
            
            const today = new Date().toLocaleDateString('id-ID');
            let todayOrders = 0;
            
            querySnapshot.forEach((doc) => {
                const order = doc.data();
                const orderId = doc.id;
                
                let orderDate = new Date(order.timestamp || Date.now());
                
                if (orderDate.toLocaleDateString('id-ID') === today) {
                    todayOrders++;
                }
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${orderDate.toLocaleString('id-ID')}</td>
                    <td>${order.name || 'N/A'}</td>
                    <td>${order.phone || 'N/A'}</td>
                    <td>${order.quantity || 0} porsi</td>
                    <td>Rp ${(order.total || 0).toLocaleString('id-ID')}</td>
                    <td><span class="badge bg-${getPaymentMethodColor(order.paymentMethod)}">${formatPaymentMethod(order.paymentMethod)}</span></td>
                    <td><span class="badge bg-${getStatusColor(order.status)}">${formatStatus(order.status)}</span></td>
                    <td>
                        <select class="form-select form-select-sm" onchange="updateOrderStatus('${orderId}', this.value)">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Sedang Diproses</option>
                            <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Siap</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Selesai</option>
                        </select>
                    </td>
                `;
                ordersTable.appendChild(row);
                
                totalOrders++;
                if (order.status === 'pending' || order.status === 'preparing' || order.status === 'ready') {
                    pendingOrders++;
                } else if (order.status === 'completed') {
                    completedOrders++;
                    totalRevenue += (order.total || 0);
                }
            });
            
            document.getElementById('totalOrders').textContent = todayOrders;
            document.getElementById('pendingOrders').textContent = pendingOrders;
            document.getElementById('completedOrders').textContent = completedOrders;
            document.getElementById('totalRevenue').textContent = `Rp ${totalRevenue.toLocaleString('id-ID')}`;
            
        } catch (error) {
            console.error('Error loading orders statically:', error);
        }
    }

    // Helper functions for formatting
    function getStatusColor(status) {
        switch(status) {
            case 'pending': return 'warning';
            case 'preparing': return 'info';
            case 'ready': return 'primary';
            case 'completed': return 'success';
            default: return 'secondary';
        }
    }

    function formatStatus(status) {
        switch(status) {
            case 'pending': return 'Menunggu';
            case 'preparing': return 'Diproses';
            case 'ready': return 'Siap';
            case 'completed': return 'Selesai';
            default: return 'Unknown';
        }
    }

    function getPaymentMethodColor(method) {
        if (!method) return 'secondary';
        switch(method.toLowerCase()) {
            case 'cod': return 'warning';
            case 'transfer': return 'info';
            case 'ewallet': return 'success';
            default: return 'secondary';
        }
    }

    function formatPaymentMethod(method) {
        if (!method) return 'N/A';
        switch(method.toLowerCase()) {
            case 'cod': return 'COD';
            case 'transfer': return 'Transfer';
            case 'ewallet': return 'E-Wallet';
            default: return method.toUpperCase();
        }
    }

    // Update order status function
    window.updateOrderStatus = async function(orderId, newStatus) {
        try {
            console.log(`Updating order ${orderId} to status: ${newStatus}`);
            
            await db.collection('orders').doc(orderId).update({
                status: newStatus,
                updatedAt: new Date().toISOString()
            });
            
            console.log('Order status updated successfully');
            
            // Show success message
            showNotification(`Status pesanan berhasil diubah menjadi: ${formatStatus(newStatus)}`, 'success');
            
        } catch (error) {
            console.error('Error updating order:', error);
            showNotification('Gagal mengubah status pesanan: ' + error.message, 'error');
        }
    }

    // Notification function
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotif = document.querySelector('.admin-notification');
        if (existingNotif) {
            existingNotif.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `admin-notification alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; max-width: 300px;';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    // Load orders on page load
    loadOrders();

    // Cleanup listener when leaving page
    window.addEventListener('beforeunload', () => {
        if (ordersListener) {
            ordersListener();
        }
    });
}

// Logout function - pastikan tersedia di global scope
function logout() {
    try {
        console.log('Logout function called');
        
        // Cleanup listener before logout
        if (typeof ordersListener === 'function') {
            ordersListener();
        }
        
        // Remove admin session
        localStorage.removeItem('adminLoggedIn');
        
        // Redirect to login page
        window.location.href = 'admin-login.html';
        
    } catch (error) {
        console.error('Error during logout:', error);
        // Force redirect even if there's an error
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'admin-login.html';
    }
}

// Make sure logout is available globally
window.logout = logout;