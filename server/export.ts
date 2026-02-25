import fs from 'fs';
import path from 'path';

async function exportApp() {
    const distPath = path.join(process.cwd(), 'dist/public');
    const htmlPath = path.join(distPath, 'index.html');
    const assetsPath = path.join(distPath, 'assets');
    
    if (!fs.existsSync(htmlPath)) {
        console.error('Build the project first: npm run build');
        process.exit(1);
    }

    let html = fs.readFileSync(htmlPath, 'utf8');
    const assetFiles = fs.readdirSync(assetsPath);
    
    for (const file of assetFiles) {
        const filePath = path.join(assetsPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        if (file.endsWith('.css')) {
            html = html.replace(/<link [^>]*href="\/assets\/[^"]*"[^>]*>/, `<style>${content}</style>`);
        } else if (file.endsWith('.js')) {
            // Remove the type="module" script tag and replace it with a standard script containing the bundled code
            html = html.replace(/<script type="module" [^>]*src="\/assets\/[^"]*"[^>]*><\/script>/, `<script>${content}</script>`);
        }
    }
    
    // Fix absolute paths for favicon
    html = html.replace('href="/favicon.png"', 'href="favicon.png"');
    
    // Remove the module script if it was left behind by a different regex
    html = html.replace(/<script type="module" crossorigin src="\/assets\/index-[A-Za-z0-9]+\.js"><\/script>/, '');

    fs.writeFileSync(path.join(process.cwd(), 'weather_app_standalone.html'), html);
    console.log('Standalone HTML created: weather_app_standalone.html');
}

exportApp();
