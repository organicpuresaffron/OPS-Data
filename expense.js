import { ExpenseAPI } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    let expenses = [];
    let editingExpense = null;

    // Load initial expenses
    try {
        expenses = await ExpenseAPI.getAllExpenses();
        renderExpenses();
        updateTotals();
    } catch (error) {
        console.error('Failed to load expenses:', error);
    }

    const saveExpense = async (expenseData) => {
        try {
            const savedExpense = await ExpenseAPI.createExpense(expenseData);
            expenses.push(savedExpense);
            renderExpenses();
            updateTotals();
        } catch (error) {
            console.error('Failed to save expense:', error);
            alert('Failed to save expense. Please try again.');
        }
    };

    const calculateTotal = (personExpenses) => {
        return personExpenses.reduce((total, expense) => total + expense.amount, 0);
    };

    const createExpenseElement = (expense) => {
        const li = document.createElement('li');
        li.className = 'expense-item';
        
        const expenseContent = document.createElement('div');
        expenseContent.className = 'expense-content';

        const categoryBadge = document.createElement('span');
        categoryBadge.className = `category-badge category-${expense.category.toLowerCase()}`;
        categoryBadge.textContent = expense.category;

        const personBadge = document.createElement('span');
        personBadge.className = `assignee-${expense.person.toLowerCase()}`;
        personBadge.textContent = expense.person;

        const expenseText = document.createElement('span');
        expenseText.className = 'expense-description';
        expenseText.textContent = expense.description;

        const expenseAmount = document.createElement('span');
        expenseAmount.className = 'expense-amount';
        expenseAmount.textContent = `₹${expense.amount.toFixed(2)}`;

        const expenseDate = document.createElement('div');
        expenseDate.className = 'expense-date';
        expenseDate.textContent = new Date(expense.date).toLocaleDateString();

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '✎';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            editingExpense = expense;
            document.getElementById('expenseDescription').value = expense.description;
            document.getElementById('expenseAmount').value = expense.amount;
            document.getElementById('categorySelect').value = expense.category;
            document.getElementById('personSelect').value = expense.person;
            document.getElementById('expenseDate').value = expense.date;
            document.getElementById('addExpense').textContent = 'Update Expense';
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this expense?')) {
                // Note: Delete functionality will be added when backend API supports it
                alert('Delete functionality will be available soon.');
            }
        };

        expenseContent.appendChild(categoryBadge);
        expenseContent.appendChild(personBadge);
        expenseContent.appendChild(expenseText);
        expenseContent.appendChild(expenseAmount);
        expenseContent.appendChild(expenseDate);

        buttonContainer.appendChild(editBtn);
        buttonContainer.appendChild(deleteBtn);
        li.appendChild(expenseContent);
        li.appendChild(buttonContainer);

        return li;
    };

    const renderExpenses = (filter = 'all') => {
        const expenseList = document.getElementById('expenseList');
        expenseList.innerHTML = '';

        const filteredExpenses = expenses.filter(expense => {
            if (filter === 'rishabh') return expense.person.toLowerCase() === 'rishabh';
            if (filter === 'mayank') return expense.person.toLowerCase() === 'mayank';
            if (filter === 'shared') return expense.person.toLowerCase() === 'shared';
            return true;
        });

        filteredExpenses.forEach(expense => {
            expenseList.appendChild(createExpenseElement(expense));
        });
    };

    const updateTotals = () => {
        const rishabhExpenses = expenses.filter(e => e.person.toLowerCase() === 'rishabh');
        const mayankExpenses = expenses.filter(e => e.person.toLowerCase() === 'mayank');
        const sharedExpenses = expenses.filter(e => e.person.toLowerCase() === 'shared');

        document.getElementById('rishabhTotal').textContent = 
            `₹${calculateTotal(rishabhExpenses).toFixed(2)}`;
        document.getElementById('mayankTotal').textContent = 
            `₹${calculateTotal(mayankExpenses).toFixed(2)}`;
        document.getElementById('sharedTotal').textContent = 
            `₹${calculateTotal(sharedExpenses).toFixed(2)}`;
    };

    // Add expense form submission handler
    document.getElementById('addExpense').addEventListener('click', async () => {
        const description = document.getElementById('expenseDescription').value.trim();
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const category = document.getElementById('categorySelect').value;
        const person = document.getElementById('personSelect').value;
        const date = document.getElementById('expenseDate').value;

        if (description && amount && category && person && date) {
            const expenseData = { description, amount, category, person, date };
            await saveExpense(expenseData);

            // Reset form
            document.getElementById('expenseDescription').value = '';
            document.getElementById('expenseAmount').value = '';
            document.getElementById('categorySelect').value = 'Food';
            document.getElementById('personSelect').value = 'Rishabh';
            document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
            document.getElementById('addExpense').textContent = 'Add Expense';
        }
    });

    // Add filter button click handlers
    document.querySelectorAll('.expense-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.expense-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderExpenses(btn.dataset.filter);
        });
    });

    // Initialize the expense list and totals
    renderExpenses();
    updateTotals();
});