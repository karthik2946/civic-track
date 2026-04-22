import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig((/*{ mode }*/) => {
  let https = undefined;
  
  // Try to load SSL certificates if they exist
  try {
    const keyPath = path.resolve(__dirname, "localhost-key.pem");
    const certPath = path.resolve(__dirname, "localhost.pem");
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      https = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
    }
  } catch (e) {
    console.log("SSL certificates not found. Run: mkcert localhost 127.0.0.1");
  }

  return {
    server: {
      host: "::",
      port: 8080,
      https: https,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
