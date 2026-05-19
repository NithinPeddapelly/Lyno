import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Meeting } from "../models/meeting.model.js";
import { env } from "../config/env.js";

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found." });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid credentials." });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, name: user.name },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(httpStatus.OK).json({ token, name: user.name, username: user.username });
    } catch {
        return res.status(500).json({ message: "An error occurred. Please try again." });
    }
};

const register = async (req, res) => {
    const { name, username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.CONFLICT).json({ message: "Username already taken." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, username, password: hashedPassword });
        await newUser.save();

        return res.status(httpStatus.CREATED).json({ message: "Account created successfully. You can now sign in." });
    } catch {
        return res.status(500).json({ message: "An error occurred. Please try again." });
    }
};

const getUserHistory = async (req, res) => {
    try {
        const meetings = await Meeting.find({ user_id: req.user.username }).sort({ date: -1 });
        return res.json(meetings);
    } catch {
        return res.status(500).json({ message: "Could not fetch history. Please try again." });
    }
};

const addToHistory = async (req, res) => {
    const { meeting_code } = req.body;

    if (!meeting_code) {
        return res.status(422).json({ message: "meeting_code is required." });
    }

    try {
        const newMeeting = new Meeting({ user_id: req.user.username, meetingCode: meeting_code });
        await newMeeting.save();
        return res.status(httpStatus.CREATED).json({ message: "Meeting added to history." });
    } catch {
        return res.status(500).json({ message: "Could not save meeting. Please try again." });
    }
};

export { login, register, getUserHistory, addToHistory };
