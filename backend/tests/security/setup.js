import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar .env.test ANTES de importar cualquier módulo
dotenv.config({
  path: resolve(__dirname, ".env.test"),
  override: true,
});
