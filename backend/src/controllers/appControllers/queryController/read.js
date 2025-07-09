const mongoose = require('mongoose');

const Model = mongoose.model('Query');

const read = async (req, res) => {
  try {
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
        message: 'No query found',
      });
    } else {
      // Return success response
      return res.status(200).json({
        success: true,
        result,
        message: 'Query found successfully',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error reading query: ' + error.message,
    });
  }
};

module.exports = read;
