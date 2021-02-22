const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, emailService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});


const sendEmail = catchAsync(async (req,res) =>{
  const {to, subject='Enquiry Form', text } = req.body
  const salesRep = 'daniel@walkerit.dev'
  const ackSub = 'Thank you for contacting - WalkerIT'
  const sendEmailToSales = await emailService.sendEmail(salesRep, subject, text);
  const sendEmailToUser = await emailService.sendEmail(to, ackSub, 'Thank you contacting WalkerIT your “Always Be Coding” (ABC) experts!  One of our solution experts will be contacting you within the next 12-24 hours!');
  if(!sendEmailToSales || !sendEmailToUser) {
    return res.send({
      success: false,
      msg: 'sent the email',
      data: {sendEmailToSales,sendEmailToUser }
    })
  }
  return res.send({
    success: true,
    msg: 'sent the email',
    data: {sendEmailToSales,sendEmailToUser }
  })

})
const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  sendEmail
};
