import { Router } from "express";
import { addToHistory, login, register, getUserHistory } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { validateLogin, validateRegister } from "../middleware/validate.middleware.js";

const router = Router();

router.post("/login", validateLogin, login);
router.post("/register", validateRegister, register);
router.post("/add_to_activity", verifyToken, addToHistory);
router.get("/get_all_activity", verifyToken, getUserHistory);

export default router;
