document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario está autenticado con Firebase
    firebase.auth().onAuthStateChanged(function(firebaseUser) {
        if (!firebaseUser) {
            // No autenticado, redirigir al login
            window.location.href = 'index.html';
            return;
        }
        
        // Usuario autenticado, obtener datos adicionales
        const user = JSON.parse(localStorage.getItem('cashtrack_user') || '{}');
        
        // Mostrar información del usuario
        document.getElementById('user-name').textContent = user.name || firebaseUser.email;
        document.getElementById('user-role').textContent = user.role || 'Usuario';
        
        // Cargar datos del usuario desde Firebase
        loadUserData(firebaseUser.uid);
    });
    
    // Función para cargar datos del usuario desde Firebase
    function loadUserData(userId) {
        // Referencia a los datos del usuario en Firebase
        const userRef = firebase.database().ref('users/' + userId);
        
        // Cargar datos iniciales
        loadInitialCash(userId);
        loadSales(userId);
        loadExpenses(userId);
        loadAdjustments(userId);
        loadCustomers(userId);
        loadInventory(userId);
        updateDashboardSummary(userId);
    }
    
    // Funciones para cargar datos desde Firebase
    function loadInitialCash(userId) {
        const initialCashRef = firebase.database().ref('users/' + userId + '/initialCash');
        initialCashRef.on('value', (snapshot) => {
            const data = snapshot.val() || {};
            const initialCashAmount = data.amount || 0;
            document.getElementById('initial-cash-amount').value = initialCashAmount;
            updateCashSummary();
        });
    }
    
    function loadSales(userId) {
        const salesRef = firebase.database().ref('users/' + userId + '/sales');
        salesRef.on('value', (snapshot) => {
            const salesData = snapshot.val() || {};
            const salesTable = document.getElementById('sales-table-body');
            salesTable.innerHTML = '';
            
            let totalSales = 0;
            
            Object.keys(salesData).forEach(key => {
                const sale = salesData[key];
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${sale.date}</td>
                    <td>${sale.customer?.name || 'Cliente General'}</td>
                    <td>${sale.items ? Object.keys(sale.items).length + ' productos' : sale.description || 'Venta'}</td>
                    <td class="text-end">${formatCurrency(sale.total || sale.amount)}</td>
                    <td>
                        <span class="badge ${sale.status === 'completed' ? 'bg-success' : sale.status === 'pending' ? 'bg-warning' : 'bg-danger'}">
                            ${sale.status === 'completed' ? 'Completada' : sale.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary print-invoice" data-id="${key}" title="Imprimir">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info view-sale" data-id="${key}" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-sale" data-id="${key}" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                salesTable.appendChild(row);
                if (sale.status === 'completed') {
                    totalSales += parseFloat(sale.total || sale.amount || 0);
                }
            });
            
            document.getElementById('total-sales').textContent = formatCurrency(totalSales);
            updateCashSummary();
        });
    }
    
    function loadExpenses(userId) {
        const expensesRef = firebase.database().ref('users/' + userId + '/expenses');
        expensesRef.on('value', (snapshot) => {
            const expensesData = snapshot.val() || {};
            const expensesTable = document.getElementById('expenses-table-body');
            expensesTable.innerHTML = '';
            
            let totalExpenses = 0;
            
            Object.keys(expensesData).forEach(key => {
                const expense = expensesData[key];
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${expense.date}</td>
                    <td>
                        <span class="badge bg-secondary">${expense.category || 'General'}</span>
                    </td>
                    <td>${expense.description}</td>
                    <td>${expense.vendor || 'N/A'}</td>
                    <td>
                        <span class="badge ${expense.paymentMethod === 'cash' ? 'bg-success' : expense.paymentMethod === 'card' ? 'bg-primary' : 'bg-info'}">
                            ${expense.paymentMethod === 'cash' ? 'Efectivo' : expense.paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'}
                        </span>
                    </td>
                    <td class="text-end">${formatCurrency(expense.amount)}</td>
                    <td>
                        ${expense.receipt ? '<button class="btn btn-sm btn-outline-info view-receipt" data-receipt="' + expense.receipt + '" title="Ver recibo"><i class="fas fa-receipt"></i></button>' : ''}
                        <button class="btn btn-sm btn-outline-secondary edit-expense" data-id="${key}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-expense" data-id="${key}" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                expensesTable.appendChild(row);
                totalExpenses += parseFloat(expense.amount);
            });
            
            document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);
            updateCashSummary();
        });
    }
    
    function loadAdjustments(userId) {
        const adjustmentsRef = firebase.database().ref('users/' + userId + '/adjustments');
        adjustmentsRef.on('value', (snapshot) => {
            const adjustmentsData = snapshot.val() || {};
            const adjustmentsTable = document.getElementById('adjustments-table-body');
            adjustmentsTable.innerHTML = '';
            
            let totalAdjustments = 0;
            
            Object.keys(adjustmentsData).forEach(key => {
                const adjustment = adjustmentsData[key];
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${adjustment.date}</td>
                    <td>${adjustment.type}</td>
                    <td>${adjustment.description}</td>
                    <td class="text-end">${formatCurrency(adjustment.amount)}</td>
                    <td>
                        <button class="btn btn-sm btn-danger delete-adjustment" data-id="${key}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                adjustmentsTable.appendChild(row);
                totalAdjustments += parseFloat(adjustment.amount);
            });
            
            document.getElementById('total-adjustments').textContent = formatCurrency(totalAdjustments);
            updateCashSummary();
        });
    }
    
    // Actualizar caja final
    function updateCashSummary() {
        const initialCash = parseFloat(document.getElementById('initial-cash-amount').value) || 0;
        const totalSales = parseFloat(document.getElementById('total-sales').textContent.replace(/[^\d.-]/g, '')) || 0;
        const totalExpenses = parseFloat(document.getElementById('total-expenses').textContent.replace(/[^\d.-]/g, '')) || 0;
        const totalAdjustments = parseFloat(document.getElementById('total-adjustments').textContent.replace(/[^\d.-]/g, '')) || 0;
        
        const finalCash = initialCash + totalSales + totalAdjustments - totalExpenses;
        document.getElementById('final-cash').textContent = formatCurrency(finalCash);
        
        // Actualizar gráficos
        updateCharts(initialCash, totalSales, totalExpenses, totalAdjustments);
    }
    
    // Funciones para guardar datos en Firebase
    function saveInitialCash() {
        const userId = firebase.auth().currentUser.uid;
        const amount = parseFloat(document.getElementById('initial-cash-amount').value) || 0;
        const date = new Date().toISOString().split('T')[0];
        
        firebase.database().ref('users/' + userId + '/initialCash').set({
            amount: amount,
            date: date,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            showAlert('Caja inicial guardada correctamente', 'success');
            updateCashSummary();
        }).catch(error => {
            console.error('Error al guardar caja inicial:', error);
            showAlert('Error al guardar caja inicial', 'danger');
        });
    }
    
    function saveSale() {
        const userId = firebase.auth().currentUser.uid;
        const saleForm = document.getElementById('sale-form');
        
        const customer = document.getElementById('sale-customer').value;
        const description = document.getElementById('sale-description').value;
        const amount = parseFloat(document.getElementById('sale-amount').value) || 0;
        const date = document.getElementById('sale-date').value || new Date().toISOString().split('T')[0];
        
        if (!customer || !description || amount <= 0) {
            showAlert('Por favor complete todos los campos correctamente', 'warning');
            return;
        }
        
        const newSaleRef = firebase.database().ref('users/' + userId + '/sales').push();
        
        newSaleRef.set({
            customer: customer,
            description: description,
            amount: amount,
            date: date,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            showAlert('Venta registrada correctamente', 'success');
            saleForm.reset();
            $('#saleModal').modal('hide');
        }).catch(error => {
            console.error('Error al guardar venta:', error);
            showAlert('Error al guardar venta', 'danger');
        });
    }
    
    function saveExpense() {
        const userId = firebase.auth().currentUser.uid;
        const expenseForm = document.getElementById('expense-form');
        
        const category = document.getElementById('expense-category').value;
        const description = document.getElementById('expense-description').value;
        const amount = parseFloat(document.getElementById('expense-amount').value) || 0;
        const date = document.getElementById('expense-date').value || new Date().toISOString().split('T')[0];
        
        if (!category || !description || amount <= 0) {
            showAlert('Por favor complete todos los campos correctamente', 'warning');
            return;
        }
        
        const newExpenseRef = firebase.database().ref('users/' + userId + '/expenses').push();
        
        newExpenseRef.set({
            category: category,
            description: description,
            amount: amount,
            date: date,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            showAlert('Gasto registrado correctamente', 'success');
            expenseForm.reset();
            $('#expenseModal').modal('hide');
        }).catch(error => {
            console.error('Error al guardar gasto:', error);
            showAlert('Error al guardar gasto', 'danger');
        });
    }
    
    function saveAdjustment() {
        const userId = firebase.auth().currentUser.uid;
        const adjustmentForm = document.getElementById('adjustment-form');
        
        const type = document.getElementById('adjustment-type').value;
        const description = document.getElementById('adjustment-description').value;
        const amount = parseFloat(document.getElementById('adjustment-amount').value) || 0;
        const date = document.getElementById('adjustment-date').value || new Date().toISOString().split('T')[0];
        
        if (!type || !description || amount === 0) {
            showAlert('Por favor complete todos los campos correctamente', 'warning');
            return;
        }
        
        const newAdjustmentRef = firebase.database().ref('users/' + userId + '/adjustments').push();
        
        newAdjustmentRef.set({
            type: type,
            description: description,
            amount: amount,
            date: date,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
            showAlert('Ajuste registrado correctamente', 'success');
            adjustmentForm.reset();
            $('#adjustmentModal').modal('hide');
        }).catch(error => {
            console.error('Error al guardar ajuste:', error);
            showAlert('Error al guardar ajuste', 'danger');
        });
    }
    
    // Función para mostrar alertas
    function showAlert(message, type) {
        const alertContainer = document.getElementById('alert-container');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        alertContainer.appendChild(alert);
        
        // Auto-cerrar después de 3 segundos
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => {
                alertContainer.removeChild(alert);
            }, 150);
        }, 3000);
    }

    // Navegación entre módulos
    const navLinks = document.querySelectorAll('.nav-link[data-module]');
    const moduleContainers = document.querySelectorAll('.module-container');
    const currentModuleTitle = document.getElementById('current-module');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Actualizar navegación
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar módulo correspondiente
            const moduleId = this.getAttribute('data-module');
            moduleContainers.forEach(container => {
                container.classList.remove('active');
                if (container.id === moduleId + '-module') {
                    container.classList.add('active');
                }
            });
            
            // Actualizar título
            currentModuleTitle.textContent = this.querySelector('span').textContent;
            
            // Actualizar URL sin recargar la página
            history.pushState(null, null, this.getAttribute('href'));
        });
    });

    // Cerrar sesión
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        // Cerrar sesión en Firebase
        firebase.auth().signOut().then(() => {
            // Eliminar datos locales
            localStorage.clear();
            sessionStorage.clear();
            // Redirigir al login
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Error al cerrar sesión:', error);
        });
    });

    // Cerrar sesión desde el dropdown del perfil
    document.getElementById('logout-btn-top').addEventListener('click', function(e) {
        e.preventDefault();
        // Cerrar sesión en Firebase
        firebase.auth().signOut().then(() => {
            // Eliminar datos locales
            localStorage.clear();
            sessionStorage.clear();
            // Redirigir al login
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Error al cerrar sesión:', error);
        });
    });

    // Configuración de perfil
    document.getElementById('profile-config-btn').addEventListener('click', function(e) {
        e.preventDefault();
        loadUserProfile();
        const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));
        profileModal.show();
    });

    // Configuración de sistema
    document.getElementById('system-config-btn').addEventListener('click', function(e) {
        e.preventDefault();
        loadSystemConfig();
        const systemConfigModal = new bootstrap.Modal(document.getElementById('systemConfigModal'));
        systemConfigModal.show();
    });

    // Cambiar imagen de perfil
    document.getElementById('change-image-btn').addEventListener('click', function() {
        document.getElementById('profile-image').click();
    });

    // Preview de imagen de perfil
    document.getElementById('profile-image').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('profile-image-preview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Guardar perfil
    document.getElementById('save-profile-btn').addEventListener('click', function() {
        saveUserProfile();
    });

    // Guardar configuración de sistema
    document.getElementById('save-system-config-btn').addEventListener('click', function() {
        saveSystemConfig();
    });

    // Cambio de moneda
    const currencyToggles = document.querySelectorAll('input[name="currency"]');
    const currencySymbols = document.querySelectorAll('.currency-symbol');
    const amountElements = [
        document.getElementById('caja-inicial-amount'),
        document.getElementById('ventas-amount'),
        document.getElementById('gastos-amount'),
        document.getElementById('caja-final-amount')
    ];
    
    // Tipo de cambio: 1 USD = 550 CRC
    const exchangeRate = 550;
    
    // Valores en colones (moneda base)
    const amounts = {
        cajaInicial: 100000,
        ventas: 75000,
        gastos: 25000,
        cajaFinal: 150000
    };
    
    currencyToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const currency = this.value;
            
            if (currency === 'dollars') {
                // Cambiar a dólares
                currencySymbols.forEach(symbol => symbol.textContent = '$');
                
                // Actualizar montos
                amountElements[0].textContent = '$' + formatMoney(amounts.cajaInicial / exchangeRate);
                amountElements[1].textContent = '$' + formatMoney(amounts.ventas / exchangeRate);
                amountElements[2].textContent = '$' + formatMoney(amounts.gastos / exchangeRate);
                amountElements[3].textContent = '$' + formatMoney(amounts.cajaFinal / exchangeRate);
            } else {
                // Cambiar a colones
                currencySymbols.forEach(symbol => symbol.textContent = '₡');
                
                // Actualizar montos
                amountElements[0].textContent = '₡' + formatMoney(amounts.cajaInicial);
                amountElements[1].textContent = '₡' + formatMoney(amounts.ventas);
                amountElements[2].textContent = '₡' + formatMoney(amounts.gastos);
                amountElements[3].textContent = '₡' + formatMoney(amounts.cajaFinal);
            }
        });
    });

    // Inicializar gráficos
    initCharts();

    // Función para formatear montos
    function formatMoney(amount) {
        return amount.toLocaleString('es-CR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    }

    // Función para inicializar gráficos
    function initCharts() {
        // Gráfico de flujo de efectivo
        const cashFlowCtx = document.getElementById('cashFlowChart').getContext('2d');
        const cashFlowChart = new Chart(cashFlowCtx, {
            type: 'line',
            data: {
                labels: ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
                datasets: [{
                    label: 'Caja',
                    data: [100000, 120000, 135000, 125000, 140000, 150000],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                const currency = document.querySelector('input[name="currency"]:checked').value;
                                const symbol = currency === 'dollars' ? '$' : '₡';
                                const divisor = currency === 'dollars' ? exchangeRate : 1;
                                return symbol + (value / divisor).toLocaleString();
                            }
                        }
                    }
                }
            }
        });

        // Gráfico de distribución de gastos
        const expensesCtx = document.getElementById('expensesChart').getContext('2d');
        const expensesChart = new Chart(expensesCtx, {
            type: 'doughnut',
            data: {
                labels: ['Suministros', 'Servicios', 'Salarios', 'Otros'],
                datasets: [{
                    data: [15000, 5000, 3000, 2000],
                    backgroundColor: [
                        '#3498db',
                        '#2ecc71',
                        '#f39c12',
                        '#e74c3c'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const currency = document.querySelector('input[name="currency"]:checked').value;
                                const symbol = currency === 'dollars' ? '$' : '₡';
                                const divisor = currency === 'dollars' ? exchangeRate : 1;
                                const value = context.raw / divisor;
                                return context.label + ': ' + symbol + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });

        // Actualizar gráficos cuando cambia la moneda
        document.querySelectorAll('input[name="currency"]').forEach(toggle => {
            toggle.addEventListener('change', function() {
                cashFlowChart.update();
                expensesChart.update();
            });
        });
    }

    // Cálculo de caja final en tiempo real para el cierre diario
    const cierreCajaReal = document.getElementById('cierreCajaReal');
    const cierreDiferencia = document.getElementById('cierreDiferencia');
    
    if (cierreCajaReal && cierreDiferencia) {
        cierreCajaReal.addEventListener('input', function() {
            const cajaCalculada = 155000; // Valor predefinido para el ejemplo
            const cajaReal = parseFloat(this.value) || 0;
            const diferencia = cajaReal - cajaCalculada;
            
            cierreDiferencia.value = diferencia.toLocaleString('es-CR');
            
            // Cambiar color según la diferencia
            if (diferencia < 0) {
                cierreDiferencia.classList.add('text-danger');
                cierreDiferencia.classList.remove('text-success');
            } else if (diferencia > 0) {
                cierreDiferencia.classList.add('text-success');
                cierreDiferencia.classList.remove('text-danger');
            } else {
                cierreDiferencia.classList.remove('text-danger', 'text-success');
            }
        });
    }

    // Funciones para crear nuevas ventas
    function createSale(userId, saleData) {
        const salesRef = firebase.database().ref('users/' + userId + '/sales');
        const newSaleRef = salesRef.push();
        
        const sale = {
            id: newSaleRef.key,
            date: saleData.date || new Date().toISOString().split('T')[0],
            time: saleData.time || new Date().toTimeString().split(' ')[0],
            customer: saleData.customer || { name: 'Cliente General' },
            items: saleData.items || {},
            subtotal: saleData.subtotal || 0,
            tax: saleData.tax || 0,
            discount: saleData.discount || 0,
            total: saleData.total || 0,
            paymentMethod: saleData.paymentMethod || 'cash',
            status: 'completed',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        return newSaleRef.set(sale);
    }
    
    // Funciones para crear nuevos gastos
    function createExpense(userId, expenseData) {
        const expensesRef = firebase.database().ref('users/' + userId + '/expenses');
        const newExpenseRef = expensesRef.push();
        
        const expense = {
            id: newExpenseRef.key,
            date: expenseData.date || new Date().toISOString().split('T')[0],
            time: expenseData.time || new Date().toTimeString().split(' ')[0],
            category: expenseData.category || 'General',
            description: expenseData.description || '',
            amount: parseFloat(expenseData.amount) || 0,
            paymentMethod: expenseData.paymentMethod || 'cash',
            receipt: expenseData.receipt || '',
            vendor: expenseData.vendor || '',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        return newExpenseRef.set(expense);
    }
    
    // Funciones para crear/actualizar clientes
    function createCustomer(userId, customerData) {
        const customersRef = firebase.database().ref('users/' + userId + '/customers');
        const newCustomerRef = customersRef.push();
        
        const customer = {
            id: newCustomerRef.key,
            name: customerData.name || '',
            email: customerData.email || '',
            phone: customerData.phone || '',
            address: customerData.address || '',
            totalPurchases: 0,
            lastPurchase: '',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        return newCustomerRef.set(customer);
    }
    
    // Funciones para crear/actualizar productos de inventario
    function createProduct(userId, productData) {
        const inventoryRef = firebase.database().ref('users/' + userId + '/inventory');
        const newProductRef = inventoryRef.push();
        
        const product = {
            id: newProductRef.key,
            name: productData.name || '',
            description: productData.description || '',
            category: productData.category || '',
            sku: productData.sku || '',
            barcode: productData.barcode || '',
            costPrice: parseFloat(productData.costPrice) || 0,
            salePrice: parseFloat(productData.salePrice) || 0,
            stock: parseInt(productData.stock) || 0,
            minStock: parseInt(productData.minStock) || 0,
            maxStock: parseInt(productData.maxStock) || 0,
            supplier: productData.supplier || '',
            status: 'active',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        return newProductRef.set(product);
    }
    
    // Event listeners para los formularios
    document.addEventListener('click', function(e) {
        const user = firebase.auth().currentUser;
        if (!user) return;
        
        // Manejar creación de ventas
        if (e.target.closest('#add-sale-btn')) {
            const saleForm = document.getElementById('sale-form');
            if (saleForm) {
                const formData = new FormData(saleForm);
                const saleData = {
                    customer: { name: formData.get('customer-name') },
                    total: parseFloat(formData.get('total')) || 0,
                    paymentMethod: formData.get('payment-method') || 'cash'
                };
                
                createSale(user.uid, saleData)
                    .then(() => {
                        alert('Venta registrada exitosamente');
                        saleForm.reset();
                    })
                    .catch(error => {
                        console.error('Error al registrar venta:', error);
                        alert('Error al registrar la venta');
                    });
            }
        }
        
        // Manejar creación de gastos
        if (e.target.closest('#add-expense-btn')) {
            const expenseForm = document.getElementById('expense-form');
            if (expenseForm) {
                const formData = new FormData(expenseForm);
                const expenseData = {
                    category: formData.get('category'),
                    description: formData.get('description'),
                    amount: formData.get('amount'),
                    vendor: formData.get('vendor'),
                    paymentMethod: formData.get('payment-method') || 'cash'
                };
                
                createExpense(user.uid, expenseData)
                    .then(() => {
                        alert('Gasto registrado exitosamente');
                        expenseForm.reset();
                    })
                    .catch(error => {
                        console.error('Error al registrar gasto:', error);
                        alert('Error al registrar el gasto');
                    });
            }
        }
        
        // Manejar eliminación de ventas
        if (e.target.closest('.delete-sale')) {
            const saleId = e.target.closest('.delete-sale').dataset.id;
            if (confirm('¿Está seguro de que desea eliminar esta venta?')) {
                firebase.database().ref('users/' + user.uid + '/sales/' + saleId).remove()
                    .then(() => alert('Venta eliminada exitosamente'))
                    .catch(error => {
                        console.error('Error al eliminar venta:', error);
                        alert('Error al eliminar la venta');
                    });
            }
        }
        
        // Manejar eliminación de gastos
        if (e.target.closest('.delete-expense')) {
            const expenseId = e.target.closest('.delete-expense').dataset.id;
            if (confirm('¿Está seguro de que desea eliminar este gasto?')) {
                firebase.database().ref('users/' + user.uid + '/expenses/' + expenseId).remove()
                    .then(() => alert('Gasto eliminado exitosamente'))
                    .catch(error => {
                        console.error('Error al eliminar gasto:', error);
                        alert('Error al eliminar el gasto');
                    });
            }
        }
    });
    
    // Función para crear cierre diario
    function createDailyClosure(userId, closureData) {
        const closuresRef = firebase.database().ref('users/' + userId + '/dailyClosures');
        const newClosureRef = closuresRef.push();
        
        const closure = {
            id: newClosureRef.key,
            date: closureData.date || new Date().toISOString().split('T')[0],
            openingCash: parseFloat(closureData.openingCash) || 0,
            totalSales: parseFloat(closureData.totalSales) || 0,
            totalExpenses: parseFloat(closureData.totalExpenses) || 0,
            cashSales: parseFloat(closureData.cashSales) || 0,
            cardSales: parseFloat(closureData.cardSales) || 0,
            transferSales: parseFloat(closureData.transferSales) || 0,
            expectedCash: parseFloat(closureData.expectedCash) || 0,
            actualCash: parseFloat(closureData.actualCash) || 0,
            difference: parseFloat(closureData.difference) || 0,
            notes: closureData.notes || '',
            status: 'completed',
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        return newClosureRef.set(closure);
    }
    
    // Función para crear ajustes de inventario
    function createInventoryAdjustment(userId, adjustmentData) {
        const adjustmentsRef = firebase.database().ref('users/' + userId + '/inventoryAdjustments');
        const newAdjustmentRef = adjustmentsRef.push();
        
        const adjustment = {
            id: newAdjustmentRef.key,
            date: adjustmentData.date || new Date().toISOString().split('T')[0],
            time: adjustmentData.time || new Date().toTimeString().split(' ')[0],
            productId: adjustmentData.productId || '',
            productName: adjustmentData.productName || '',
            type: adjustmentData.type || 'manual', // manual, sale, purchase, return
            previousStock: parseInt(adjustmentData.previousStock) || 0,
            adjustment: parseInt(adjustmentData.adjustment) || 0,
            newStock: parseInt(adjustmentData.newStock) || 0,
            reason: adjustmentData.reason || '',
            notes: adjustmentData.notes || '',
            createdBy: adjustmentData.createdBy || '',
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        return newAdjustmentRef.set(adjustment);
    }
    
    // Función para actualizar stock de producto
    function updateProductStock(userId, productId, newStock, reason = 'manual') {
        const productRef = firebase.database().ref('users/' + userId + '/inventory/' + productId);
        
        return productRef.once('value').then(snapshot => {
            const product = snapshot.val();
            if (product) {
                const previousStock = product.stock || 0;
                const adjustment = newStock - previousStock;
                
                // Actualizar el stock del producto
                const updates = {
                    stock: newStock,
                    updatedAt: firebase.database.ServerValue.TIMESTAMP
                };
                
                // Crear registro de ajuste
                const adjustmentData = {
                    productId: productId,
                    productName: product.name,
                    type: reason,
                    previousStock: previousStock,
                    adjustment: adjustment,
                    newStock: newStock,
                    reason: reason
                };
                
                return Promise.all([
                    productRef.update(updates),
                    createInventoryAdjustment(userId, adjustmentData)
                ]);
            }
        });
    }
    
    // Función para cargar datos del dashboard
    function loadDashboardData() {
        const user = firebase.auth().currentUser;
        if (!user) return;
        
        // Cargar datos iniciales
        loadInitialCash(user.uid);
        loadSales(user.uid);
        loadExpenses(user.uid);
        
        // Cargar resumen del día actual
        loadDailySummary(user.uid);
    }
    
    // Función para cargar resumen diario
    function loadDailySummary(userId) {
        const today = new Date().toISOString().split('T')[0];
        
        // Cargar ventas del día
        firebase.database().ref('users/' + userId + '/sales')
            .orderByChild('date')
            .equalTo(today)
            .once('value', snapshot => {
                let totalSales = 0;
                let cashSales = 0;
                let cardSales = 0;
                let transferSales = 0;
                
                snapshot.forEach(childSnapshot => {
                    const sale = childSnapshot.val();
                    if (sale.status === 'completed') {
                        totalSales += sale.total || 0;
                        
                        switch(sale.paymentMethod) {
                            case 'cash':
                                cashSales += sale.total || 0;
                                break;
                            case 'card':
                                cardSales += sale.total || 0;
                                break;
                            case 'transfer':
                                transferSales += sale.total || 0;
                                break;
                        }
                    }
                });
                
                // Actualizar elementos del DOM
                const totalSalesElement = document.getElementById('total-sales-today');
                if (totalSalesElement) {
                    totalSalesElement.textContent = '$' + totalSales.toFixed(2);
                }
            });
        
        // Cargar gastos del día
        firebase.database().ref('users/' + userId + '/expenses')
            .orderByChild('date')
            .equalTo(today)
            .once('value', snapshot => {
                let totalExpenses = 0;
                
                snapshot.forEach(childSnapshot => {
                    const expense = childSnapshot.val();
                    totalExpenses += expense.amount || 0;
                });
                
                // Actualizar elementos del DOM
                const totalExpensesElement = document.getElementById('total-expenses-today');
                if (totalExpensesElement) {
                    totalExpensesElement.textContent = '$' + totalExpenses.toFixed(2);
                }
            });
    }
    
    // Inicializar dashboard cuando el usuario esté autenticado
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            loadDashboardData();
        }
    });
    
    // Funcionalidad para imprimir facturas
    document.addEventListener('click', function(e) {
        if (e.target.closest('.print-invoice')) {
            // En una implementación real, esto abriría una ventana de impresión
            // con los datos de la transacción
            alert('Imprimiendo factura...');
        }
    });

    // Función para cargar perfil de usuario
     function loadUserProfile() {
         const user = firebase.auth().currentUser;
         if (!user) return;

         // Cargar datos del perfil desde Firebase
         firebase.database().ref('users/' + user.uid + '/profile').once('value', (snapshot) => {
             const profile = snapshot.val() || {};
             
             // Llenar formulario con datos existentes
             document.getElementById('profile-name').value = profile.name || user.displayName || '';
             document.getElementById('profile-email').value = profile.email || user.email || '';
             document.getElementById('profile-phone1').value = profile.phone1 || '';
             document.getElementById('profile-phone2').value = profile.phone2 || '';
             document.getElementById('profile-address').value = profile.address || '';
             
             // Cargar imagen de perfil
             if (profile.photoURL) {
                 document.getElementById('profile-image-preview').src = profile.photoURL;
                 document.getElementById('user-avatar').src = profile.photoURL;
             }
         });
     }

    // Función para guardar perfil de usuario
     function saveUserProfile() {
         const user = firebase.auth().currentUser;
         if (!user) return;

         const profileData = {
             name: document.getElementById('profile-name').value,
             email: document.getElementById('profile-email').value,
             phone1: document.getElementById('profile-phone1').value,
             phone2: document.getElementById('profile-phone2').value,
             address: document.getElementById('profile-address').value,
             updatedAt: firebase.database.ServerValue.TIMESTAMP
         };

         // Manejar imagen de perfil si se seleccionó una nueva
         const imageFile = document.getElementById('profile-image').files[0];
         
         if (imageFile) {
             // Convertir imagen a base64 para almacenar en la base de datos
             const reader = new FileReader();
             reader.onload = function(e) {
                 profileData.photoURL = e.target.result;
                 saveProfileData(user.uid, profileData).then(() => {
                     alert('Perfil actualizado correctamente');
                     // Actualizar imagen en la interfaz
                     document.getElementById('user-avatar').src = profileData.photoURL;
                     document.getElementById('user-name').textContent = profileData.name;
                     // Cerrar modal
                     const profileModal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
                     profileModal.hide();
                 }).catch((error) => {
                     console.error('Error al actualizar perfil:', error);
                     alert('Error al actualizar perfil');
                 });
             };
             reader.readAsDataURL(imageFile);
         } else {
             // Guardar solo los datos del perfil sin imagen
             saveProfileData(user.uid, profileData).then(() => {
                 alert('Perfil actualizado correctamente');
                 document.getElementById('user-name').textContent = profileData.name;
                 // Cerrar modal
                 const profileModal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
                 profileModal.hide();
             }).catch((error) => {
                 console.error('Error al actualizar perfil:', error);
                 alert('Error al actualizar perfil');
             });
         }
     }

    // Función auxiliar para guardar datos del perfil
    function saveProfileData(userId, profileData) {
        return firebase.database().ref('users/' + userId + '/profile').set(profileData);
    }

    // Función para cargar configuración de sistema
    function loadSystemConfig() {
        const user = firebase.auth().currentUser;
        if (!user) return;

        // Cargar configuración desde Firebase
        firebase.database().ref('users/' + user.uid + '/settings').once('value', (snapshot) => {
            const settings = snapshot.val() || {};
            
            // Configuración de moneda
            const currency = settings.currency || 'colones';
            document.getElementById('system-currency-' + currency).checked = true;
            
            // Tipo de cambio
            document.getElementById('exchangeRate').value = settings.exchangeRate || 550;
            
            // Configuración de impuestos
            document.getElementById('taxRate').value = settings.taxRate || 13;
            document.getElementById('autoApplyTax').checked = settings.autoApplyTax !== false;
            document.getElementById('showTaxInReports').checked = settings.showTaxInReports !== false;
            
            // Información del negocio
            document.getElementById('businessName').value = settings.businessName || '';
            document.getElementById('businessId').value = settings.businessId || '';
            document.getElementById('businessAddress').value = settings.businessAddress || '';
        });
    }

    // Función para guardar configuración de sistema
    function saveSystemConfig() {
        const user = firebase.auth().currentUser;
        if (!user) return;

        // Obtener valores del formulario
        const currency = document.querySelector('input[name="systemCurrency"]:checked').value;
        const exchangeRate = parseFloat(document.getElementById('exchangeRate').value) || 550;
        const taxRate = parseFloat(document.getElementById('taxRate').value) || 13;
        const autoApplyTax = document.getElementById('autoApplyTax').checked;
        const showTaxInReports = document.getElementById('showTaxInReports').checked;
        const businessName = document.getElementById('businessName').value.trim();
        const businessId = document.getElementById('businessId').value.trim();
        const businessAddress = document.getElementById('businessAddress').value.trim();

        // Validaciones
        if (exchangeRate <= 0) {
            alert('El tipo de cambio debe ser mayor a 0');
            return;
        }

        if (taxRate < 0 || taxRate > 100) {
            alert('La tasa de impuesto debe estar entre 0% y 100%');
            return;
        }

        const settingsData = {
            currency: currency,
            exchangeRate: exchangeRate,
            taxRate: taxRate,
            autoApplyTax: autoApplyTax,
            showTaxInReports: showTaxInReports,
            businessName: businessName,
            businessId: businessId,
            businessAddress: businessAddress,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        };

        // Guardar en Firebase
        firebase.database().ref('users/' + user.uid + '/settings').set(settingsData)
            .then(() => {
                alert('Configuración guardada correctamente');
                
                // Actualizar la configuración de moneda en el dashboard
                updateCurrencyDisplay(currency, exchangeRate);
                
                // Cerrar modal
                const systemConfigModal = bootstrap.Modal.getInstance(document.getElementById('systemConfigModal'));
                systemConfigModal.hide();
            })
            .catch((error) => {
                console.error('Error al guardar configuración:', error);
                alert('Error al guardar la configuración');
            });
    }

    // Función para actualizar la visualización de moneda en el dashboard
    function updateCurrencyDisplay(currency, exchangeRate) {
        // Actualizar los radio buttons del dashboard
        document.getElementById('currency-' + currency).checked = true;
        
        // Actualizar el tipo de cambio mostrado
        const exchangeRateDisplay = document.querySelector('.currency-toggle small');
        if (exchangeRateDisplay) {
            exchangeRateDisplay.textContent = `Tipo de cambio: $1 = ₡${exchangeRate}`;
        }
        
        // Disparar evento de cambio para actualizar los símbolos de moneda
        const currencyRadio = document.getElementById('currency-' + currency);
        if (currencyRadio) {
            currencyRadio.dispatchEvent(new Event('change'));
        }
    }

    // Event listeners para botones de exportar
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-action') && e.target.closest('.btn-action').innerHTML.includes('Exportar')) {
            const moduleContainer = e.target.closest('.module-container');
            const moduleId = moduleContainer.id;
            
            switch(moduleId) {
                case 'caja-inicial-module':
                    exportToPDF('caja-inicial', 'Registro de Caja Inicial');
                    break;
                case 'ventas-module':
                    exportToPDF('ventas', 'Registro de Ventas');
                    break;
                case 'gastos-module':
                    exportToPDF('gastos', 'Registro de Gastos');
                    break;
                case 'ajustes-module':
                    exportToPDF('ajustes', 'Registro de Ajustes');
                    break;
                case 'cierre-diario-module':
                    exportToPDF('cierre-diario', 'Historial de Cierres');
                    break;
                case 'clientes-module':
                    exportToPDF('clientes', 'Lista de Clientes');
                    break;
                case 'inventario-module':
                    exportToPDF('inventario', 'Inventario de Productos');
                    break;
            }
        }
    });

    // Función para exportar datos a PDF
    function exportToPDF(moduleType, title) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configurar fuente
        doc.setFont('helvetica');
        
        // Obtener información del usuario y negocio
        const user = firebase.auth().currentUser;
        if (!user) {
            alert('Error: Usuario no autenticado');
            return;
        }
        
        // Cargar configuración del negocio
        firebase.database().ref('users/' + user.uid + '/settings').once('value', (snapshot) => {
            const settings = snapshot.val() || {};
            const businessName = settings.businessName || 'Mi Negocio';
            const businessId = settings.businessId || '';
            const businessAddress = settings.businessAddress || '';
            
            // Encabezado del documento
            doc.setFontSize(20);
            doc.setTextColor(40, 116, 166);
            doc.text(businessName, 20, 20);
            
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            if (businessId) doc.text(`ID: ${businessId}`, 20, 30);
            if (businessAddress) doc.text(`Dirección: ${businessAddress}`, 20, 35);
            
            doc.setFontSize(16);
            doc.setTextColor(40, 116, 166);
            doc.text(title, 20, 50);
            
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generado el: ${new Date().toLocaleString('es-CR')}`, 20, 60);
            
            // Obtener datos según el módulo
            getModuleDataForPDF(moduleType, user.uid).then(data => {
                if (data && data.length > 0) {
                    // Configurar tabla
                    const tableConfig = getTableConfig(moduleType);
                    
                    doc.autoTable({
                        head: [tableConfig.headers],
                        body: data,
                        startY: 70,
                        styles: {
                            fontSize: 9,
                            cellPadding: 3
                        },
                        headStyles: {
                            fillColor: [40, 116, 166],
                            textColor: 255,
                            fontStyle: 'bold'
                        },
                        alternateRowStyles: {
                            fillColor: [245, 245, 245]
                        }
                    });
                    
                    // Pie de página
                    const pageCount = doc.internal.getNumberOfPages();
                    for (let i = 1; i <= pageCount; i++) {
                        doc.setPage(i);
                        doc.setFontSize(8);
                        doc.setTextColor(100, 100, 100);
                        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
                        doc.text('Generado por CashTrack', 20, doc.internal.pageSize.height - 10);
                    }
                    
                    // Descargar PDF
                    const fileName = `${moduleType}_${new Date().toISOString().split('T')[0]}.pdf`;
                    doc.save(fileName);
                } else {
                    alert('No hay datos para exportar en este módulo.');
                }
            }).catch(error => {
                console.error('Error al obtener datos para PDF:', error);
                alert('Error al generar el PDF');
            });
        });
    }

    // Función para obtener configuración de tabla según el módulo
    function getTableConfig(moduleType) {
        const configs = {
            'caja-inicial': {
                headers: ['Fecha', 'Hora', 'Usuario', 'Monto', 'Observaciones']
            },
            'ventas': {
                headers: ['Fecha', 'Hora', 'Cliente', 'Producto', 'Monto']
            },
            'gastos': {
                headers: ['Fecha', 'Hora', 'Categoría', 'Descripción', 'Monto']
            },
            'ajustes': {
                headers: ['Fecha', 'Hora', 'Tipo', 'Descripción', 'Monto']
            },
            'cierre-diario': {
                headers: ['Fecha', 'Hora', 'Usuario', 'Caja Inicial', 'Ventas', 'Gastos', 'Ajustes', 'Caja Final']
            },
            'clientes': {
                headers: ['Nombre', 'Teléfono', 'Email', 'Dirección']
            },
            'inventario': {
                headers: ['Código', 'Producto', 'Categoría', 'Precio', 'Stock']
            }
        };
        
        return configs[moduleType] || { headers: [] };
    }

    // Función para obtener datos del módulo desde Firebase
    function getModuleDataForPDF(moduleType, userId) {
        return new Promise((resolve, reject) => {
            const dataPath = `users/${userId}/${moduleType}`;
            
            firebase.database().ref(dataPath).once('value', (snapshot) => {
                const data = snapshot.val();
                if (!data) {
                    resolve([]);
                    return;
                }
                
                const formattedData = [];
                
                Object.keys(data).forEach(key => {
                    const item = data[key];
                    let row = [];
                    
                    switch(moduleType) {
                        case 'caja-inicial':
                            row = [
                                item.fecha || '',
                                item.hora || '',
                                item.usuario || '',
                                formatCurrency(item.monto || 0),
                                item.observaciones || ''
                            ];
                            break;
                        case 'ventas':
                            row = [
                                item.fecha || '',
                                item.hora || '',
                                item.cliente || '',
                                item.producto || '',
                                formatCurrency(item.monto || 0)
                            ];
                            break;
                        case 'gastos':
                            row = [
                                item.fecha || '',
                                item.hora || '',
                                item.categoria || '',
                                item.descripcion || '',
                                formatCurrency(item.monto || 0)
                            ];
                            break;
                        case 'ajustes':
                            row = [
                                item.fecha || '',
                                item.hora || '',
                                item.tipo || '',
                                item.descripcion || '',
                                formatCurrency(item.monto || 0)
                            ];
                            break;
                        case 'cierre-diario':
                            row = [
                                item.fecha || '',
                                item.hora || '',
                                item.usuario || '',
                                formatCurrency(item.cajaInicial || 0),
                                formatCurrency(item.ventas || 0),
                                formatCurrency(item.gastos || 0),
                                formatCurrency(item.ajustes || 0),
                                formatCurrency(item.cajaFinal || 0)
                            ];
                            break;
                        case 'clientes':
                            row = [
                                item.nombre || '',
                                item.telefono || '',
                                item.email || '',
                                item.direccion || ''
                            ];
                            break;
                        case 'inventario':
                            row = [
                                item.codigo || '',
                                item.nombre || '',
                                item.categoria || '',
                                formatCurrency(item.precio || 0),
                                item.stock || 0
                            ];
                            break;
                    }
                    
                    if (row.length > 0) {
                        formattedData.push(row);
                    }
                });
                
                resolve(formattedData);
            }, (error) => {
                reject(error);
            });
        });
    }

    // Función auxiliar para formatear moneda
    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'CRC',
            minimumFractionDigits: 0
        }).format(amount);
    }
});