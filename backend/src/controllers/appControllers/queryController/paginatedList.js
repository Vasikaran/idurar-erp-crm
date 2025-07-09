const mongoose = require('mongoose');

const Model = mongoose.model('Query');

const paginatedList = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = page * limit - limit;

    const resultsPromise = Model.find({
      removed: { $ne: true },
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name surname')
      .exec();

    const countPromise = Model.countDocuments({
      removed: { $ne: true },
    });

    const [result, count] = await Promise.all([resultsPromise, countPromise]);

    const pages = Math.ceil(count / limit);

    const pagination = {
      page: parseInt(page),
      pages,
      count,
    };

    if (count > 0) {
      return res.status(200).json({
        success: true,
        result,
        pagination,
        message: 'Successfully found all queries',
      });
    } else {
      return res.status(203).json({
        success: true,
        result: [],
        pagination,
        message: 'No queries found',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error fetching queries: ' + error.message,
    });
  }
};

module.exports = paginatedList;
