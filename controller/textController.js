const OpenAI = require('openai');
const Tesseract = require('tesseract.js');


// Khởi tạo OpenAI API với API key
const openai = new OpenAI({
  apiKey: process.env.GPT_API_KEY
});
console.log("API key:", process.env.GPT_API_KEY);

exports.extractKeywordsEntities = async (req, res) => {
  const { text } = req.body;
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an assistant that extracts keywords and entities from text." },
        { role: "user", content: `Extract keywords and entities from the following text:\n\n"${text}"` },
      ],
      max_tokens: 150,
    });
  
    if (!response || !response.choices || response.choices.length === 0) {
      throw new Error("Invalid response from OpenAI API");
    }
  
    res.json({ result: response.choices[0].message.content.trim() });
  } catch (error) {
    console.error("Error occurred:", error.message);
    res.status(500).json({ error: error.message });
  }
};


  

exports.checkGrammar = async (req, res) => {
  const { text } = req.body;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful grammar-checking assistant." },
        { role: "user", content: `Check the grammar of the following text and suggest improvements:\n\n"${text}"` }
      ],
      max_tokens: 200,
    });

    // Extract the response text
    const result = response.choices[0].message.content.trim();
    
    // Define phrases that indicate correct grammar
    const correctGrammarIndicators = [
      "is grammatically correct",
      "no changes needed",
      "the grammar is correct"
    ];

    // Check if the response suggests that the grammar is already correct
    const isGrammarCorrect = correctGrammarIndicators.some(indicator =>
      result.toLowerCase().includes(indicator)
    );

    if (isGrammarCorrect) {
      res.json({ result: "CORRECT" });
    } else {
      // Remove introductory text and return the first suggestion sentence only
      const cleanResult = result.replace(/^.*?:\s*/, "").split("\n")[0];
      res.json({ result: cleanResult });
    }
  } catch (error) {
    console.error("Error checking grammar:", error.response ? error.response.data : error.message);
    res.status(500).send("Error checking grammar.");
  }
};



exports.summarizeText = async (req, res) => {
  const { text } = req.body;
  console.log("Input text:", text);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: `Summarize the following text:\n\n"${text}"` }
      ],
      max_tokens: 150,
    });
    const summary = response.choices[0].message.content.trim();
    //await updateStatistics('summarize', userId);
    res.json({ result: summary });
  } catch (error) {
    console.error("Error summarizing text:", error.response ? error.response.data : error.message);
    res.status(500).send("Error summarizing text.");
  }
};
exports.translateText = async (req, res) => {
  const { text, targetLanguage } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful translation assistant." },
        { role: "user", content: `Translate the following text to ${targetLanguage}:\n\n"${text}"` }
      ],
      max_tokens: 150,
    });

    // Lấy nội dung bản dịch từ phản hồi của API
    const translation = response.choices[0].message.content.trim();
    //await updateStatistics('translate', userId);
    res.json({ result: translation });
  } catch (error) {
    console.error("Error translating text:", error.response ? error.response.data : error.message);
    res.status(500).send("Error translating text.");
  }
};



exports.translateImage = async (req, res) => {
  console.log("Received file:", req.file);
  const imagePath = req.file.path;

  try {

    // OCR: Tách văn bản từ ảnh
    const result = await Tesseract.recognize(imagePath, 'eng+vie');
    const extractedText = result.data.text;
    console.log("Extracted text:", extractedText);
    // GPT API: Dịch văn bản
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: 'system',
          content: 'Bạn là một công cụ dịch ngôn ngữ.',
        },
        {
          role: 'user',
          content: `Hãy dịch đoạn văn sau từ tiếng Việt sang tiếng Anh:\n${extractedText}`,
        },
      ],
    });
    console.log("GPT response:", response);
    const translatedText = response.choices[0].message.content.trim();

    res.json({
      extractedText,
      translatedText,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Lỗi xử lý ảnh hoặc GPT' });
  }
}

