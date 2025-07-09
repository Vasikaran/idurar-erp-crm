const mongoose = require('mongoose');
const { createQuerySchema } = require('./validations');

const Model = mongoose.model('Query');

const create = async (req, res) => {
  try {
    const { error, value } = createQuerySchema.validate(req.body, {
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

    const queryData = {
      customerName: customerName.trim(),
      email: email.trim().toLowerCase(),
      description: description.trim(),
      status: status || 'open',
      resolution: resolution ? resolution.trim() : '',
      createdBy: req.admin._id,
    };

    const result = await new Model(queryData).save();
    await result.populate('createdBy', 'name surname email');

    return res.status(201).json({
      success: true,
      result,
      message: 'Query created successfully',
    });
  } catch (error) {
    console.error('Error creating query:', error);

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
      message: 'Error creating query: ' + error.message,
    });
  }
};

module.exports = create;
