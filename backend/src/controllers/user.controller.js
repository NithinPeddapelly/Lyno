import { User } from "../models/user.model.js"; 
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import crypto from "crypto";

// Handles user login by verifying credentials and generating an authentication token.
const login = async (req, res) => { // Define the login function
    const { username, password } = req.body; // Extract username and password from the request body

    // Validate request data
    if (!username || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Username and password are required." }); // Return error response if username or password is missing
    }

    try {
        // Check if the user exists
        const user = await User.findOne({ username }); // Find the user in the database
        if (!user) { // If the user is not found
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found." }); // Return error response
        }

        // Verify password
        if (await bcrypt.compare(password, user.password)) {
            // Generate authentication token
            const token = crypto.randomBytes(30).toString("hex"); // Generate a random token
            user.token = token;     // Save the token to the user's document
            await user.save(); // Save the user to the database

            return res.status(httpStatus.OK).json({ message: "Login successful.", token }); // Return success response with the token
        }

        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid credentials." }); // Return error response if the password is incorrect
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred. Please try again." }); // Return error response if an error occurs
    }
};

//Handles user registration by creating a new account with a hashed password.

const register = async (req, res) => {
    const { name, username, password } = req.body;

    // Validate request data
    if (!name || !username || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "All fields are required." });
    }

    try {
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

        await newUser.save(); // Save the user to the database
        return res.status(httpStatus.CREATED).json({ message: "User registered successfully." }); // Return success response
    } catch (error) { // Handle errors
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error occurred. Please try again." }); // Return error response
    }
};

export { login, register }; // Export the login and register functions for use in other parts of the application
