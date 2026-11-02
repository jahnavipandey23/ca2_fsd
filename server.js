require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const feedbackRoutes = require("./routes/feedbackRoutes");
const errorHandler = require("./middleware/errorHandler");
const app = express();

app.use(express.json());
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Student Feedback Management API is running"
    });
});

app.use("/api/feedback", feedbackRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
};
startServer();
