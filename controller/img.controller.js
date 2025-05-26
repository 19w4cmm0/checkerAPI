const Image = require("../models/img.model");
const mongoose = require("mongoose");

module.exports.image = async (req, res) => {
    try {
        const { _id, userId, content, result } = req.body;
        console.log("Content:", content)
        const id = new mongoose.Types.ObjectId(_id);
        // Tìm tài liệu grammar với userId đã cho
        let image  = await Image.findOne({ _id: id });

        if (image) {
          // Nếu đã có, cập nhật content và result
          image.content = content;
          image.result = result;
          await image.save();
        } else {
          // Nếu chưa có, tạo mới
          image = new Image({ userId, content, result });
          await image.save();
        }
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
};
module.exports.getImage = async (req, res) => {
  if (req.body.userId) {
    const userId = req.body.userId;
    const response = await Image.find({ userId: userId });
    res.json(response);
  }
};
module.exports.deleteImage = async (req, res) => {
    try {
        const id = req.params.id;
        await Image.deleteOne({ _id: id})

        res.json({
            code: 200,
            message: "Xóa thành công!"
        })
    } catch(err) {
        res.json({
            code: 400,
            message: "ERROR!"
        })
    }
}