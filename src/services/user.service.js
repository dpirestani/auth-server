const httpStatus = require('http-status');
const multer = require('multer');
const AWS = require('aws-sdk');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const config = require('./../config/config')

const  AWS_ACCESS_KEY = config.aws.awsAccessKey;
const AWS_SECRET_KEY = config.aws.awsSecretKey; 
const AWS_REGION = config.aws.awsregion; 
const AWS_BUCKET_NAME = config.aws.awsBucketName;

const s3 = new AWS.S3({ accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY });

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const user = await User.create(userBody);
  return user;
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

const uploadToS3 = async (request) => {
  const storage = multer.memoryStorage();
  const upload = multer({ storage });

  return new Promise((resolve, reject) => {
    upload.any()(request, response, async (err) => {
      if (err) {
        return reject(err);
      }
      const fileArr = request.files;
      const uploadResult = await uploadFileToS3(fileArr[0]);
      if (uploadResult) {
        return resolve({ success: true, message: FILE_UPLOAD_SUCCESS, data: { url: uploadResult.Location } });
      } else {
        return reject({ success: false, message: FILE_UPLOAD_FAIL, data: { url: '' } });
      }
    });
  });
};


const uploadFileToS3 = async (file, options = {}) => {
  const buffer = file.buffer;
  const fileName = file.originalName ? `${file.originalName}_${String(Date.now())}` : String(Date.now());
  return new Promise((resolve, reject) => {
    return s3.upload({
      Bucket: AWS_BUCKET_NAME,
      ACL: 'public-read',
      Key: fileName,
      Body: buffer,
    }, (err, result) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  uploadToS3
};
