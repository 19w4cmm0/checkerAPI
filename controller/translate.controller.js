const Translate = require("../models/translate.model");
const mongoose = require("mongoose");
const { updateStatistics } = require('./statistics.controller');

module.exports.translate = async (req, res) => {
  try {
    const { _id, userId, content, result } = req.body;
    // const id = new mongoose.Types.ObjectId(_id);
    // // Tìm tài liệu translate với userId đã cho
    // let translate = await Translate.findOne({ _id: id });

    // if (translate) {
    //   // Nếu đã có, cập nhật content và result
    //   translate.content = content;
    //   translate.result = result;
    //   await translate.save();
    // } else {
    //   // Nếu chưa có, tạo mới
    //   translate = new Translate({ userId, content, result });
    //   await translate.save();
    // }
    let translate;
    if (_id && mongoose.Types.ObjectId.isValid(_id)) {
      // Nếu _id hợp lệ, tìm và cập nhật
      const id = new mongoose.Types.ObjectId(_id);
      translate = await Translate.findOne({ _id: id });

      if (translate) {
        translate.content = content;
        translate.result = result;
        await translate.save();
      } else {
        return res.status(404).json({
          code: 404,
          message: "Không tìm thấy bản ghi Translate với ID này!",
        });
      }
    } else {
      // Nếu _id không hợp lệ hoặc không có, tạo mới
      translate = new Translate({ userId, content, result });
      await translate.save();
    }

    // Cập nhật thống kê
    await updateStatistics("translate", userId);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports.getTranslate = async (req, res) => {
  if (req.body.userId) {
    const userId = req.body.userId;
    const response = await Translate.find({ userId: userId });
    res.status(200).json({
      code: 200,
      message: "Lấy lịch sử dịch thành công!",
      data: response.map((item) => ({
        _id: item._id,
        userId: item.userId,
        content: item.content,
        result: item.result,
        targetLanguage: item.targetLanguage, // Nếu có
      })),
    });
  }
};
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Translate.deleteOne({ _id: id });

    res.json({
      code: 200,
      message: "Xóa thành công!",
    });
  } catch (err) {
    res.json({
      code: 400,
      message: "ERROR!",
    });
  }
};
