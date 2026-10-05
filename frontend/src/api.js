const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const defaultApiUrl = import.meta.env.DEV
	? "http://localhost:5001"
	: window.location.origin;
const API_URL = (configuredApiUrl || defaultApiUrl).replace(/\/+$/, "");

export default API_URL;
