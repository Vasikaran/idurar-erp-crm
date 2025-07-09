const mongoose = require('mongoose');
const { addNoteSchema, objectIdSchema } = require('./validations');

const Model = mongoose.model('Query');

const addNote = async (req, res) => {
  try {
    const idValidation = objectIdSchema.validate(req.params.id);
    if (idValidation.error) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid query ID format',
      });
    }

    const { error, value } = addNoteSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Validation error',
        errors: errors,
      });
    }

    const { content } = value;

    const query = await Model.findOne({
      _id: req.params.id,
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

    return res.status(201).json({
      success: true,
      result: query,
      message: 'Note added successfully',
    });
  } catch (error) {
    console.error('Error adding note:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error adding note: ' + error.message,
    });
  }
};

module.exports = addNote;
