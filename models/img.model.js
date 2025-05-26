const mongose = require("mongoose");
const imgSchema = new mongose.Schema({
  content: String,
  result: String,
  userId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Image = mongose.model("Image", imgSchema, "image");
module.exports = Image;
