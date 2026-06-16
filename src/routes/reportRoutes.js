const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const reportController =
    require("../controllers/reportController");

router.get(
    "/",
    authMiddleware,
    reportController.getAllReports
);

router.get(
    "/me",
    authMiddleware,
    reportController.getMyReports
);

router.post(
    "/",
    authMiddleware,
    reportController.createReport
);

router.put(
    "/:id",
    authMiddleware,
    reportController.updateReport
);

router.delete(
    "/:id",
    authMiddleware,
    reportController.deleteReport
);

module.exports = router;