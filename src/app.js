const express = require("express");
const cors = require("cors");

const authRoutes =
    require("./routes/authRoutes");

const {} =
    require("./routes/reportRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API Running",
        service: "Backend Mobpro 3",
        timestamp: new Date().toISOString()
    });
});

app.use("/auth", authRoutes);
app.use("/reports", reportRoutes);

module.exports = app;