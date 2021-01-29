const httpStatus = require('http-status');
const { Interpreter } = require('../models');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

/**
 * Create a interpreter
 * @param {Object} interpreterBody
 * @returns {Promise<Interpreter>}
 */
const createInterpreter = async (interpreterBody) => {
  const interpreter = await Interpreter.create(interpreterBody);
  return interpreter;
};

/**
 * Query for interpreters 
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryInterpreter = async (filter, options) => {
  const interpreters = await Interpreter.paginate(filter, options);
  return interpreters;
};



/**
 * Get interpreter by id
 * @param {ObjectId} id
 * @returns {Promise<Interpreter>}
 */
const getInterpreterById = async (id) => {
  console.log("This is id=====", id);
  return Interpreter.findById(id);
};

/**
 * Get interpreter by id
 * @param {ObjectId} id
 * @returns {Promise<Interpreter>}
 */
const queryInterpreterByIdWithUser = async (id) => {
  return Interpreter.aggregate([
    { $match: 
      { _id: 
        mongoose.Types.ObjectId(id) 
      } 
    },
    { $lookup:
       {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'users'
       } 
    },{
      $unwind: '$users'
    },{
      $project: {
        'users.password':0
      }
    }
  ])
}

/**
 * Get interpreter by email
 * @param {string} preferredLanguage
 * @returns {Promise<Interpreter>}
 */
const getInterpreterByLanguage = async (preferredLanguage) => {
  return Interpreter.findOne({ preferredLanguage });
};

/**
 * Update interpreter by id
 * @param {ObjectId} interpreterId
 * @param {Object} updateBody
 * @returns {Promise<Interpreter>}
 */
const updateInterpreterById = async (interpreterId, updateBody) => {
  const interpreter = await getInterpreterById(interpreterId);
  if (!interpreter) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Interpreter not found');
  }

  Object.assign(interpreter, updateBody);
  await interpreter.save();
  return interpreter;
};

/**
 * Delete interpreter by id
 * @param {ObjectId} interpreterId
 * @returns {Promise<Interpreter>}
 */
const deleteInterpreterById = async (interpreterId) => {
  const interpreter = await getInterpreterById(interpreterId);
  if (!interpreter) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Interpreter not found');
  }
  await interpreter.remove();
  return interpreter;
};

module.exports = {
  createInterpreter,
  queryInterpreter,
  getInterpreterById,
  getInterpreterByLanguage,
  updateInterpreterById,
  deleteInterpreterById,
  queryInterpreterByIdWithUser
}
