const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { interpreterService } = require('../services');

const createInterpreter = catchAsync(async (req, res) => {
  const user = await interpreterService.createInterpreter(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getInterpreters = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['prefferedLanguage']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await interpreterService.queryInterpreter(filter, options);
  res.send(result);
});

const getInterpreter = catchAsync(async (req, res) => {
  console.log("I have got this====",req.params, req.query)
  const user = await interpreterService.queryInterpreterByIdWithUser(req.query.interpreterId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Interpreter not found');
  }
  res.send(user);
});

const updateInterpreter = catchAsync(async (req, res) => {
  const user = await interpreterService.updateInterpreterById(req.params.interpreterId, req.body);
  res.send(user);
});

const deleteInterpreter = catchAsync(async (req, res) => {
  await interpreterService.deleteInterpreterById(req.params.interpreterId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createInterpreter,
  getInterpreters,
  getInterpreter,
  updateInterpreter,
  deleteInterpreter,
};
