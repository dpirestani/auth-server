const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');

const interpreterSchema = mongoose.Schema(
  {
    knownLanguages: {
      type: Array,
      required: true
    },
    preferredLanguage: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
interpreterSchema.plugin(toJSON);
interpreterSchema.plugin(paginate);


/**
 * @typedef Interpreter
 */
const Interpreter = mongoose.model('Interpreter', interpreterSchema);

module.exports = Interpreter;
