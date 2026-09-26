const Team = require("../models/Team");

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private (Admin, Manager)
exports.createTeam = async (req, res) => {
  try {
    const { name, description, project, members } = req.body;

    const team = await Team.create({
      name,
      description,
      project, 
      members, 
      createdBy: req.user._id,
    });

    const populatedTeam = await Team.findById(team._id)
      .populate("members", "name email department role")
      .populate("project", "name")
      .populate("createdBy", "name");

    res.status(201).json(populatedTeam);
  } catch (err) {
    res.status(500).json({ message: "Team create failed", error: err.message });
  }
};

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private (All users)
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("members", "name email department role")  // Full member details
      .populate("project", "name")                        // Project details
      .populate("createdBy", "name department");                    // Who created

    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed", error: err.message });
  }
};

// @desc    Update a team
// @route   PUT /api/teams/:id
// @access  Private (Admin, Manager)
exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, project, members } = req.body;

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    // Update fields
    if (name) team.name = name;
    if (description) team.description = description;
    if (project) team.project = project;
    if (members) team.members = members;

    const updatedTeam = await team.save();

    // Populate karke response bhejo
    const populatedTeam = await Team.findById(updatedTeam._id)
      .populate("members", "name email department role")
      .populate("project", "name")
      .populate("createdBy", "name");

    res.json(populatedTeam);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// @desc    Delete a team
// @route   DELETE /api/teams/:id
// @access  Private (Admin, Manager)
exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);
    
    if (!team) return res.status(404).json({ message: "Team not found" });

    await team.deleteOne();
    res.json({ message: "Team deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};