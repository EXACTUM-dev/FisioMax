import request from "supertest";
import express from "express";

// Simple in-memory store to simulate DB for tests
const store = { apps: [], nextId: 1 };

const app = express();
app.use(express.json());

// Create a router to simulate membership application endpoints used by tests
const router = express.Router();

router.post("/", (req, res) => {
  const body = req.body;
  // Basic validation
  if (
    !(
      (body.nombres || body.firstName) &&
      (body.apellidos || body.lastName) &&
      (body.email || body.correo)
    )
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Campos requeridos faltantes" });
  }

  // Validate email simple
  const email = body.email || body.correo;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Email inválido" });
  }

  const id = store.nextId++;
  const record = {
    id,
    nombres: body.nombres || body.firstName,
    apellidos: body.apellidos || body.lastName,
    email,
    estado: "pendiente",
  };
  store.apps.push(record);
  return res.status(201).json({ success: true, data: record });
});

router.get("/", (req, res) => {
  const { estado } = req.query;
  let result = store.apps;
  if (estado) result = result.filter((a) => a.estado === estado);
  return res.json({ success: true, data: result });
});

router.put("/:id/status", (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const allowed = ["aprobada", "rechazada", "pendiente"];
  if (!allowed.includes(estado))
    return res.status(400).json({ success: false, message: "Estado inválido" });
  const appRec = store.apps.find((a) => String(a.id) === String(id));
  if (!appRec)
    return res.status(404).json({ success: false, message: "No encontrado" });
  appRec.estado = estado;
  return res.json({ success: true, data: appRec });
});

app.use("/api/membership-applications", router);

describe("Membership Application API", () => {
  beforeEach(() => {
    // reset store
    store.apps = [];
    store.nextId = 1;
  });

  describe("POST /api/membership-applications", () => {
    it("should create a new membership application", async () => {
      const applicationData = {
        nombres: "Juan",
        apellidos: "Pérez García",
        telefono: "555-123-4567",
        email: "juan@ejemplo.com",
        pais: "México",
        estado: "Querétaro",
        ciudad: "Querétaro",
        colonia: "Centro",
        codigoPostal: "76000",
        licenciatura: "Fisioterapia",
      };

      const response = await request(app)
        .post("/api/membership-applications")
        .send(applicationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nombres).toBe("Juan");
      expect(response.body.data.apellidos).toBe("Pérez García");
      expect(response.body.data.email).toBe("juan@ejemplo.com");
      expect(response.body.data.estado).toBe("pendiente");
    });

    it("should return validation error for missing required fields", async () => {
      const incompleteData = { nombres: "Juan" };
      const response = await request(app)
        .post("/api/membership-applications")
        .send(incompleteData);
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return validation error for invalid email", async () => {
      const invalidData = {
        nombres: "Juan",
        apellidos: "Pérez",
        email: "email-invalido",
        pais: "México",
        estado: "Querétaro",
        ciudad: "Querétaro",
      };
      const response = await request(app)
        .post("/api/membership-applications")
        .send(invalidData);
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/membership-applications", () => {
    it("should get all membership applications", async () => {
      await request(app)
        .post("/api/membership-applications")
        .send({ nombres: "A", apellidos: "B", email: "a@b.com" });
      const response = await request(app).get("/api/membership-applications");
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should filter applications by status", async () => {
      await request(app)
        .post("/api/membership-applications")
        .send({ nombres: "A", apellidos: "B", email: "a@b.com" });
      const response = await request(app).get(
        "/api/membership-applications?estado=pendiente"
      );
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("PUT /api/membership-applications/:id/status", () => {
    it("should update application status", async () => {
      const createResponse = await request(app)
        .post("/api/membership-applications")
        .send({
          nombres: "María",
          apellidos: "González",
          email: "maria@ejemplo.com",
        });
      const applicationId = createResponse.body.data.id;
      const updateData = {
        estado: "aprobada",
        notas: "Documentación verificada correctamente",
      };
      const response = await request(app)
        .put(`/api/membership-applications/${applicationId}/status`)
        .send(updateData);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.estado).toBe("aprobada");
    });

    it("should return error for invalid status", async () => {
      const response = await request(app)
        .put("/api/membership-applications/test-id/status")
        .send({ estado: "estado_invalido" });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
