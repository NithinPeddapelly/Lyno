import { schema } from "mongoose";

const meetingSchema = new Schema( // Defining the meeting schema to store
    {
        user_id:{type:String}, 
        meetingCode:{type:String, required:true},
        date:{type:Date, default:Date.now, required: true} // Defining the meeting schema to store user's meeting details
    }
)

const Meeting = Mongooose.model("user", meetingSchema); // Creating a user model from the schema

export { User }; // Exporting