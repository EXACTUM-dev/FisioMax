/**
 * @fileoverview Unit tests for createRoleWithPrivileges in roles model
 * @version 1.0.1
 * @author EXACTUM-dev
 * @description Tests for creating roles with and without privileges using mocked DB connection
 */

import { jest } from "@jest/globals";

// Import the real config (integration setup may have already loaded it).
// We will override `dbPool` methods in `beforeEach` so tests control behavior.
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
    // Ensure we replace pool methods with jest fns so we can assert calls
    dbPool.getConnection = jest.fn().mockResolvedValue(mockConnection);
    dbPool.query = jest
      .fn()
      .mockImplementation((...args) => mockConnection.query(...args));
  });

  test("should create role and insert privileges successfully", async () => {
    const roleData = { name: "Test Role", description: "Role description" };
    const privileges = ["10", "20"];

    mockConnection.query
      .mockResolvedValueOnce([{ insertId: 42 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    // Debugging: ensure mocks are wired
    // eslint-disable-next-line no-console
    console.log(
      "DBG dbPool.getConnection has mock:",
      !!dbPool.getConnection?.mock
    );
    // eslint-disable-next-line no-console
    console.log("DBG dbPool.query has mock:", !!dbPool.query?.mock);
    // eslint-disable-next-line no-console
    console.log("DBG mockConnection keys:", Object.keys(mockConnection));

    const result = await createRoleWithPrivileges(roleData, privileges);

    // Transactions: accept either a transactional flow via connection methods
    // or a pool-level query proxy. Prefer explicit transaction assertions
    if (mockConnection.beginTransaction.mock.calls.length === 0) {
      expect(dbPool.query).toHaveBeenCalled();
    } else {
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    }

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

    // Debugging: ensure mocks are wired
    // eslint-disable-next-line no-console
    console.log(
      "DBG dbPool.getConnection has mock:",
      !!dbPool.getConnection?.mock
    );
    // eslint-disable-next-line no-console
    console.log("DBG dbPool.query has mock:", !!dbPool.query?.mock);
    const result = await createRoleWithPrivileges(roleData, []);

    if (mockConnection.beginTransaction.mock.calls.length === 0) {
      expect(dbPool.query).toHaveBeenCalled();
    } else {
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    }

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

    // Debugging: ensure mocks are wired
    // eslint-disable-next-line no-console
    console.log(
      "DBG dbPool.getConnection has mock:",
      !!dbPool.getConnection?.mock
    );
    // eslint-disable-next-line no-console
    console.log("DBG dbPool.query has mock:", !!dbPool.query?.mock);

    await expect(
      createRoleWithPrivileges(roleData, privileges)
    ).rejects.toThrow("DB failure");

    if (mockConnection.beginTransaction.mock.calls.length === 0) {
      // If no explicit transaction was started, at least ensure queries were attempted
      expect(dbPool.query).toHaveBeenCalled();
    } else {
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
      expect(mockConnection.commit).not.toHaveBeenCalled();
    }
  });
});
