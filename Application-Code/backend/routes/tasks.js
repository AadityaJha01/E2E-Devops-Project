const Task = require("../models/task");
const express = require("express");
const router = express.Router();

// Create a new task
router.post("/", async (req, res) => {
    try {
        const task = await new Task(req.body).save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Get all tasks with optional filtering, searching, and sorting
router.get("/", async (req, res) => {
    try {
        const { 
            completed, 
            priority, 
            category, 
            search, 
            sortBy = "createdAt",
            sortOrder = "desc"
        } = req.query;
        
        // Build query
        const query = {};
        if (completed !== undefined) {
            query.completed = completed === "true";
        }
        if (priority) {
            query.priority = priority;
        }
        if (category) {
            query.category = category;
        }
        if (search) {
            query.task = { $regex: search, $options: "i" };
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;

        const tasks = await Task.find(query).sort(sort);
        res.send(tasks);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get statistics
router.get("/stats", async (req, res) => {
    try {
        const total = await Task.countDocuments();
        const completed = await Task.countDocuments({ completed: true });
        const pending = total - completed;
        
        const byPriority = {
            high: await Task.countDocuments({ priority: "high", completed: false }),
            medium: await Task.countDocuments({ priority: "medium", completed: false }),
            low: await Task.countDocuments({ priority: "low", completed: false }),
        };

        const byCategory = await Task.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const overdue = await Task.countDocuments({
            completed: false,
            dueDate: { $lt: new Date(), $ne: null }
        });

        res.send({
            total,
            completed,
            pending,
            byPriority,
            byCategory,
            overdue
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Update a task
router.put("/:id", async (req, res) => {
    try {
        // If marking as completed, set completedAt timestamp
        if (req.body.completed === true && !req.body.completedAt) {
            req.body.completedAt = new Date();
        } else if (req.body.completed === false) {
            req.body.completedAt = null;
        }

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!task) {
            return res.status(404).send({ error: "Task not found" });
        }
        
        res.send(task);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Delete a task
router.delete("/:id", async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).send({ error: "Task not found" });
        }
        res.send(task);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
