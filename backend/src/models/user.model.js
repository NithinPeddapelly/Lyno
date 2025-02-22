import mongoose, { Schema } from "mongoose";

const userSchema = new Schema( // Defining the user schema to store user details
    {
        name: { type: String, required: true }, // User's full name (required)
        username: { type: String, required: true, unique: true }, // Unique username for login
        password: { type: String, required: true }, // Hashed password for authentication
        token: { type: String } // JWT token for session management (optional)
    }
);
const User = mongoose.model("User", userSchema); // Creating a User model from the schema

export { User }; // Exporting
