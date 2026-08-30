import { defineConfig } from "vite";
import { wgslVitePlugin } from "@vgpu/wgsl/loader-vite";

export default defineConfig({
  root: ".",
  publicDir: "public",
  plugins: [wgslVitePlugin()],
});
