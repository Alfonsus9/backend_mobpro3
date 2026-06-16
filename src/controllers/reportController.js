const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "lost-found"
            },
            (error, result) => {

                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }

            }
        );

        streamifier
            .createReadStream(buffer)
            .pipe(stream);

    });
};

exports.createReport = async (req, res) => {

    try {

        const {
            nama_barang,
            status,
            lokasi,
            deskripsi,
            tanggal_kejadian
        } = req.body;

        // Validasi sederhana
        if (
            !nama_barang ||
            !status ||
            !lokasi ||
            !tanggal_kejadian
        ) {
            return res.status(400).json({
                message: "Field wajib belum lengkap"
            });
        }

        let fotoUrl = null;

        // Upload foto ke Cloudinary jika ada
        if (req.file) {

            const uploadResult =
                await uploadToCloudinary(
                    req.file.buffer
                );

            fotoUrl =
                uploadResult.secure_url;
        }

        const reportId = uuidv4();

        const result = await pool.query(
            `
            INSERT INTO reports (
                id,
                user_id,
                nama_barang,
                status,
                lokasi,
                deskripsi,
                foto,
                tanggal_kejadian
            )
            VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8
            )
            RETURNING *
            `,
            [
                reportId,
                req.user.id,
                nama_barang,
                status,
                lokasi,
                deskripsi,
                fotoUrl,
                tanggal_kejadian
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Laporan berhasil dibuat",
            data: null
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
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

        return res.status(200).json({
            success: true,
            message: "data berhasil diambil",
            data: result.rows
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
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

        return res.status(200).json({
            success: true,
            message: "data berhasil diambil",
            data: result.rows
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
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
            tanggal_kejadian
        } = req.body;

        // Ambil laporan lama
        const oldReport = await pool.query(
            `
            SELECT *
            FROM reports
            WHERE id = $1
            AND user_id = $2
            `,
            [
                id,
                req.user.id
            ]
        );

        if (oldReport.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Laporan tidak ditemukan"
            });
        }

        let fotoUrl = oldReport.rows[0].foto;

        // Jika upload foto baru
        if (req.file) {

            const uploadResult =
                await uploadToCloudinary(
                    req.file.buffer
                );

            fotoUrl =
                uploadResult.secure_url;
        }

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
                fotoUrl,
                tanggal_kejadian,
                id,
                req.user.id
            ]
        );

        return res.json({
            success: true,
            message: "Laporan berhasil diperbarui",
            data: null
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
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

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Data tidak ditemukan"
            });

        }

        res.json({
            message: "Berhasil dihapus"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};