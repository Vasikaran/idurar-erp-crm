const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('Query');

const create = require('./create');
const read = require('./read');
const update = require('./update');
const remove = require('./remove');
const paginatedList = require('./paginatedList');
const addNote = require('./addNote');
const deleteNote = require('./deleteNote');

methods.create = create;
methods.read = read;
methods.update = update;
methods.delete = remove;
methods.list = paginatedList;
methods.addNote = addNote;
methods.deleteNote = deleteNote;

module.exports = methods;
