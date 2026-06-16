const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

exports.createReport = async (req, res) => {
    try {

        const {
            nama_barang,
            status,
            lokasi,
            deskripsi,
            foto,
            tanggal_kejadian
        } = req.body;

        const id = uuidv4();

        const result = await pool.query(
            `
            INSERT INTO reports(
                id,
                user_id,
                nama_barang,
                status,
                lokasi,
                deskripsi,
                foto,
                tanggal_kejadian
            )
            VALUES($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *
            `,
            [
                id,
                req.user.id,
                nama_barang,
                status,
                lokasi,
                deskripsi,
                foto,
                tanggal_kejadian
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getAllReports = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                r.*,
                u.name,
                u.email
            FROM reports r
            JOIN users u
            ON r.user_id = u.id
            ORDER BY created_at DESC
        `);

        res.json(result.rows);

    } catch(error) {

        res.status(500).json({
            message:error.message
        });

    }
};

exports.getMyReports = async (req, res) => {

    try {

        const result = await pool.query(
            `
            SELECT *
            FROM reports
            WHERE user_id = $1
            ORDER BY created_at DESC
            `,
            [req.user.id]
        );

        res.json(result.rows);

    } catch(error) {

        res.status(500).json({
            message:error.message
        });

    }
};

exports.updateReport = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            nama_barang,
            status,
            lokasi,
            deskripsi,
            foto,
            tanggal_kejadian
        } = req.body;

        const result = await pool.query(
            `
            UPDATE reports
            SET
                nama_barang = $1,
                status = $2,
                lokasi = $3,
                deskripsi = $4,
                foto = $5,
                tanggal_kejadian = $6,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            AND user_id = $8
            RETURNING *
            `,
            [
                nama_barang,
                status,
                lokasi,
                deskripsi,
                foto,
                tanggal_kejadian,
                id,
                req.user.id
            ]
        );

        if(result.rows.length === 0){

            return res.status(404).json({
                message:"Data tidak ditemukan"
            });

        }

        res.json(result.rows[0]);

    } catch(error){

        res.status(500).json({
            message:error.message
        });

    }
};

exports.deleteReport = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `
            DELETE FROM reports
            WHERE id = $1
            AND user_id = $2
            RETURNING *
            `,
            [
                id,
                req.user.id
            ]
        );

        if(result.rows.length === 0){

            return res.status(404).json({
                message:"Data tidak ditemukan"
            });

        }

        res.json({
            message:"Berhasil dihapus"
        });

    } catch(error){

        res.status(500).json({
            message:error.message
        });

    }
};