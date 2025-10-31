// utils/auth.js
export function getUserRole() {
  let user = null;
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (e) {
    // Optionally log error: console.error("Failed to parse user from localStorage", e);
    user = null;
  }
  
  return user?.role || "viewer";
}
