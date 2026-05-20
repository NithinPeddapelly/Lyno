// VITE_SERVER_URL should be set in deployment environments.
const configuredServer = (import.meta.env.VITE_SERVER_URL as string | undefined)?.trim();

const devServer = typeof window !== "undefined"
  ? `${window.location.protocol}//${window.location.hostname}:8000`
  : "http://localhost:8000";

const server: string = configuredServer
  ? configuredServer.replace(/\/+$/, "")
  : import.meta.env.DEV
  ? devServer
  : "";

if (!server) {
  // Avoid silently calling localhost in production builds.
  console.error("Missing VITE_SERVER_URL. Set it in your deployment environment.");
}

export default server;
