const express = require("express");

const router = express.Router();

const authController =
    require("../controllers/authController");

router.post(
    "/google",
    authController.googleLogin
);

router.post(
    "/logout",
    (req, res) => {
        res.json({
            message: "Logout success"
        });
    }
);

module.exports = router;