const Task = require("../models/Task");

// create task (admin/manager)
exports.createTask = async (req, res) => {
  const { title, description, project, assignedTo } = req.body;

  const task = await Task.create({
    title,
    description,
    project,
    assignedTo,
    assignedBy: req.user._id,
  });

  res.status(201).json(task);
};

// get my tasks
exports.getMyTasks = async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.user._id })
    .populate("project", "name")
    .populate("assignedBy", "name");

  res.json(tasks);
};
