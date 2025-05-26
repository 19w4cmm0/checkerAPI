const reWriteTextRoutes = require("./reWriteText.route");
const authRoutes = require("./auth.route");
const grammarRoutes = require("./grammar.route");
const userRoutes = require("./user.route");
const summarizeRoutes = require("./summarize.route");
const translateRoutes = require("./translate.route");
const imgRoutes = require("./img.route");
const statisticsRoutes = require('./statistics.route');

module.exports = (app) => {
    // Định nghĩa route cho API /api/text/process
    app.use("/api/text", reWriteTextRoutes);
    app.use("/api/auth", authRoutes);
    app.use("/api/grammar", grammarRoutes);
    app.use("/api/summarize", summarizeRoutes);
    app.use("/api/translate", translateRoutes);
    app.use("/api/user", userRoutes);
    app.use("/api/image", imgRoutes);
    app.use("/api/statistics", statisticsRoutes);
};
