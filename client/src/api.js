// =============================================
// SHOPMIND AI API CONFIGURATION
// =============================================

// Development:
// http://localhost:5000
//
// Production:
// VITE_API_URL will contain our Render backend URL.

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export default API_URL;