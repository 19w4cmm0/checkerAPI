const express = require('express');
const router = express.Router();
const multer = require('multer');

// Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Controller
const {
  extractKeywordsEntities,
  checkGrammar,
  summarizeText,
  translateText,
  translateImage
} = require('../controller/textController');

// Các route xử lý
router.post('/extract-keywords-entities', extractKeywordsEntities);
router.post('/check-grammar', checkGrammar);
router.post('/summarize-text', summarizeText);
router.post('/translate-text', translateText);
router.post('/translate-image', upload.single('image'), translateImage);

module.exports = router;
