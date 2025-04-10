document.addEventListener('DOMContentLoaded', () => {
    // Initialize state
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let stock = JSON.parse(localStorage.getItem('stock')) || {};

    // Section visibility functions
    function showSection(section) {
        document.querySelector('.landing-cards').style.display = 'none';
        document.getElementById('purchaseSection').style.display = 'none';
        document.getElementById('saleSection').style.display = 'none';
        document.getElementById(`${section}Section`).style.display = 'block';
    }

    function showLanding() {
        document.querySelector('.landing-cards').style.display = 'grid';
        document.getElementById('purchaseSection').style.display = 'none';
        document.getElementById('saleSection').style.display = 'none';
    }

    // Make functions available globally
    window.showSection = showSection;
    window.showLanding = showLanding;

    // DOM elements for purchase section
    const purchaseItemNameInput = document.getElementById('purchaseItemName');
    const purchaseItemQuantityInput = document.getElementById('purchaseItemQuantity');
    const purchaseItemPriceInput = document.getElementById('purchaseItemPrice');
    const purchaseDateInput = document.getElementById('purchaseDate');
    const addPurchaseBtn = document.getElementById('addPurchase');

    // DOM elements for sale section
    const saleItemNameInput = document.getElementById('saleItemName');
    const saleItemQuantityInput = document.getElementById('saleItemQuantity');
    const saleItemPriceInput = document.getElementById('saleItemPrice');
    const saleDateInput = document.getElementById('saleDate');
    const addSaleBtn = document.getElementById('addSale');

    // Set default dates to today
    purchaseDateInput.valueAsDate = new Date();
    saleDateInput.valueAsDate = new Date();

    // Update totals
    function updateTotals() {
        let totalStockValue = 0;
        let totalSales = 0;
        let totalPurchases = 0;

        // Calculate totals from transactions
        transactions.forEach(transaction => {
            const total = transaction.quantity * transaction.price;
            if (transaction.type === 'sale') {
                totalSales += total;
            } else {
                totalPurchases += total;
            }
        });

        // Calculate current stock value
        for (const item in stock) {
            totalStockValue += stock[item].quantity * stock[item].price;
        }

        document.getElementById('totalStockValue').textContent = `₹${totalStockValue.toFixed(2)}`;
        document.getElementById('totalSales').textContent = `₹${totalSales.toFixed(2)}`;
        document.getElementById('totalPurchases').textContent = `₹${totalPurchases.toFixed(2)}`;
    }

    // Update stock table
    function updateStockTable() {
        const tbody = document.querySelector('#stockTable tbody');
        tbody.innerHTML = '';

        for (const item in stock) {
            const row = document.createElement('tr');
            const totalValue = stock[item].quantity * stock[item].price;
            row.innerHTML = `
                <td>${item}</td>
                <td>${stock[item].quantity}</td>
                <td>₹${stock[item].price.toFixed(2)}</td>
                <td>₹${totalValue.toFixed(2)}</td>
            `;
            tbody.appendChild(row);
        }
    }

    // Update purchase table
    function updatePurchaseTable() {
        const tbody = document.querySelector('#purchaseTable tbody');
        tbody.innerHTML = '';

        const purchases = transactions.filter(t => t.type === 'purchase');
        purchases.forEach(purchase => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${purchase.date}</td>
                <td>${purchase.billNumber}</td>
                <td>${purchase.customerName}</td>
                <td>${purchase.item}</td>
                <td>${purchase.quantity}</td>
                <td>₹${purchase.price.toFixed(2)}</td>
                <td>₹${purchase.totalAmount.toFixed(2)}</td>
                <td>
                    <button class="edit-btn" onclick='editPurchase(${JSON.stringify(purchase).replace(/'/g, "\\'")})'>
                        ✎
                    </button>
                    <button class="delete-btn" onclick='deletePurchase(${JSON.stringify(purchase).replace(/'/g, "\\'")})'>
                        ×
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Update sales table
    function updateSalesTable() {
        const tbody = document.querySelector('#saleTable tbody');
        tbody.innerHTML = '';

        const sales = transactions.filter(t => t.type === 'sale');
        sales.forEach(sale => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${sale.date}</td>
                <td>${sale.billNumber}</td>
                <td>${sale.customerName}</td>
                <td>${sale.item}</td>
                <td>${sale.quantity}</td>
                <td>₹${sale.price.toFixed(2)}</td>
                <td>₹${sale.totalAmount.toFixed(2)}</td>
                <td>
                    <button class="edit-btn" onclick='editSale(${JSON.stringify(sale).replace(/'/g, "\\'")})'>
                        ✎
                    </button>
                    <button class="delete-btn" onclick='deleteSale(${JSON.stringify(sale).replace(/'/g, "\\'")})'>
                        ×
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Add purchase
    async function addPurchase() {
        const name = purchaseItemNameInput.value.trim();
        const quantity = parseInt(purchaseItemQuantityInput.value);
        const price = parseFloat(purchaseItemPriceInput.value);
        const date = purchaseDateInput.value;
        const billNumber = document.getElementById('purchaseBillNumber').value.trim();
        const customerName = document.getElementById('purchaseCustomerName').value.trim();
        const batchNumber = document.getElementById('purchaseBatchNumber').value.trim();

        if (!name || !quantity || !price || !billNumber || !customerName || !batchNumber) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const item = {
                name,
                quantity,
                price,
                billNumber,
                customerName,
                batchNumber,
                category: 'purchase',
                lastUpdated: date
            };

            const savedItem = await InventoryAPI.createItem(item);

            // Update local state
            if (!stock[name]) {
                stock[name] = { quantity: 0, price: price };
            }
            stock[name].quantity += quantity;
            stock[name].price = price;

            // Calculate total amount
            const totalAmount = quantity * price;

            // Add transaction
            transactions.push({ 
                item: name, 
                quantity, 
                price, 
                type: 'purchase', 
                date,
                billNumber,
                customerName,
                batchNumber,
                totalAmount
            });

            // Update UI
            updateTotals();
            updateStockTable();
            updatePurchaseTable();
            updateSalesTable();

            // Reset form
            purchaseItemNameInput.value = '';
            purchaseItemQuantityInput.value = '';
            purchaseItemPriceInput.value = '';
            purchaseDateInput.valueAsDate = new Date();
        } catch (error) {
            console.error('Failed to save inventory item:', error);
            alert('Failed to save inventory item. Please try again.');
        }
    }

    // Add sale
    function addSale() {
        const item = saleItemNameInput.value.trim();
        const quantity = parseInt(saleItemQuantityInput.value);
        const price = parseFloat(saleItemPriceInput.value);
        const date = saleDateInput.value;
        const billNumber = document.getElementById('saleBillNumber').value.trim();
        const customerName = document.getElementById('saleCustomerName').value.trim();

        if (!item || !quantity || !price || !billNumber || !customerName) {
            alert('Please fill in all required fields');
            return;
        }

        // Check if item exists in stock
        if (!stock[item]) {
            alert('Item not found in stock!');
            return;
        }

        // Check if sufficient stock
        if (stock[item].quantity < quantity) {
            alert('Insufficient stock!');
            return;
        }

        // Update stock
        stock[item].quantity -= quantity;

        // Calculate total amount
        const totalAmount = quantity * price;

        // Add transaction
        transactions.push({ 
            item, 
            quantity, 
            price, 
            type: 'sale', 
            date,
            billNumber,
            customerName,
            totalAmount
        });

        // Save to localStorage
        localStorage.setItem('transactions', JSON.stringify(transactions));
        localStorage.setItem('stock', JSON.stringify(stock));

        // Update UI
        updateTotals();
        updateStockTable();
        updatePurchaseTable();
        updateSalesTable();

        // Reset form
        saleItemNameInput.value = '';
        saleItemQuantityInput.value = '';
        saleItemPriceInput.value = '';
        saleDateInput.valueAsDate = new Date();
    }

    // Edit purchase
    window.editPurchase = (purchase) => {
        purchaseItemNameInput.value = purchase.item;
        purchaseItemQuantityInput.value = purchase.quantity;
        purchaseItemPriceInput.value = purchase.price;
        purchaseDateInput.value = purchase.date;
        document.getElementById('purchaseBillNumber').value = purchase.billNumber;
        document.getElementById('purchaseCustomerName').value = purchase.customerName;
        document.getElementById('purchaseBatchNumber').value = purchase.batchNumber;
        
        // Remove old transaction
        transactions = transactions.filter(t => 
            t.type !== purchase.type || 
            t.date !== purchase.date || 
            t.billNumber !== purchase.billNumber
        );
        
        // Update stock (reverse the purchase)
        stock[purchase.item].quantity -= purchase.quantity;
        
        // Update UI
        updateTotals();
        updateStockTable();
        updatePurchaseTable();
    };

    // Delete purchase
    window.deletePurchase = (purchase) => {
        if (!confirm('Are you sure you want to delete this purchase?')) return;
        
        // Remove transaction
        transactions = transactions.filter(t => 
            t.type !== purchase.type || 
            t.date !== purchase.date || 
            t.billNumber !== purchase.billNumber
        );
        
        // Update stock
        stock[purchase.item].quantity -= purchase.quantity;
        
        // Save to localStorage
        localStorage.setItem('transactions', JSON.stringify(transactions));
        localStorage.setItem('stock', JSON.stringify(stock));
        
        // Update UI
        updateTotals();
        updateStockTable();
        updatePurchaseTable();
    };

    // Edit sale
    window.editSale = (sale) => {
        saleItemNameInput.value = sale.item;
        saleItemQuantityInput.value = sale.quantity;
        saleItemPriceInput.value = sale.price;
        saleDateInput.value = sale.date;
        document.getElementById('saleBillNumber').value = sale.billNumber;
        document.getElementById('saleCustomerName').value = sale.customerName;
        
        // Remove old transaction
        transactions = transactions.filter(t => 
            t.type !== sale.type || 
            t.date !== sale.date || 
            t.billNumber !== sale.billNumber
        );
        
        // Update stock (reverse the sale)
        stock[sale.item].quantity += sale.quantity;
        
        // Update UI
        updateTotals();
        updateStockTable();
        updateSalesTable();
    };

    // Delete sale
    window.deleteSale = (sale) => {
        if (!confirm('Are you sure you want to delete this sale?')) return;
        
        // Remove transaction
        transactions = transactions.filter(t => 
            t.type !== sale.type || 
            t.date !== sale.date || 
            t.billNumber !== sale.billNumber
        );
        
        // Update stock
        stock[sale.item].quantity += sale.quantity;
        
        // Save to localStorage
        localStorage.setItem('transactions', JSON.stringify(transactions));
        localStorage.setItem('stock', JSON.stringify(stock));
        
        // Update UI
        updateTotals();
        updateStockTable();
        updateSalesTable();
    };

    // Event listeners
    addPurchaseBtn.addEventListener('click', addPurchase);
    addSaleBtn.addEventListener('click', addSale);

    // Initial render
    updateTotals();
    updateStockTable();
    updatePurchaseTable();
    updateSalesTable();
});