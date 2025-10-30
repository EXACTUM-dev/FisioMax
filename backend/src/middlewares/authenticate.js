// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token requerido" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contiene { id, role }
    next();
  } catch {
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};
