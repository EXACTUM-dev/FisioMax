// models/role.js
export const roles = {
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
};

// permisos asignados por rol
export const rolePermissions = {
  admin: ["create_user", "edit_user", "delete_user", "view_reports"],
  editor: ["edit_user", "view_reports"],
  viewer: ["view_reports"],
};
