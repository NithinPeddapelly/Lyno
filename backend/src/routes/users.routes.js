import { Router } from "express"; // Importing Router from Express to define API routes
import { login, register } from "../controllers/user.controller.js";  // Importing login and register functions from the users controller
const router = Router(); // Creating an instance of the Express router

// Defining API endpoints
router.route("/login").post(login); // Route for user login
router.route("/register").post(register); // Route for user registration
router.route("/add_to_activity"); // Route to add an activity
router.route("/get_all_activity"); // Route to fetch all activities

export default router; // Exporting the router to be used in other parts of the application
