/**
 * @fileoverview Rutas para logs de errores de login.
 * @version 1.0.0
 */

import express from "express";
import { createLoginErrorLog } from "../controllers/loginLogs.controller.js";

const router = express.Router();

router.post("/login-errors", createLoginErrorLog);

export default router;

