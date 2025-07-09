const mongoose = require('mongoose');

const Model = mongoose.model('Query');

const remove = async (req, res) => {
  try {
    const result = await Model.findOneAndUpdate(
      { _id: req.params.id, removed: { $ne: true } },
      { removed: true },
      {
        new: true,
      }
    ).exec();

    if (!result) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No query found',
      });
    }

    return res.status(200).json({
      success: true,
      result,
      message: 'Query deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error deleting query: ' + error.message,
    });
  }
};

module.exports = remove;
