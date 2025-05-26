const mongoose = require('mongoose');

const statisticsSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['grammar', 'translate', 'summarize'],
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        default: 0,
    },
    date: {
        type: String, // Định dạng "YYYY-MM-DD"
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Statistics = mongoose.model('Statistics', statisticsSchema, 'statistics');

module.exports = Statistics;