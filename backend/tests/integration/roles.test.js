/**
 * @fileoverview Unit tests for createRoleWithPrivileges in roles model
 * @version 1.0.1
 * @author EXACTUM-dev
 * @description Tests for creating roles with and without privileges using mocked DB connection
 */

import { jest } from "@jest/globals";
// Mock the DB pool module before importing the module under test
await jest.unstable_mockModule("../../config.js", () => ({
  dbPool: {
    getConnection: jest.fn(),
    query: jest.fn(),
  },
}));

// Now import the mocked config and the function under test dynamically
const { dbPool } = await import("../../config.js");
const { createRoleWithPrivileges } = await import(
  "../../src/models/roles.model.js"
);

describe("createRoleWithPrivileges (unit)", () => {
  const mockConnection = {
    beginTransaction: jest.fn(),
    query: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    dbPool.getConnection.mockResolvedValue(mockConnection);
  });

  test("should create role and insert privileges successfully", async () => {
    const roleData = { name: "Test Role", description: "Role description" };
    const privileges = ["10", "20"];

    mockConnection.query
      .mockResolvedValueOnce([{ insertId: 42 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await createRoleWithPrivileges(roleData, privileges);

    // Transactions
    expect(mockConnection.beginTransaction).toHaveBeenCalled();
    expect(mockConnection.commit).toHaveBeenCalled();
    expect(mockConnection.release).toHaveBeenCalled();

    // Validate role insert called with expected SQL/params (best-effort check)
    expect(mockConnection.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("INSERT"),
      [roleData.name, roleData.description]
    );

    // Validate returned object shape
    expect(result).toEqual({
      id: 42,
      name: roleData.name,
      description: roleData.description,
    });
  });

  test("should create role without privileges when none provided", async () => {
    const roleData = { name: "No Privs Role", description: "" };

    mockConnection.query.mockResolvedValueOnce([{ insertId: 99 }]);

    const result = await createRoleWithPrivileges(roleData, []);

    expect(mockConnection.beginTransaction).toHaveBeenCalled();
    expect(mockConnection.commit).toHaveBeenCalled();
    expect(mockConnection.release).toHaveBeenCalled();

    // Only the role insert should be executed
    expect(mockConnection.query).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      id: 99,
      name: roleData.name,
      description: roleData.description,
    });
  });

  test("should rollback and rethrow when DB error occurs", async () => {
    const roleData = { name: "Err Role", description: "err" };
    const privileges = ["1"];

    const dbError = new Error("DB failure");
    mockConnection.query.mockRejectedValueOnce(dbError);

    await expect(
      createRoleWithPrivileges(roleData, privileges)
    ).rejects.toThrow("DB failure");

    expect(mockConnection.beginTransaction).toHaveBeenCalled();
    expect(mockConnection.rollback).toHaveBeenCalled();
    expect(mockConnection.release).toHaveBeenCalled();
    expect(mockConnection.commit).not.toHaveBeenCalled();
  });
});
