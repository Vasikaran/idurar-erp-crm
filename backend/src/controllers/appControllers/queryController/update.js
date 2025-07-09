const mongoose = require('mongoose');
const { updateQuerySchema, objectIdSchema } = require('./validations');

const Model = mongoose.model('Query');

const update = async (req, res) => {
  try {
    const idValidation = objectIdSchema.validate(req.params.id);
    if (idValidation.error) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid query ID format',
      });
    }

    const { error, value } = updateQuerySchema.validate(req.body, {
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

    const { customerName, email, description, status, resolution } = value;

    const updateData = {};
    if (customerName) updateData.customerName = customerName.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (description) updateData.description = description.trim();
    if (status) updateData.status = status;
    if (resolution) updateData.resolution = resolution.trim();

    const result = await Model.findOneAndUpdate(
      { _id: req.params.id, removed: { $ne: true } },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('createdBy', 'name surname email')
      .populate('notes.createdBy', 'name surname')
      .exec();

    if (!result) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Query not found',
      });
    }

    return res.status(200).json({
      success: true,
      result,
      message: 'Query updated successfully',
    });
  } catch (error) {
    console.error('Error updating query:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Database validation error',
        errors: errors,
      });
    }

    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error updating query: ' + error.message,
    });
  }
};

module.exports = update;
