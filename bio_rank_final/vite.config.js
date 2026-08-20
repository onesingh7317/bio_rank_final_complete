import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export default defineConfig({
  plugins: [
    {
      name: 'copy-static-assets',
      closeBundle() {
        const distDir = path.resolve(__dirname, 'dist');
        const jsSrc = path.resolve(__dirname, 'js');
        const jsDest = path.join(distDir, 'js');
        const cssSrc = path.resolve(__dirname, 'css');
        const cssDest = path.join(distDir, 'css');

        copyDirSync(jsSrc, jsDest);
        copyDirSync(cssSrc, cssDest);

        // Copy images and metadata files to dist
        ['robots.txt', 'sitemap.xml', 'logo-square.jpg', 'logo.jpg', 'logo-horizontal.jpg', 'favicon.jpg'].forEach(file => {
          const srcFile = path.resolve(__dirname, file);
          const destFile = path.join(distDir, file);
          if (fs.existsSync(srcFile)) {
            fs.copyFileSync(srcFile, destFile);
          }
        });
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
