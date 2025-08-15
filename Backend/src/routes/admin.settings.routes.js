import { Router } from "express";
import { 
  changeAdminPassword, 
  updateAdminProfile, 
  getSystemSettings, 
  updateSystemSettings 
} from "../controllers/admin.settings.controller.js";
import { verifyAdminJwt } from "../middleware/admin.auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const adminSettingsRouter = Router();

// Change admin password
adminSettingsRouter.route("/change-password").put(verifyAdminJwt, changeAdminPassword);

// Update admin profile
adminSettingsRouter.route("/update-profile").put(verifyAdminJwt, upload.single("adminPic"), updateAdminProfile);

// Get system settings
adminSettingsRouter.route("/settings").get(verifyAdminJwt, getSystemSettings);

// Update system settings
adminSettingsRouter.route("/settings").put(verifyAdminJwt, updateSystemSettings);

export default adminSettingsRouter; 