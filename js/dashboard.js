document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario está autenticado
    const user = JSON.parse(localStorage.getItem('cashtrack_user') || '{}');
    if (!user.username) {
        window.location.href = 'index.html';
        return;
    }

    // Mostrar información del usuario
    document.getElementById('user-name').textContent = user.name || 'Usuario';
    document.getElementById('user-role').textContent = user.role || 'Usuario';

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
        localStorage.removeItem('cashtrack_user');
        window.location.href = 'index.html';
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