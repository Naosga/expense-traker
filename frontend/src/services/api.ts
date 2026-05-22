/*import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export default api;*/

import axios from "axios";

const api = axios.create({
  baseURL: "https://expense-traker-iakg.onrender.com/api",
});

export default api;