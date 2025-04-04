import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt, { hash } from "bcrypt"
import crypto from "crypto"
import { Meeting } from "../models/meeting.model.js";

// Handles user login by verifying credentials and generating an authentication token.
const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Oops! Looks like you missed something. Both fields are required." });
    }

    try {
        // Check if the user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "Authentication failed:User not found" });
        }

        // Verify password
        let isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (isPasswordCorrect) {
            // Generate authentication token
            let token = crypto.randomBytes(20).toString("hex");
            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ token: token });
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Authentication failed: Wrong password" });
        }
    } catch (e) {
        return res.status(500).json({ message: `Hmmm… That didn’t work. Mind trying again?. ${e}` });
    }
};

// Handles user registration by creating a new account with a hashed password.
const register = async (req, res) => {
    const { name, username, password } = req.body;

    try {
        // Check if the username is already taken
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: " We’ve seen this one before! Try another." });
        }

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword
        });

        await newUser.save();

        res.status(httpStatus.CREATED).json({ message: "All set! Time to connect and collaborate" });
    } catch (e) {
        res.json({ message: `Things went south please try again. ${e}` });
    }
};

// Retrieves the user's meeting history based on authentication token.
const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });
        const meetings = await Meeting.find({ user_id: user.username });
        res.json(meetings);
    } catch (e) {
        res.json({ message: `Things went south please try again ${e}` });
    }
};

// Adds a meeting to the user's history using the provided authentication token.
const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token: token });

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        });

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added Lyno_Key to history" });
    } catch (e) {
        res.json({ message: `Things went south please try again ${e}` });
    }
};

export { login, register, getUserHistory, addToHistory };