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
                    <td>${sale.customer}</td>
                    <td>${sale.description}</td>
                    <td class="text-end">${formatCurrency(sale.amount)}</td>
                    <td>
                        <button class="btn btn-sm btn-primary print-invoice" data-id="${key}">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-sale" data-id="${key}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                salesTable.appendChild(row);
                totalSales += parseFloat(sale.amount);
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
                    <td>${expense.category}</td>
                    <td>${expense.description}</td>
                    <td class="text-end">${formatCurrency(expense.amount)}</td>
                    <td>
                        <button class="btn btn-sm btn-danger delete-expense" data-id="${key}">
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
            localStorage.removeItem('cashtrack_user');
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Error al cerrar sesión:', error);
        });
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

    // Funcionalidad para imprimir facturas
    const printButtons = document.querySelectorAll('.btn-outline-info');
    printButtons.forEach(button => {
        button.addEventListener('click', function() {
            // En una implementación real, esto abriría una ventana de impresión
            // con los datos de la transacción
            alert('Imprimiendo factura...');
        });
    });
});