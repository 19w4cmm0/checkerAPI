const express = require('express');
const cors = require('cors'); // Import cors
const app = express();
const database = require("./config/database");
const route = require("./routes/index.route");
const cookieParser = require('cookie-parser')
const multer = require('multer');
const rateLimit = require("express-rate-limit");

const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

// Kết nối database
database.connect();

// Giới hạn số lần gọi API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  handler: (req, res) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ error: "Quá nhiều yêu cầu, thử lại sau!" });
  },
});
app.use(limiter);

// Sử dụng middleware để parse JSON
app.use(express.json());


const corsOptions = {
  origin: [
    'http://localhost:3000',  // Flutter web default port
    'http://127.0.0.1:3000',
    'http://localhost:44762',  // Có thể là port khác
    'http://127.0.0.1:64522',
    'http://localhost:5000',  // Nếu cùng port
    'http://127.0.0.1:5000'
  ],
  credentials: true, // Cho phép gửi cookie hoặc các thông tin đăng nhập
};
// Xử lý preflight requests
app.options('*', cors());

app.use(cors(corsOptions));
app.use(bodyParser.json());

const OpenAI = require('openai');

// Khởi tạo OpenAI API với API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
// Định nghĩa route
route(app);
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(cookieParser('XXXXXXXXXX'));


// Cấu hình lưu file ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Khởi chạy server
const port = 5000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
