import { body, validationResult } from "express-validator";

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ message: errors.array()[0].msg });
    }
    next();
};

export const validateRegister = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required.")
        .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters."),
    body("username")
        .trim()
        .toLowerCase()
        .notEmpty().withMessage("Username is required.")
        .isLength({ min: 3, max: 30 }).withMessage("Username must be 3–30 characters.")
        .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username may only contain letters, numbers, and underscores."),
    body("password")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
    handleValidationErrors,
];

export const validateLogin = [
    body("username").trim().toLowerCase().notEmpty().withMessage("Username is required."),
    body("password").notEmpty().withMessage("Password is required."),
    handleValidationErrors,
];
