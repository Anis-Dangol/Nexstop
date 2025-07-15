import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/auth"; // Adjust the base URL as needed

class FavouriteRoutesService {
  /**
   * Add a new favourite route
   * @param {Object} routeData - The route data to save
   * @returns {Promise} API response
   */
  async addFavouriteRoute(routeData) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/add-favourite`,
        routeData
      );
      return response.data;
    } catch (error) {
      console.error("Error adding favourite route:", error);
      throw error;
    }
  }

  /**
   * Get all favourite routes for a user
   * @param {string} userId - The user ID
   * @returns {Promise} API response with favourite routes
   */
  async getFavouriteRoutes(userId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-favourites/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching favourite routes:", error);
      throw error;
    }
  }

  /**
   * Get a specific favourite route by ID
   * @param {string} routeId - The route ID
   * @param {string} userId - The user ID
   * @returns {Promise} API response with the favourite route
   */
  async getFavouriteRoute(routeId, userId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get-favourite/${routeId}`,
        {
          params: { userId },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching favourite route:", error);
      throw error;
    }
  }

  /**
   * Remove a favourite route by ID
   * @param {string} routeId - The route ID to remove
   * @param {string} userId - The user ID
   * @returns {Promise} API response
   */
  async removeFavouriteRoute(routeId, userId) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/remove-favourite/${routeId}`,
        {
          data: { userId },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error removing favourite route:", error);
      throw error;
    }
  }

  /**
   * Remove a favourite route by start and end locations
   * @param {string} userId - The user ID
   * @param {string} startLocation - Start location
   * @param {string} endLocation - End location
   * @returns {Promise} API response
   */
  async removeFavouriteRouteByLocation(userId, startLocation, endLocation) {
    try {
      const response = await axios.post(`${API_BASE_URL}/remove-favourite`, {
        userId,
        startLocation,
        endLocation,
      });
      return response.data;
    } catch (error) {
      console.error("Error removing favourite route by location:", error);
      throw error;
    }
  }

  /**
   * Update a favourite route
   * @param {string} routeId - The route ID to update
   * @param {Object} updateData - The data to update
   * @returns {Promise} API response
   */
  async updateFavouriteRoute(routeId, updateData) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/update-favourite/${routeId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating favourite route:", error);
      throw error;
    }
  }

  /**
   * Convert localStorage format to API format for backward compatibility
   * @param {string} routeString - Route in "Start → End" format
   * @param {string} userId - User ID
   * @returns {Object} API-compatible route data
   */
  formatRouteForAPI(routeString, userId) {
    const [startLocation, endLocation] = routeString.split(" → ");
    return {
      userId,
      startLocation: startLocation.trim(),
      endLocation: endLocation.trim(),
      routeName: routeString,
    };
  }

  /**
   * Convert API format back to localStorage format for backward compatibility
   * @param {Object} apiRoute - Route from API
   * @returns {string} Route in "Start → End" format
   */
  formatRouteFromAPI(apiRoute) {
    return `${apiRoute.startLocation} → ${apiRoute.endLocation}`;
  }
}

export default new FavouriteRoutesService();
