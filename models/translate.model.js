const mongoose = require('mongoose');

const translateSchema = new mongoose.Schema({
    content: String,
    result: String,
    userId: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Translate = mongoose.model('Translate', translateSchema, "translate");

module.exports = Translate;
