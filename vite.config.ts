import react from "@vitejs/plugin-react";

import { defineConfig } from "vite";
// import { tanstackBuildConfig } from '@tanstack/config/build'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()]
});
