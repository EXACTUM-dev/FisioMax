/**
 * @fileoverview Discount service for fetching active discounts
 * @version 1.0.0
 * @author EXACTUM-dev
 */

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetches active discounts from the API
 * @param {string} token - Authentication token
 * @param {string|null} membershipType - Optional filter by membership type
 * @returns {Promise<Array>} Array of active discount objects
 */
export async function getActiveDiscounts(token, membershipType = null) {
  try {
    let url = `${API_URL}/content/discounts/active`;
    
    if (membershipType) {
      url += `?membershipType=${encodeURIComponent(membershipType)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch active discounts");
    }

    const data = await response.json();
    return data.discounts || [];
  } catch (error) {
    console.error("Error fetching active discounts:", error);
    return [];
  }
}
