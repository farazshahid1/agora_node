const express = require("express");
const router = express.Router();
const User = require("../models/Users");

router.post("/register", (req, res) => {
  console.log("register_please: ", req.body);
});

module.exports = router;
