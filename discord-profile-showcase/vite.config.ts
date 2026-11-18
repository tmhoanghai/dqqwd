import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function scanMusicFiles(dir: string, baseDir: string = dir): Array<{ url: string; name: string; folder: string }> {
  let results: Array<{ url: string; name: string; folder: string }> = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(scanMusicFiles(fullPath, baseDir));
    } else if (/\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(entry.name)) {
      try {
        const stats = fs.statSync(fullPath);
        // Only include non-empty valid audio files
        if (stats.size > 0) {
          const relativeToPublic = path.relative(path.join(process.cwd(), 'public'), fullPath).split(path.sep).join('/');
          const relativeToMusic = path.relative(baseDir, path.dirname(fullPath)).split(path.sep).join('/');
          results.push({
            url: '/' + encodeURI(relativeToPublic),
            name: path.basename(entry.name, path.extname(entry.name)),
            folder: relativeToMusic === '.' ? '' : relativeToMusic
          });
        }
      } catch {
        // Skip inaccessible files
      }
    }
  }
  return results;
}

function musicScannerPlugin(): Plugin {
  return {
    name: 'vite-plugin-music-scanner',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/music' || req.url?.startsWith('/api/music?')) {
          const musicDir = path.join(process.cwd(), 'public', 'music');
          const list = scanMusicFiles(musicDir);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(JSON.stringify(list));
          return;
        }

        if (req.url === '/api/chess' || req.url?.startsWith('/api/chess?')) {
          try {
            const chessHtmlRes = await fetch('https://www.chess.com/member/tm_kingreal', {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });
            const html = await chessHtmlRes.text();
            const match = html.match(/class="profile-header-details-value">([0-9,]+)<\/div>\s*Views/i);
            const viewsFormatted = match ? match[1] : '9,488';
            const views = parseInt(viewsFormatted.replace(/,/g, ''), 10) || 9488;
            
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'public, max-age=60');
            res.end(JSON.stringify({ views, viewsFormatted }));
            return;
          } catch {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ views: 9488, viewsFormatted: '9,488' }));
            return;
          }
        }

        next();
      });
    },
    async buildStart() {
      try {
        const chessHtmlRes = await fetch('https://www.chess.com/member/tm_kingreal', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        const html = await chessHtmlRes.text();
        const match = html.match(/class="profile-header-details-value">([0-9,]+)<\/div>\s*Views/i);
        const viewsFormatted = match ? match[1] : '9,488';
        const views = parseInt(viewsFormatted.replace(/,/g, ''), 10) || 9488;
        
        fs.writeFileSync(
          path.join(process.cwd(), 'public', 'chess-data.json'),
          JSON.stringify({ views, viewsFormatted, username: 'tm_kingreal', updatedAt: Date.now() }, null, 2)
        );
      } catch {
        // Fallback
      }
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), musicScannerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
