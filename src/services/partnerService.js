import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const addPartner = async (partnerData) => {
  try {
    const response = await axios.post(`${API_URL}/partners`, partnerData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPartners = async () => {
  try {
    const response = await axios.get(`${API_URL}/partners`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePartner = async (id, partnerData) => {
  try {
    const response = await axios.put(`${API_URL}/partners/${id}`, partnerData);
    return response.data;
  } catch (error) {
    throw error;
  }
};