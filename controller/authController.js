const User = require("../models/user.model");
const bcrypt = require("bcrypt");

// [POST] /api/auth/register
module.exports.register = async (req, res) => {
  const { email, password } = req.body;
  const existEmail = await User.findOne({ email: email });

  if (existEmail) {
    res.json({
      code: 400,
      message: "Email đã tồn tại!",
    });
  } else {
    // Mã hóa mật khẩu
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = new User({ email, password: hashedPassword });
    user.save();
    // Tạo cookie với token
    const token = user.tokenUser;
    const expiresTime = 1000 * 60 * 60 * 24 * 365; // 1 năm
    res.cookie("tokenUser", token, {
      expires: new Date(Date.now() + expiresTime),
      path: "/",
    });

    res.json({
      code: 200,
      message: "Đăng ký thành công!",
      tokenUser: token,
    });
  }
};

// // [POST] /api/auth/login
// module.exports.login = async (req, res) => {
//   console.log("Login request received:", req.body);
//   const { email, password } = req.body;

//   const user = await User.findOne({
//     email: email,
//   });

//   if (!user) {
//     res.json({
//       code: 400,
//       message: "Email không tồn tại!",
//     });
//     return;
//   }
//   // Kiểm tra mật khẩu
//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) {
//     return res.status(401).json({
//       code: 401,
//       message: "Mật khẩu không đúng!",
//     });
//   }
//   // Tạo cookie với token
//   const token = user.tokenUser;
//   const expiresTime = 1000 * 60 * 60 * 24 * 30; // 1 tháng
//   res.cookie("tokenUser", token, {
//     expires: new Date(Date.now() + expiresTime),
//     path: "/",
//   });

//   res.json({
//     email: user.email,
//     code: 200,
//     message: "Đăng nhập thành công!",
//   });
// };
// [POST] /api/auth/login
module.exports.login = async (req, res) => {
  console.log("Login request received:", req.body);
  
  // Hỗ trợ cả username và email
  const { email, username, password } = req.body;
  const loginField = email || username;

  if (!loginField || !password) {
    return res.status(400).json({
      code: 400,
      message: "Vui lòng nhập đầy đủ thông tin!",
    });
  }

  try {
    // Tìm user bằng email hoặc username
    const user = await User.findOne({
      $or: [
        { email: loginField },
        { username: loginField }
      ]
    });

    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "Tài khoản không tồn tại!",
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        code: 400,
        message: "Mật khẩu không đúng!",
      });
    }

    // Tạo cookie với token
    const token = user.tokenUser;
    const expiresTime = 1000 * 60 * 60 * 24 * 30; // 1 tháng
    
    res.cookie("tokenUser", token, {
      expires: new Date(Date.now() + expiresTime),
      path: "/",
    });

    // Trả về format mà Flutter app expect
    res.status(200).json({
      code: 200,
      message: "Đăng nhập thành công!",
      token: token, // Flutter expect field này
      user: {      // Flutter expect object này
        _id: user._id,
        username: user.username,
        email: user.email,
        // Thêm các field khác nếu cần
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      code: 500,
      message: "Lỗi server, vui lòng thử lại!",
    });
  }
};
