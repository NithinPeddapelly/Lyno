import { User } from "../models/user.model.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import crypto from "crypto";

// Handles user login by verifying credentials and generating an authentication token.
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "Username and password are required." });
        }

        // Check if the user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found." });
        }

        // Verify password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid credentials." });
        }

        // Generate authentication token
        const token = crypto.randomBytes(20).toString("hex");
        user.token = token;
        await user.save();

        return res.status(httpStatus.OK).json({ message: "Login successful.", token });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred. Please try again." });
    }
};

// Handles user registration by creating a new account with a hashed password.
const register = async (req, res) => {
    try {
        const { name, username, password } = req.body;
        if (!name || !username || !password) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: "All fields are required." });
        }

        // Check if the username is already taken
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.CONFLICT).json({ message: "Username already exists." });
        }

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create and save the new user
        const newUser = new User({
            name,
            username,
            password: hashedPassword
        });
        await newUser.save();

        return res.status(httpStatus.CREATED).json({ message: "User registered successfully." });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred. Please try again." });
    }
};

export { login, register };
