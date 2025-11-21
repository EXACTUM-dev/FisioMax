/**
 * @fileoverview Api roles tests(Roles Controller)
 * @author EXACTUM-dev
 * @version 1.0.0
 */
import { jest } from "@jest/globals";

// Mock the roles model and privileges model and sanitization util
const rolesModelPath = "../../../src/models/roles.model.js";
const privModelPath = "../../../src/models/privileges.model.js";
const sanitizationPath = "../../../src/utils/sanitization.js";

jest.unstable_mockModule(rolesModelPath, () => ({
  findRoleById: jest.fn(),
  updateRoleById: jest.fn(),
  getAllRolesFromDB: jest.fn(),
  updateRolePrivileges: jest.fn(),
  createRoleWithPrivileges: jest.fn(),
  assignRoleToUser: jest.fn(),
  findRoleByName: jest.fn(),
  reassignUsersToRole: jest.fn(),
  markRoleDeleted: jest.fn(),
  markRolePrivilegesDeleted: jest.fn(),
}));

jest.unstable_mockModule(privModelPath, () => ({
  getRolePrivileges: jest.fn(),
  getAllPrivileges: jest.fn(),
}));

jest.unstable_mockModule(sanitizationPath, () => ({
  sanitizeContentInput: jest.fn((input) => input),
}));

const rolesController = await import(
  "../../../src/controllers/roles.controller.js"
);
const rolesModel = await import(rolesModelPath);
const privModel = await import(privModelPath);
const sanit = await import(sanitizationPath);

describe("roles.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getRoleById returns role with mapped privileges", async () => {
    const mockRole = { IDRol: 1, nombre: "Admin", descripcion: "desc" };
    const rolePrivs = [{ id: 1 }, { id: 3 }];
    const allPrivs = [
      { id: 1, name: "p1" },
      { id: 2, name: "p2" },
      { id: 3, name: "p3" },
    ];

    rolesModel.findRoleById.mockResolvedValue(mockRole);
    privModel.getRolePrivileges.mockResolvedValue(rolePrivs);
    privModel.getAllPrivileges.mockResolvedValue(allPrivs);

    const req = { params: { id: "1" } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await rolesController.getRoleById(req, res);

    expect(rolesModel.findRoleById).toHaveBeenCalledWith("1");
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ id: 1, name: "Admin" }),
      })
    );
  });

  test("getRoleById returns 404 when not found", async () => {
    rolesModel.findRoleById.mockResolvedValue(null);

    const req = { params: { id: "99" } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await rolesController.getRoleById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test("createRole returns 201 on success", async () => {
    const reqBody = { name: "NewRole", description: "d", privileges: [1, 2] };
    sanit.sanitizeContentInput.mockReturnValue(reqBody);
    rolesModel.findRoleByName.mockResolvedValue(null);
    rolesModel.createRoleWithPrivileges.mockResolvedValue({ id: 10 });

    const req = { body: reqBody };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await rolesController.createRole(req, res);

    expect(rolesModel.findRoleByName).toHaveBeenCalledWith("NewRole");
    expect(rolesModel.createRoleWithPrivileges).toHaveBeenCalledWith(
      { name: "NewRole", description: "d" },
      [1, 2]
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test("createRole returns 409 when duplicate name", async () => {
    const reqBody = { name: "Existing", privileges: [1] };
    sanit.sanitizeContentInput.mockReturnValue(reqBody);
    rolesModel.findRoleByName.mockResolvedValue({ IDRol: 5, eliminado: 0 });

    const req = { body: reqBody };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await rolesController.createRole(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  test("updateRole returns 200 on success", async () => {
    const reqBody = { name: "Updated", description: "d", privileges: [2, 3] };
    sanit.sanitizeContentInput.mockReturnValue(reqBody);
    rolesModel.findRoleById.mockResolvedValue({ IDRol: 2, nombre: "Old" });
    rolesModel.findRoleByName.mockResolvedValue(null);
    rolesModel.updateRoleById.mockResolvedValue({});
    rolesModel.updateRolePrivileges.mockResolvedValue({});

    const req = { params: { id: "2" }, body: reqBody };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await rolesController.updateRole(req, res);

    expect(rolesModel.updateRoleById).toHaveBeenCalled();
    expect(rolesModel.updateRolePrivileges).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("updateRole returns 404 when role not found", async () => {
    sanit.sanitizeContentInput.mockReturnValue({ name: "X", privileges: [] });
    rolesModel.findRoleById.mockResolvedValue(null);

    const req = { params: { id: "99" }, body: { name: "X", privileges: [] } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await rolesController.updateRole(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
