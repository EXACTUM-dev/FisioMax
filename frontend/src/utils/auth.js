// utils/auth.js
export function getUserRole() {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role || "viewer";
}
