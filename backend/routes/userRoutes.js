import express from "express";

import {
  registerUser,
  authUser,
  getUser,
  myRefreshToken,
} from "../controllers/userController.js";
import authenticateToken from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/", registerUser);
router.post("/auth", authUser);
router.get("/", authenticateToken, getUser);
router.post("/refresh", myRefreshToken);

export default router;
