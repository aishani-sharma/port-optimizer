import axios from 'axios';

/**
 * Centralized Axios instance for the Portfolio Optimizer application.
 * 
 * Why a centralized API client?
 * 1. Base Configuration: Ensures all API requests automatically use the same baseURL ("http://localhost:8000"),
 *    reducing boilerplate and preventing errors from hardcoding URLs across different components.
 * 2. Interceptors: Allows us to easily attach common headers (e.g., auth tokens, content-type) 
 *    or globally handle errors/responses in one place.
 * 3. Maintainability: If the API endpoint or configuration changes in the future, we only need to update it here.
 */
const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
