const Grammar = require("../models/grammar.model");
const mongoose = require("mongoose");
const { updateStatistics } = require('./statistics.controller');

module.exports.grammar = async (req, res) => {
    try {
        const { _id, userId, content, result } = req.body;
        // console.log("Grammar", req.body);
        // const id = new mongoose.Types.ObjectId(_id);
        // console.log("Grammar ID:", id);
        // // Tìm tài liệu grammar với userId đã cho

        // let grammar = await Grammar.findOne({ _id: id });
        // console.log("Grammar found:", grammar);
        // if (grammar) {
        //   // Nếu đã có, cập nhật content và result
        //   grammar.content = content;
        //   grammar.result = result;
        //   await grammar.save();
        // } else {
        //   // Nếu chưa có, tạo mới
        //   grammar = new Grammar({ userId, content, result });
        //   await grammar.save();
        // }
        // await updateStatistics('grammar', userId);
        let grammar;
        if (_id && mongoose.Types.ObjectId.isValid(_id)) {
            // Nếu _id hợp lệ, tìm và cập nhật
            const id = new mongoose.Types.ObjectId(_id);
            grammar = await Grammar.findOne({ _id: id });

            if (grammar) {
                grammar.content = content;
                grammar.result = result;
                await grammar.save();
            } else {
                return res.status(404).json({
                    code: 404,
                    message: "Không tìm thấy bản ghi Grammar với ID này!",
                });
            }
        } else {
            // Nếu _id không hợp lệ hoặc không có, tạo mới
            grammar = new Grammar({ userId, content, result });
            await grammar.save();
        }

        // Cập nhật thống kê
        await updateStatistics('grammar', userId);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
};
module.exports.getGrammar = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'Thiếu userId trong body yêu cầu' });
    }

    const response = await Grammar.find({ userId });
    res.status(200).json({ data: response });
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu Grammar:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu Grammar' });
  }
};
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await Grammar.deleteOne({ _id: id})

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