import { Router } from "express";
import { getAllUsers, getUserById, updateUserByAdmin, deleteUserByAdmin, toggleUserStatus } from "../controllers/admin.user.controller.js";
import { verifyAdminJwt } from "../middleware/admin.auth.middleware.js";

const adminUserRouter = Router();

// Get all users
adminUserRouter.route("/users").get(verifyAdminJwt, getAllUsers);

// Get user by ID
adminUserRouter.route("/users/:userId").get(verifyAdminJwt, getUserById);

// Update user by admin
adminUserRouter.route("/users/:userId").put(verifyAdminJwt, updateUserByAdmin);

// Delete user by admin
adminUserRouter.route("/users/:userId").delete(verifyAdminJwt, deleteUserByAdmin);

// Toggle user status (activate/deactivate)
adminUserRouter.route("/users/:userId/toggle-status").patch(verifyAdminJwt, toggleUserStatus);

export default adminUserRouter; 