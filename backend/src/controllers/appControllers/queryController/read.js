const mongoose = require('mongoose');
const { objectIdSchema } = require('./validations');

const Model = mongoose.model('Query');

const read = async (req, res) => {
  try {
    const { error } = objectIdSchema.validate(req.params.id);

    if (error) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid query ID format',
      });
    }

    const result = await Model.findOne({
      _id: req.params.id,
      removed: { $ne: true },
    })
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
      message: 'Query found successfully',
    });
  } catch (error) {
    console.error('Error reading query:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error reading query: ' + error.message,
    });
  }
};

module.exports = read;
