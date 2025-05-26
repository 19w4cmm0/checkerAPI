const mongoose = require('mongoose');

const summarizeSchema = new mongoose.Schema({
    content: String,
    result: String,
    userId: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Summarize = mongoose.model('Summarize',  summarizeSchema, "summarize");

module.exports = Summarize;
