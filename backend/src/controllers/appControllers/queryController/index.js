const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('Query');

const create = require('./create');
const read = require('./read');
const update = require('./update');
const remove = require('./remove');

methods.create = create;
methods.read = read;
methods.update = update;
methods.delete = remove;

module.exports = methods;
