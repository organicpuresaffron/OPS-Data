// API utility functions for tasks, expenses, and inventory

const API_BASE_URL = 'http://localhost:5000/api';

// Task API functions
const TaskAPI = {
    async getAllTasks() {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        return response.json();
    },

    async createTask(task) {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
        if (!response.ok) throw new Error('Failed to create task');
        return response.json();
    }
};

// Expense API functions
const ExpenseAPI = {
    async getAllExpenses() {
        const response = await fetch(`${API_BASE_URL}/expenses`);
        if (!response.ok) throw new Error('Failed to fetch expenses');
        return response.json();
    },

    async createExpense(expense) {
        const response = await fetch(`${API_BASE_URL}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense)
        });
        if (!response.ok) throw new Error('Failed to create expense');
        return response.json();
    }
};

// Inventory API functions
const InventoryAPI = {
    async getAllItems() {
        const response = await fetch(`${API_BASE_URL}/inventory`);
        if (!response.ok) throw new Error('Failed to fetch inventory');
        return response.json();
    },

    async createItem(item) {
        const response = await fetch(`${API_BASE_URL}/inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        if (!response.ok) throw new Error('Failed to create inventory item');
        return response.json();
    }
};

// Export the API objects
export { TaskAPI, ExpenseAPI, InventoryAPI };