// VITE_SERVER_URL is set in .env / .env.local
const server: string =
  import.meta.env.VITE_SERVER_URL ?? "http://localhost:8000";

export default server;
