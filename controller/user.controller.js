const User = require("../models/user.model");

// module.exports.getUser = async (req, res) => {
//     try {
//         const token = req.body.tokenUser;
//         const resUser = await User.findOne({ tokenUser: token});
//         res.json(resUser);
//     } catch(err) {
//         console.log("err")
//         res.json(err);
//     }
// }
module.exports.getUser = async (req, res) => {
    try {
        // Lấy token từ body hoặc header
        const tokenFromBody = req.body.tokenUser;
        const authHeader = req.headers.authorization;
        const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.split(' ')[1] 
            : null;

        const token = tokenFromBody || tokenFromHeader;

        if (!token) {
            return res.status(401).json({
                code: 401,
                message: "Không tìm thấy token!"
            });
        }

        const user = await User.findOne({ tokenUser: token });
        if (!user) {
            return res.status(401).json({
                code: 401,
                message: "Token không hợp lệ hoặc người dùng không tồn tại!"
            });
        }

        // Trả về dữ liệu với định dạng { "data": {...} }
        res.status(200).json({
            code: 200,
            message: "Lấy thông tin người dùng thành công!",
            data: {
                _id: user._id,
                email: user.email,
                username: user.username // Nếu có
            }
        });
    } catch (err) {
        console.error("Error in getUser:", err);
        res.status(500).json({
            code: 500,
            message: "Lỗi server, vui lòng thử lại!",
            error: err.message
        });
    }
};