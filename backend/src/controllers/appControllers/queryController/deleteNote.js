const mongoose = require('mongoose');
const { objectIdSchema } = require('./validations');

const Model = mongoose.model('Query');

const deleteNote = async (req, res) => {
  try {
    const idValidation = objectIdSchema.validate(req.params.id);
    if (idValidation.error) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid query ID format',
      });
    }

    const noteIdValidation = objectIdSchema.validate(req.params.noteId);
    if (noteIdValidation.error) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid note ID format',
      });
    }

    const { id, noteId } = req.params;

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

    const noteIndex = query.notes.findIndex((note) => note._id.toString() === noteId);

    if (noteIndex === -1) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Note not found',
      });
    }

    query.notes.splice(noteIndex, 1);
    await query.save();

    await query.populate('createdBy', 'name surname email');
    await query.populate('notes.createdBy', 'name surname');

    return res.status(200).json({
      success: true,
      result: query,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error deleting note: ' + error.message,
    });
  }
};

module.exports = deleteNote;
