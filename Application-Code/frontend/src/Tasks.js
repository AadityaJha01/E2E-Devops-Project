import { Component } from "react";
import {
    addTask,
    getTasks,
    updateTask,
    deleteTask,
    getStats,
} from "./services/taskServices";

class Tasks extends Component {
    state = { 
        tasks: [], 
        currentTask: "",
        currentPriority: "medium",
        currentCategory: "general",
        currentDueDate: "",
        editingTaskId: null,
        editTaskText: "",
        filters: {
            completed: undefined,
            priority: "",
            category: "",
            search: "",
        },
        stats: null,
        loading: false,
        error: null,
    };

    async componentDidMount() {
        await this.loadTasks();
        await this.loadStats();
    }

    loadTasks = async () => {
        this.setState({ loading: true, error: null });
        try {
            const { data } = await getTasks(this.state.filters);
            this.setState({ tasks: data, loading: false });
        } catch (error) {
            this.setState({ error: "Failed to load tasks", loading: false });
            console.error(error);
        }
    };

    loadStats = async () => {
        try {
            const { data } = await getStats();
            this.setState({ stats: data });
        } catch (error) {
            console.error("Failed to load stats:", error);
        }
    };

    handleChange = ({ currentTarget: input }) => {
        this.setState({ currentTask: input.value });
    };

    handlePriorityChange = (priority) => {
        this.setState({ currentPriority: priority });
    };

    handleCategoryChange = (category) => {
        this.setState({ currentCategory: category });
    };

    handleDueDateChange = ({ currentTarget: input }) => {
        this.setState({ currentDueDate: input.value });
    };

    handleFilterChange = (filterType, value) => {
        const newFilters = { ...this.state.filters };
        if (filterType === "completed") {
            newFilters.completed = value === "all" ? undefined : value === "true";
        } else {
            newFilters[filterType] = value || "";
        }
        this.setState({ filters: newFilters }, () => {
            this.loadTasks();
        });
    };

    handleSearchChange = ({ currentTarget: input }) => {
        const newFilters = { ...this.state.filters, search: input.value };
        this.setState({ filters: newFilters }, () => {
            // Debounce search
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.loadTasks();
            }, 500);
        });
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        if (!this.state.currentTask.trim()) return;

        const originalTasks = this.state.tasks;
        try {
            const taskData = {
                task: this.state.currentTask,
                priority: this.state.currentPriority,
                category: this.state.currentCategory,
                dueDate: this.state.currentDueDate || null,
            };
            
            const { data } = await addTask(taskData);
            const tasks = [...originalTasks, data];
            this.setState({ 
                tasks, 
                currentTask: "",
                currentPriority: "medium",
                currentCategory: "general",
                currentDueDate: "",
            });
            await this.loadStats();
        } catch (error) {
            this.setState({ error: "Failed to add task" });
            console.error(error);
        }
    };

    handleUpdate = async (taskId, updates) => {
        const originalTasks = this.state.tasks;
        try {
            const tasks = [...originalTasks];
            const index = tasks.findIndex((task) => task._id === taskId);
            
            if (updates.completed !== undefined) {
                tasks[index] = { 
                    ...tasks[index], 
                    completed: updates.completed,
                    completedAt: updates.completed ? new Date() : null,
                };
            } else {
                tasks[index] = { ...tasks[index], ...updates };
            }
            
            this.setState({ tasks });
            await updateTask(taskId, updates);
            await this.loadStats();
        } catch (error) {
            this.setState({ tasks: originalTasks, error: "Failed to update task" });
            console.error(error);
        }
    };

    handleToggleComplete = async (taskId, currentStatus) => {
        await this.handleUpdate(taskId, { completed: !currentStatus });
    };

    handleStartEdit = (task) => {
        this.setState({
            editingTaskId: task._id,
            editTaskText: task.task,
        });
    };

    handleCancelEdit = () => {
        this.setState({
            editingTaskId: null,
            editTaskText: "",
        });
    };

    handleSaveEdit = async (taskId) => {
        if (!this.state.editTaskText.trim()) {
            this.handleCancelEdit();
            return;
        }
        await this.handleUpdate(taskId, { task: this.state.editTaskText });
        this.setState({
            editingTaskId: null,
            editTaskText: "",
        });
    };

    handleEditTextChange = ({ currentTarget: input }) => {
        this.setState({ editTaskText: input.value });
    };

    handleDelete = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) {
            return;
        }

        const originalTasks = this.state.tasks;
        try {
            const tasks = originalTasks.filter((task) => task._id !== taskId);
            this.setState({ tasks });
            await deleteTask(taskId);
            await this.loadStats();
        } catch (error) {
            this.setState({ tasks: originalTasks, error: "Failed to delete task" });
            console.error(error);
        }
    };

    formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
        });
    };

    isOverdue = (task) => {
        if (!task.dueDate || task.completed) return false;
        return new Date(task.dueDate) < new Date();
    };

    getPriorityColor = (priority) => {
        switch (priority) {
            case "high": return "#f44336";
            case "medium": return "#ff9800";
            case "low": return "#4caf50";
            default: return "#9e9e9e";
        }
    };

    getPriorityLabel = (priority) => {
        return priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : "Medium";
    };
}

export default Tasks;
