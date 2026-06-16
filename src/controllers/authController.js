const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

exports.googleLogin = async (req, res) => {
    console.log("🔥 CONTROLLER MASUK");
    console.log(req.body);

    return res.json({
        ok: true,
        body: req.body
    });
};