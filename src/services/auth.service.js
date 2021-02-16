const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const getVideoId = require('get-video-id');
const sys = require('sys')
const exec = require('child_process').exec;
const compose = require('docker-compose');



/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return user;
};

const runProcess = async () => {

  const BBB_URL="https://staging.conference.walkerit.dev/bigbluebutton/api"
  const BBB_SECRET="BTuVERx5HDGs6jy4Kvao4Ft4tEQBcM8X8heQ2y33c"
  const BBB_START_MEETING="false"
  const BBB_ATTENDEE_PASSWORD="IVLHwOBSVmYP"
  const BBB_MODERATOR_PASSWORD="JjeQYksarqLQ"
  const BBB_MEETING_TITLE="liveStreaming"
  const BBB_DOWNLOAD_MEETING="true"
  const BBB_INTRO="false"
  const BBB_STREAM_URL="rtmp://a.rtmp.youtube.com/live2/34a9-gsc6-y8ws-4gth-9ztj"
  const BBB_CUSTOM_CSS=""
  const TZ="Europe/Vienna"

compose.upAll({ cwd: '/home/ubuntu/auth-server/src/additional/bbb-streaming', log: true })
  .then(
    () => { console.log('done')},
    err => { console.log('something went wrong:', err.message)}
  );

  //let child;
  // executes `pwd`
//  child = exec("/home/ubuntu/auth-server/src/additional/startStream.sh",[BBB_URL,BBB_SECRET,BBB_START_MEETING,BBB_ATTENDEE_PASSWORD,BBB_MODERATOR_PASSWORD,BBB_MEETING_TITLE,BBB_DOWNLOAD_MEETING,BBB_INTRO,BBB_STREAM_URL,BBB_CUSTOM_CSS,TZ], function (error, stdout, stderr) {
  //  console.log('stdout: ' + stdout);
  //  console.log('stderr: ' + stderr);
 //   if (error !== null) {
 //     console.log('exec error: ' + error);
 //   }
//  });
}

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};


const getYouTubeVideo = async (data) => {
  if(!data.meetingId) {
    return {
      status: false,
      message: 'Video not found/created',
      data: { }
    }
  }
  const url = 'https://www.youtube.com/channel/UCnDCaneRZE7O4MYpdkJhKCg/live'
  const { id } = getVideoId(url);

  return {
    status: true,
    message: 'Video Foudn successfully',
    data: { url, id }
  }
};


/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
    await userService.updateUserById(user.id, { password: newPassword });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  getYouTubeVideo,
  runProcess
};
