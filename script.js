import { TaskAPI } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const modal = document.getElementById('taskDetailsModal');
    const closeModal = document.querySelector('.close-modal');
    const toggleTaskStatusBtn = document.getElementById('toggleTaskStatus');
    const deleteTaskBtn = document.getElementById('deleteTask');
    let currentTask = null;
    let currentTaskElement = null;

    // Load initial tasks
    try {
        const tasks = await TaskAPI.getAllTasks();
        tasks.forEach(task => {
            taskList.appendChild(createTaskElement(task));
        });
    } catch (error) {
        console.error('Failed to load tasks:', error);
    }

    const showTaskDetails = (task) => {
        currentTask = task;
        currentTaskElement = document.querySelector(`[data-task-id="${task.id}"]`);

        document.getElementById('modalTaskText').textContent = task.text;
        document.getElementById('modalPriority').textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
        document.getElementById('modalAssignee').textContent = task.assignee.charAt(0).toUpperCase() + task.assignee.slice(1);
        document.getElementById('modalDueDate').textContent = new Date(task.dueDate).toLocaleDateString();
        document.getElementById('modalStatus').textContent = task.completed ? 'Completed' : 'Active';

        modal.style.display = 'block';
    };

    const deleteTaskHandler = (task, element) => {
        tasks = tasks.filter(t => t !== task);
        element.remove();
        saveTasks();
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    };

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    toggleTaskStatusBtn.addEventListener('click', () => {
        if (currentTask) {
            currentTask.completed = !currentTask.completed;
            document.getElementById('modalStatus').textContent = currentTask.completed ? 'Completed' : 'Active';
            const taskElement = document.querySelector(`[data-task-id="${currentTask.id}"]`);
            if (taskElement) {
                taskElement.classList.toggle('completed');
            }
            saveTasks();
        }
    });

    deleteTaskBtn.addEventListener('click', () => {
        if (currentTask && currentTaskElement) {
            deleteTaskHandler(currentTask, currentTaskElement);
        }
    });

    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const assigneeSelect = document.getElementById('assigneeSelect');
    const dueDateInput = document.getElementById('dueDateInput');
    const addTaskBtn = document.getElementById('addTask');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');

    const saveTasks = async (task) => {
        try {
            const savedTask = await TaskAPI.createTask(task);
            taskList.appendChild(createTaskElement(savedTask));
        } catch (error) {
            console.error('Failed to save task:', error);
            alert('Failed to save task. Please try again.');
        }
    };

    const createTaskElement = (task) => {
        const li = document.createElement('li');
        if (task.completed) li.classList.add('completed');

        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';

        const priorityBadge = document.createElement('span');
        priorityBadge.className = `priority-badge priority-${task.priority}`;
        priorityBadge.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

        const assigneeBadge = document.createElement('span');
        assigneeBadge.className = `assignee-badge assignee-${task.assignee}`;
        assigneeBadge.textContent = task.assignee.charAt(0).toUpperCase() + task.assignee.slice(1);

        const taskText = document.createElement('span');
        taskText.textContent = task.text;

        const taskDetails = document.createElement('div');
        taskDetails.className = 'task-details';
        taskDetails.textContent = `Due: ${new Date(task.dueDate).toLocaleDateString()}`;

        taskContent.appendChild(taskText);
        taskContent.appendChild(taskDetails);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '×';

        li.appendChild(priorityBadge);
        li.appendChild(assigneeBadge);
        li.appendChild(taskContent);
        li.appendChild(deleteBtn);

        li.addEventListener('click', (e) => {
            if (e.target !== deleteBtn) {
                showTaskDetails(task);
            }
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTaskHandler(task, li);
        });


        return li;
    };

    const renderTasks = (filter = 'all') => {
        taskList.innerHTML = '';
        const filteredTasks = tasks.filter(task => {
            if (filter === 'active') return !task.completed;
            if (filter === 'completed') return task.completed;
            if (filter === 'rishabh') return task.assignee === 'rishabh';
            if (filter === 'mayank') return task.assignee === 'mayank';
            if (filter === 'both') return task.assignee === 'both';
            return true;
        });

        filteredTasks.forEach(task => {
            taskList.appendChild(createTaskElement(task));
        });
    };

    addTaskBtn.addEventListener('click', async () => {
        const text = taskInput.value.trim();
        const priority = prioritySelect.value;
        const assignee = assigneeSelect.value;
        const dueDate = dueDateInput.value;

        if (text && priority && assignee && dueDate) {
            const task = {
                title: text,
                priority,
                assignee,
                dueDate,
                status: 'active'
            };

            await saveTasks(task);

            taskInput.value = '';
            prioritySelect.value = 'low';
            assigneeSelect.value = 'unassigned';
            dueDateInput.value = '';
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTasks(btn.dataset.filter);
        });
    });

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTaskBtn.click();
        }
    });

    renderTasks();
});