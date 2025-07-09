const mongoose = require('mongoose');

const Model = mongoose.model('Query');

const addNote = async (req, res) => {
  try {
    const { content } = req.body;
    const { id } = req.params;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Note content is required',
      });
    }

    const query = await Model.findOne({
      _id: id,
      removed: { $ne: true },
    });

    if (!query) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Query not found',
      });
    }

    const note = {
      content: content.trim(),
      createdBy: req.admin._id,
      createdAt: new Date(),
    };

    query.notes.push(note);
    await query.save();

    await query.populate('createdBy', 'name surname email');
    await query.populate('notes.createdBy', 'name surname');

    return res.status(200).json({
      success: true,
      result: query,
      message: 'Note added successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error adding note: ' + error.message,
    });
  }
};

module.exports = addNote;
