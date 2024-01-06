import express from "express";
import UserController from "../../user/controller/user.controller.js";

const router = express.Router();

router.post('/signup', UserController.signUp);
router.post('/signin', UserController.signIn);
router.put('/update/:id', UserController.resetPassword);

export default router;