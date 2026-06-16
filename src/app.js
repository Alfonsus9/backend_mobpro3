const express = require("express");
const cors = require("cors");

const authRoutes =
    require("./routes/authRoutes");

const reportRoutes =
    require("./routes/reportRoutes");

const app = express();

app.use(cors());
app.use(express.json());



app.use("/auth", authRoutes);
app.use("/reports", reportRoutes);

module.exports = app;