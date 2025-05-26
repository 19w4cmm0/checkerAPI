const mongoose = require('mongoose');

const grammarSchema = new mongoose.Schema({
    content: String,
    result: String,
    userId: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Grammar = mongoose.model('Grammar', grammarSchema, "grammar");

module.exports = Grammar;
