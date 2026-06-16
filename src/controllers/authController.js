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

        // 1. Gunakan ON CONFLICT DO UPDATE dan tambahkan RETURNING *
        const result = await pool.query(
            `
            INSERT INTO users(id, email, name, photo_url)
            VALUES($1, $2, $3, $4)
            ON CONFLICT(email) 
            DO UPDATE SET 
                name = EXCLUDED.name,
                photo_url = EXCLUDED.photo_url
            RETURNING *
            `,
            [userId, email, name, photo]
        );

        // 2. Ambil data user yang sebenarnya dari hasil query database
        const dbUser = result.rows[0];

        // 3. Gunakan ID asli dari database untuk JWT payload (lebih aman)
        const token = jwt.sign(
            {
                id: dbUser.id,
                email: dbUser.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // 4. Kembalikan data user yang sesuai dengan database
        res.json({
            token,
            user: {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
                photo: dbUser.photo_url 
            }
        });

    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};