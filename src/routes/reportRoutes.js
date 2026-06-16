const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const upload =
    require("../middleware/uploadMiddleware");

const reportController =
    require("../controllers/reportController");

/**
 * GET semua laporan
 */
router.get(
    "/",
    reportController.getAllReports
);

/**
 * GET laporan milik sendiri
 */
router.get(
    "/me",
    authMiddleware,
    reportController.getMyReports
);

/**
 * CREATE laporan
 * multipart/form-data
 */
router.post(
    "/",
    authMiddleware,
    upload.single("foto"),
    reportController.createReport
);

/**
 * UPDATE laporan
 * multipart/form-data
 */
router.put(
    "/:id",
    authMiddleware,
    upload.single("foto"),
    reportController.updateReport
);

/**
 * DELETE laporan
 */
router.delete(
    "/:id",
    authMiddleware,
    reportController.deleteReport
);

module.exports = router;