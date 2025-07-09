const mongoose = require('mongoose');

const Model = mongoose.model('Query');

const create = async (req, res) => {
  try {
    const { customerName, email, description, status, resolution } = req.body;

    let query = {
      customerName,
      email,
      description,
      status: status || 'open',
      resolution: resolution || '',
      createdBy: req.admin._id,
    };

    const result = await new Model(query).save();

    await result.populate('createdBy', 'name surname email');

    return res.status(200).json({
      success: true,
      result,
      message: 'Query created successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error creating query: ' + error.message,
    });
  }
};

module.exports = create;
