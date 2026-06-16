const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

exports.googleLogin = async (req, res) => {

    try {

        const { idToken } = req.body;

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        const userId = payload.sub;
        const email = payload.email;
        const name = payload.name;
        const photo = payload.picture;

        await pool.query(
            `
            INSERT INTO users(
                id,
                email,
                name,
                photo_url
            )
            VALUES($1,$2,$3,$4)
            ON CONFLICT(email)
            DO NOTHING
            `,
            [userId,email,name,photo]
        );

        const token = jwt.sign(
            {
                id:userId,
                email
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"7d"
            }
        );

        res.json({
            token,
            user:{
                id:userId,
                email,
                name,
                photo
            }
        });

    } catch(error){
        res.status(500).json(error);
    }
};