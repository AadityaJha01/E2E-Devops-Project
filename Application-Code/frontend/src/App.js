import React from "react";
import Tasks from "./Tasks";
import { 
    Paper, 
    TextField, 
    Checkbox, 
    Button, 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel,
    Chip,
    CircularProgress,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    IconButton,
} from "@material-ui/core";
import { 
    Delete as DeleteIcon, 
    Edit as EditIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    Add as AddIcon,
} from "@material-ui/icons";
import "./App.css";

class App extends Tasks {
    render() {
        const { 
            tasks, 
            currentTask, 
            currentPriority,
            currentCategory,
            currentDueDate,
            editingTaskId,
            editTaskText,
            filters,
            stats,
            loading,
            error,
        } = this.state;

        const categories = ["general", "work", "personal", "shopping", "health", "finance"];

        return (
            <div className="app">
                <header className="app-header">
                    <div className="header-content">
                        <Typography variant="h4" className="app-title">
                            📝 Todoist
                        </Typography>
                        {stats && (
                            <div className="header-stats">
                                <Chip 
                                    label={`${stats.pending} Pending`} 
                                    color="primary" 
                                    size="small"
                                    className="stat-chip"
                                />
                                <Chip 
                                    label={`${stats.completed} Completed`} 
                                    color="secondary" 
                                    size="small"
                                    className="stat-chip"
                                />
                                {stats.overdue > 0 && (
                                    <Chip 
                                        label={`${stats.overdue} Overdue`} 
                                        style={{ backgroundColor: "#f44336", color: "white" }}
                                        size="small"
                                        className="stat-chip"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </header>

                <div className="main-content">
                    <Grid container spacing={3}>
                        {/* Statistics Dashboard */}
                        {stats && (
                            <Grid item xs={12}>
                                <Card className="stats-card">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            📊 Task Statistics
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <Paper className="stat-box total">
                                                    <Typography variant="h4">{stats.total}</Typography>
                                                    <Typography variant="body2">Total Tasks</Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <Paper className="stat-box pending">
                                                    <Typography variant="h4">{stats.pending}</Typography>
                                                    <Typography variant="body2">Pending</Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <Paper className="stat-box completed">
                                                    <Typography variant="h4">{stats.completed}</Typography>
                                                    <Typography variant="body2">Completed</Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <Paper className="stat-box overdue">
                                                    <Typography variant="h4">{stats.overdue}</Typography>
                                                    <Typography variant="body2">Overdue</Typography>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                        {stats.byPriority && (
                                            <Box mt={2}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    By Priority:
                                                </Typography>
                                                <Box display="flex" gap={1} flexWrap="wrap">
                                                    <Chip 
                                                        label={`High: ${stats.byPriority.high}`}
                                                        style={{ backgroundColor: "#f44336", color: "white" }}
                                                        size="small"
                                                    />
                                                    <Chip 
                                                        label={`Medium: ${stats.byPriority.medium}`}
                                                        style={{ backgroundColor: "#ff9800", color: "white" }}
                                                        size="small"
                                                    />
                                                    <Chip 
                                                        label={`Low: ${stats.byPriority.low}`}
                                                        style={{ backgroundColor: "#4caf50", color: "white" }}
                                                        size="small"
                                                    />
                                                </Box>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}

                        {/* Task Input Form */}
                        <Grid item xs={12}>
                            <Paper elevation={3} className="task-form-container">
                                <form onSubmit={this.handleSubmit} className="task-form">
                                    <TextField
                                        variant="outlined"
                                        size="small"
                                        className="task-input-main"
                                        value={currentTask}
                                        required={true}
                                        onChange={this.handleChange}
                                        placeholder="What needs to be done?"
                                        fullWidth
                                    />
                                    
                                    <Grid container spacing={1} className="form-options">
                                        <Grid item xs={12} sm={4}>
                                            <FormControl variant="outlined" size="small" fullWidth>
                                                <InputLabel>Priority</InputLabel>
                                                <Select
                                                    value={currentPriority}
                                                    onChange={(e) => this.handlePriorityChange(e.target.value)}
                                                    label="Priority"
                                                >
                                                    <MenuItem value="low">Low</MenuItem>
                                                    <MenuItem value="medium">Medium</MenuItem>
                                                    <MenuItem value="high">High</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <FormControl variant="outlined" size="small" fullWidth>
                                                <InputLabel>Category</InputLabel>
                                                <Select
                                                    value={currentCategory}
                                                    onChange={(e) => this.handleCategoryChange(e.target.value)}
                                                    label="Category"
                                                >
                                                    {categories.map(cat => (
                                                        <MenuItem key={cat} value={cat}>
                                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                type="date"
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                label="Due Date"
                                                value={currentDueDate}
                                                onChange={this.handleDueDateChange}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </Grid>
                                    </Grid>

                                    <Button 
                                        className="add-task-btn" 
                                        color="primary" 
                                        variant="contained" 
                                        type="submit"
                                        startIcon={<AddIcon />}
                                        fullWidth
                                    >
                                        Add Task
                                    </Button>
                                </form>
                            </Paper>
                        </Grid>

                        {/* Filters and Search */}
                        <Grid item xs={12}>
                            <Paper elevation={2} className="filters-container">
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            placeholder="Search tasks..."
                                            value={filters.search}
                                            onChange={this.handleSearchChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4} md={2}>
                                        <FormControl variant="outlined" size="small" fullWidth>
                                            <InputLabel>Status</InputLabel>
                                            <Select
                                                value={filters.completed === undefined ? "all" : filters.completed.toString()}
                                                onChange={(e) => this.handleFilterChange("completed", e.target.value)}
                                                label="Status"
                                            >
                                                <MenuItem value="all">All</MenuItem>
                                                <MenuItem value="false">Pending</MenuItem>
                                                <MenuItem value="true">Completed</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={4} md={3}>
                                        <FormControl variant="outlined" size="small" fullWidth>
                                            <InputLabel>Priority</InputLabel>
                                            <Select
                                                value={filters.priority}
                                                onChange={(e) => this.handleFilterChange("priority", e.target.value)}
                                                label="Priority"
                                            >
                                                <MenuItem value="">All</MenuItem>
                                                <MenuItem value="high">High</MenuItem>
                                                <MenuItem value="medium">Medium</MenuItem>
                                                <MenuItem value="low">Low</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={4} md={3}>
                                        <FormControl variant="outlined" size="small" fullWidth>
                                            <InputLabel>Category</InputLabel>
                                            <Select
                                                value={filters.category}
                                                onChange={(e) => this.handleFilterChange("category", e.target.value)}
                                                label="Category"
                                            >
                                                <MenuItem value="">All</MenuItem>
                                                {categories.map(cat => (
                                                    <MenuItem key={cat} value={cat}>
                                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Error Message */}
                        {error && (
                            <Grid item xs={12}>
                                <Paper className="error-message">
                                    <Typography color="error">{error}</Typography>
                                </Paper>
                            </Grid>
                        )}

                        {/* Tasks List */}
                        <Grid item xs={12}>
                            <Paper elevation={3} className="tasks-container">
                                {loading ? (
                                    <Box display="flex" justifyContent="center" p={3}>
                                        <CircularProgress />
                                    </Box>
                                ) : tasks.length === 0 ? (
                                    <Box textAlign="center" p={3}>
                                        <Typography variant="h6" color="textSecondary">
                                            No tasks found. Add a new task to get started!
                                        </Typography>
                                    </Box>
                                ) : (
                                    <div className="tasks-list">
                                        {tasks.map((task) => (
                                            <Paper 
                                                key={task._id} 
                                                className={`task-item ${task.completed ? "completed" : ""} ${this.isOverdue(task) ? "overdue" : ""}`}
                                                elevation={2}
                                            >
                                                <Checkbox
                                                    checked={task.completed}
                                                    onChange={() => this.handleToggleComplete(task._id, task.completed)}
                                                    color="primary"
                                                />
                                                
                                                <div className="task-content">
                                                    {editingTaskId === task._id ? (
                                                        <div className="edit-mode">
                                                            <TextField
                                                                variant="outlined"
                                                                size="small"
                                                                value={editTaskText}
                                                                onChange={this.handleEditTextChange}
                                                                fullWidth
                                                                autoFocus
                                                            />
                                                            <IconButton 
                                                                size="small" 
                                                                color="primary"
                                                                onClick={() => this.handleSaveEdit(task._id)}
                                                            >
                                                                <CheckIcon />
                                                            </IconButton>
                                                            <IconButton 
                                                                size="small"
                                                                onClick={this.handleCancelEdit}
                                                            >
                                                                <CloseIcon />
                                                            </IconButton>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className={task.completed ? "task-text completed" : "task-text"}>
                                                                {task.task}
                                                            </div>
                                                            <div className="task-meta">
                                                                {task.priority && (
                                                                    <Chip
                                                                        label={this.getPriorityLabel(task.priority)}
                                                                        size="small"
                                                                        style={{ 
                                                                            backgroundColor: this.getPriorityColor(task.priority),
                                                                            color: "white",
                                                                            fontSize: "0.7rem"
                                                                        }}
                                                                    />
                                                                )}
                                                                {task.category && (
                                                                    <Chip
                                                                        label={task.category}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        className="category-chip"
                                                                    />
                                                                )}
                                                                {task.dueDate && (
                                                                    <Chip
                                                                        label={this.formatDate(task.dueDate)}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        className={this.isOverdue(task) ? "overdue-chip" : ""}
                                                                    />
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="task-actions">
                                                    {editingTaskId !== task._id && (
                                                        <>
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => this.handleStartEdit(task)}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                color="secondary"
                                                                onClick={() => this.handleDelete(task._id)}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                </div>
                                            </Paper>
                                        ))}
                                    </div>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </div>
            </div>
        );
    }
}

export default App;
