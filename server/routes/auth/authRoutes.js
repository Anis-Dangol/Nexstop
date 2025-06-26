import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
} from "../../controllers/auth/auth-controller.js";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../controllers/auth/user-controller.js";

const router = express.Router();
router.get("/all-users", authMiddleware, getAllUsers);
router.post("/create-user", authMiddleware, createUser);
router.put("/update-user/:id", authMiddleware, updateUser);
router.delete("/delete-user/:id", authMiddleware, deleteUser);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated User!!!",
    user,
  });
});

export default router;
