document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskForm = document.getElementById('task-form');
    const taskModal = document.getElementById('task-modal');
    const addTaskBtn = document.getElementById('add-task-btn');
    const cancelTaskBtn = document.getElementById('cancel-task');
    const closeBtn = document.querySelector('.close-btn');
    const taskList = document.getElementById('task-list');
    const taskSearch = document.getElementById('task-search');
    const clearSearchBtn = document.querySelector('.clear-search');
    const sortBy = document.getElementById('sort-by');
    const filterBy = document.getElementById('filter-by');
    const categoryList = document.getElementById('category-list');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const newCategoryInput = document.getElementById('new-category');
    const taskCategorySelect = document.getElementById('task-category');
    const totalTasksElement = document.getElementById('total-tasks');
    const completedTasksCountElement = document.getElementById('completed-tasks-count');
    const overdueTasksElement = document.getElementById('overdue-tasks');
    const tasksHeader = document.getElementById('tasks-header');
    
    
    // Sidebar buttons
    const allTasksBtn = document.getElementById('all-tasks');
    const todayTasksBtn = document.getElementById('today-tasks');
    const importantTasksBtn = document.getElementById('important-tasks');
    const completedTasksBtn = document.getElementById('completed-tasks');

    // App state
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let categories = JSON.parse(localStorage.getItem('categories')) || ['Work', 'Personal', 'Shopping'];
    let currentView = 'all';
    let currentCategory = null;
    let editingTaskId = null;

    // Initialize the app
    init();

    function init() {
    renderTaskList();
    renderCategories();
    updateStats();
    setupEventListeners();
    setupSearch(); // Add this line
    }

    function setupEventListeners() {
        // Task modal
        addTaskBtn.addEventListener('click', () => openTaskModal());
        cancelTaskBtn.addEventListener('click', () => closeTaskModal());
        closeBtn.addEventListener('click', () => closeTaskModal());
        taskForm.addEventListener('submit', handleTaskSubmit);

        // Search and filters
        sortBy.addEventListener('change', () => renderTaskList());
        filterBy.addEventListener('change', () => renderTaskList());

        // Categories
        addCategoryBtn.addEventListener('click', addCategory);
        newCategoryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addCategory();
        });

        // Sidebar navigation
        allTasksBtn.addEventListener('click', () => {
            setActiveView('all');
            tasksHeader.textContent = 'All Tasks';
        });
        todayTasksBtn.addEventListener('click', () => {
            setActiveView('today');
            tasksHeader.textContent = "Today's Tasks";
        });
        importantTasksBtn.addEventListener('click', () => {
            setActiveView('important');
            tasksHeader.textContent = 'Important Tasks';
        });
        completedTasksBtn.addEventListener('click', () => {
            setActiveView('completed');
            tasksHeader.textContent = 'Completed Tasks';
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target === taskModal) {
                closeTaskModal();
            }
        });
    }

    function setupSearch() {
    taskSearch.addEventListener('input', () => {
        clearSearchBtn.style.display = taskSearch.value ? 'block' : 'none';
        renderTaskList();
    });
    
 clearSearchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        taskSearch.value = '';
        clearSearchBtn.style.display = 'none';
        renderTaskList();
        taskSearch.focus();
    });
}

    function setActiveView(view) {
        currentView = view;
        currentCategory = null;
        
        // Update active button in sidebar
        document.querySelectorAll('.sidebar-menu button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (view === 'all') allTasksBtn.classList.add('active');
        if (view === 'today') todayTasksBtn.classList.add('active');
        if (view === 'important') importantTasksBtn.classList.add('active');
        if (view === 'completed') completedTasksBtn.classList.add('active');
        
        renderTaskList();
    }

    function setActiveCategory(category) {
        currentCategory = category;
        currentView = null;
        
        // Update active category in sidebar
        document.querySelectorAll('#category-list li').forEach(li => {
            li.classList.remove('active');
            if (li.dataset.category === category) {
                li.classList.add('active');
            }
        });
        
        tasksHeader.textContent = `${category} Tasks`;
        renderTaskList();
    }

    function openTaskModal(taskId = null) {
        editingTaskId = taskId;
        const modalTitle = document.getElementById('modal-title');
        
        if (taskId) {
            // Editing existing task
            modalTitle.textContent = 'Edit Task';
            const task = tasks.find(t => t.id === taskId);
            
            document.getElementById('task-id').value = task.id;
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description || '';
            document.getElementById('task-due-date').value = task.dueDate || '';
            document.getElementById('task-priority').value = task.priority || 'medium';
            document.getElementById('task-category').value = task.category || '';
            document.getElementById('task-completed').checked = task.completed || false;
        } else {
            // Adding new task
            modalTitle.textContent = 'Add New Task';
            document.getElementById('task-id').value = '';
            document.getElementById('task-title').value = '';
            document.getElementById('task-description').value = '';
            document.getElementById('task-due-date').value = '';
            document.getElementById('task-priority').value = 'medium';
            document.getElementById('task-category').value = categories[0] || '';
            document.getElementById('task-completed').checked = false;
        }
        
        taskModal.style.display = 'flex';
    }

    function closeTaskModal() {
        taskModal.style.display = 'none';
        taskForm.reset();
    }

    function handleTaskSubmit(e) {
        e.preventDefault();
        
        const taskId = document.getElementById('task-id').value;
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const dueDate = document.getElementById('task-due-date').value;
        const priority = document.getElementById('task-priority').value;
        const category = document.getElementById('task-category').value;
        const completed = document.getElementById('task-completed').checked;
        
        if (!title) {
            alert('Task title is required!');
            return;
        }
        
        if (taskId) {
            // Update existing task
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                tasks[taskIndex] = {
                    ...tasks[taskIndex],
                    title,
                    description,
                    dueDate,
                    priority,
                    category,
                    completed
                };
            }
        } else {
            // Add new task
            const newTask = {
                id: generateId(),
                title,
                description,
                dueDate,
                priority,
                category,
                completed,
                createdAt: new Date().toISOString()
            };
            tasks.unshift(newTask);
        }
        
        saveTasks();
        renderTaskList();
        updateStats();
        closeTaskModal();
    }

    function renderTaskList() {
        taskList.innerHTML = '';
        
        let filteredTasks = [...tasks];
        
        // Apply search filter
        const searchTerm = taskSearch.value.toLowerCase();
        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(searchTerm) || 
                (task.description && task.description.toLowerCase().includes(searchTerm))
            );
        }

        // Apply view filter
        if (currentView === 'today') {
            const today = new Date().toISOString().split('T')[0];
            filteredTasks = filteredTasks.filter(task => task.dueDate === today);
        } else if (currentView === 'important') {
            filteredTasks = filteredTasks.filter(task => task.priority === 'high');
        } else if (currentView === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        } else if (currentCategory) {
            filteredTasks = filteredTasks.filter(task => task.category === currentCategory);
        }
        
        // Apply priority filter
        const priorityFilter = filterBy.value;
        if (priorityFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
        }
        
        // Apply sorting
        const sortMethod = sortBy.value;
        filteredTasks.sort((a, b) => {
            if (sortMethod === 'dueDate') {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            } else if (sortMethod === 'priority') {
                const priorityOrder = { high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            } else if (sortMethod === 'creationDate') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return 0;
        });
        
        // Render tasks
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <li class="no-tasks">
                    <i class="fas fa-tasks"></i>
                    <p>No tasks found. Add one to get started!</p>
                </li>
            `;
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.priority}-priority ${task.completed ? 'completed' : ''}`;
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                <div class="task-content">
                    <div class="task-title ${task.completed ? 'completed' : ''}">
                        <span class="priority-indicator priority-${task.priority}"></span>
                        ${task.title}
                    </div>
                    ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    <div class="task-meta">
                        ${task.dueDate ? `
                            <span class="task-due-date ${isOverdue(task.dueDate) && !task.completed ? 'overdue' : ''}">
                                <i class="far fa-calendar-alt"></i> ${formatDate(task.dueDate)}
                            </span>
                        ` : ''}
                        ${task.category ? `<span class="task-category">${task.category}</span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" data-id="${task.id}"><i class="far fa-edit"></i></button>
                    <button class="delete-btn" data-id="${task.id}"><i class="far fa-trash-alt"></i></button>
                </div>
            `;
            
            taskList.appendChild(taskItem);
        });
        
        // Add event listeners to task actions
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', toggleTaskComplete);
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                openTaskModal(e.currentTarget.dataset.id);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                deleteTask(e.currentTarget.dataset.id);
            });
        });
    }

    function renderCategories() {
        categoryList.innerHTML = '';
        taskCategorySelect.innerHTML = '';
        
        categories.forEach(category => {
            // Add to sidebar
            const li = document.createElement('li');
            li.dataset.category = category;
            li.innerHTML = `
                ${category}
                <span class="delete-category" data-category="${category}"><i class="far fa-trash-alt"></i></span>
            `;
            categoryList.appendChild(li);
            
            // Add to task form select
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            taskCategorySelect.appendChild(option);
            
            // Add click event to category
            li.addEventListener('click', () => setActiveCategory(category));
            
            // Add delete event
            li.querySelector('.delete-category').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteCategory(category);
            });
        });
    }

    function addCategory() {
        const categoryName = newCategoryInput.value.trim();
        
        if (!categoryName) return;
        
        if (categories.includes(categoryName)) {
            alert('Category already exists!');
            return;
        }
        
        categories.push(categoryName);
        saveCategories();
        renderCategories();
        newCategoryInput.value = '';
    }

    function deleteCategory(categoryName) {
        if (confirm(`Delete category "${categoryName}"? Tasks in this category will not be deleted.`)) {
            categories = categories.filter(cat => cat !== categoryName);
            saveCategories();
            renderCategories();
            
            if (currentCategory === categoryName) {
                setActiveView('all');
            }
        }
    }

    function toggleTaskComplete(e) {
        const taskId = e.target.dataset.id;
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            task.completed = e.target.checked;
            saveTasks();
            renderTaskList();
            updateStats();
        }
    }

    function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderTaskList();
            updateStats();
        }
    }

    function updateStats() {
        totalTasksElement.textContent = tasks.length;
        completedTasksCountElement.textContent = tasks.filter(task => task.completed).length;
        
        const today = new Date().toISOString().split('T')[0];
        overdueTasksElement.textContent = tasks.filter(task => 
            task.dueDate && 
            task.dueDate < today && 
            !task.completed
        ).length;
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function saveCategories() {
        localStorage.setItem('categories', JSON.stringify(categories));
    }

    // Helper functions
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function isOverdue(dateString) {
        if (!dateString) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(dateString) < today;
    }
});