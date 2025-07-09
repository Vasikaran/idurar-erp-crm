const mongoose = require('mongoose');

const Model = mongoose.model('Query');

const update = async (req, res) => {
  try {
    const { customerName, email, description, status, resolution } = req.body;

    const updateData = {};

    if (customerName) updateData.customerName = customerName;
    if (email) updateData.email = email;
    if (description) updateData.description = description;
    if (status) updateData.status = status;
    if (resolution) updateData.resolution = resolution;
    console.log('Update Data:', updateData);

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
        message: 'No query found',
      });
    }

    return res.status(200).json({
      success: true,
      result,
      message: 'Query updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error updating query: ' + error.message,
    });
  }
};

module.exports = update;
