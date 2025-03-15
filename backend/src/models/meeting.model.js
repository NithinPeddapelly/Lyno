import mongoose, { Schema } from "mongoose"; // Importing mongoose and Schema

const meetingSchema = new Schema( 
    {
        user_id: { type: String }, 
        meetingCode: { type: String, required: true },
        date: { type: Date, default: Date.now, required: true } // Defining the meeting schema to store user's meeting details
    }
);

const Meeting = mongoose.model("Meeting", meetingSchema); // Creating a user model from the schema

export { Meeting }; // Exporting
