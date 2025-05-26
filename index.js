const express = require('express');
const cors = require('cors');
const app = express();
const database = require("./config/database");
const route = require("./routes/index.route");
const cookieParser = require('cookie-parser');
const multer = require('multer');
const rateLimit = require("express-rate-limit");
const bodyParser = require('body-parser');
const OpenAI = require('openai');
require('dotenv').config();

// Kết nối database
database.connect();

// Cho phép tất cả origin truy cập
app.use(cors({
  origin: '*', // Cho phép mọi domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Các phương thức HTTP được phép
  allowedHeaders: ['Content-Type', 'Authorization'], // Các header được phép
  credentials: true // Cho phép gửi cookie hoặc thông tin đăng nhập (nếu cần)
}));

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser('XXXXXXXXXX'));

// Giới hạn số lần gọi API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 1000, // Giới hạn 1000 request
  handler: (req, res) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ error: "Quá nhiều yêu cầu, thử lại sau!" });
  },
});
app.use(limiter);

// Khởi tạo OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Cấu hình lưu file ảnh (tạm thời dùng diskStorage, sẽ sửa cho Vercel)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Định nghĩa route
route(app);

// Cấu hình EJS (nếu cần)
app.set('view engine', 'ejs');
app.set('views', './views');

// Khởi chạy server
const port = process.env.PORT || 5000; // Sử dụng PORT từ Vercel hoặc fallback về 5000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});