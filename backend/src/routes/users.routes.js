import express from "express";
import { getUsuarios } from "../models/usuarios.js";

const router = express.Router();

// Ruta para obtener todos los usuarios
router.get("/", getUsuarios);

export default router;
