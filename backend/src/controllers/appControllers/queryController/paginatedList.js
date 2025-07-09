const mongoose = require('mongoose');
const { paginationSchema } = require('./validations');

const Model = mongoose.model('Query');

const paginatedList = async (req, res) => {
  try {
    const { error, value } = paginationSchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Pagination validation error',
        errors: errors,
      });
    }

    const { page, limit, status } = value;
    const skip = (page - 1) * limit;

    const resultsPromise = Model.find({
      removed: { $ne: true },
      ...(status ? { status } : {}),
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name surname')
      .exec();

    const countPromise = Model.countDocuments({
      removed: { $ne: true },
      ...(status ? { status } : {}),
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
    console.error('Error fetching queries:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Error fetching queries: ' + error.message,
    });
  }
};

module.exports = paginatedList;
