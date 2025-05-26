const mongoose = require('mongoose');

const textSchema = new mongoose.Schema({
    originalText: String,
    processedText: String,
    wordCount: Number,
    charCount: Number,
    paragraphCount: Number,
    sentenceCount: Number,
    entities: Array,
    keywords: Array,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Text = mongoose.model('Text', textSchema);

module.exports = Text;
