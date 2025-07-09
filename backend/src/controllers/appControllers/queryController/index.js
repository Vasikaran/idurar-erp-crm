const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('Query');

const create = require('./create');
const read = require('./read');
const update = require('./update');
const remove = require('./remove');
const paginatedList = require('./paginatedList');

methods.create = create;
methods.read = read;
methods.update = update;
methods.delete = remove;
methods.list = paginatedList;

module.exports = methods;
