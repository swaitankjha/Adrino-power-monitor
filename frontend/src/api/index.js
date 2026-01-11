import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// -------------------- READINGS API --------------------
export const readingsApi = {
  // Get latest reading
  getCurrentReading: async () => {
    try {
      const response = await axios.get(`${API}/readings/latest`);
      return response.data;
    } catch (error) {
      console.error('Error fetching current reading:', error);
      throw error;
    }
  },

  // Get all readings
  getAllReadings: async (limit = 100) => {
    try {
      const response = await axios.get(`${API}/readings`, {
        params: { limit }
      });
      return response.data;  // backend returns list, not {readings: []}
    } catch (error) {
      console.error('Error fetching readings:', error);
      throw error;
    }
  },

  // Post new reading (ESP32)
  postReading: async (data) => {
    try {
      const response = await axios.post(`${API}/readings/update`, data);
      return response.data;
    } catch (error) {
      console.error('Error posting reading:', error);
      throw error;
    }
  }
};

// -------------------- PRICING API --------------------
export const pricingApi = {
  // Get pricing slabs
  getPricingSlabs: async () => {
    try {
      const response = await axios.get(`${API}/pricing/pricing-slabs`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing slabs:', error);
      throw error;
    }
  },

  // Update pricing slabs
  updatePricingSlabs: async (slabs) => {
    try {
      const response = await axios.post(`${API}/pricing/update`, {
        slabs: slabs
      });
      return response.data;
    } catch (error) {
      console.error('Error updating pricing slabs:', error);
      throw error;
    }
  }
};

// -------------------- COST API (optional) --------------------
export const costApi = {
  calculateCost: async (startDate, endDate) => {
    try {
      const response = await axios.post(`${API}/cost/calculate`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating cost:', error);
      throw error;
    }
  }
};

export default {
  readings: readingsApi,
  pricing: pricingApi,
  cost: costApi
};
