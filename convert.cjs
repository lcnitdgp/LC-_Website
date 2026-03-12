const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = 'C:/Users/rauna/Downloads/verve';
const destGallery = 'src/assets/verve/gallery';
const destTeam = 'src/assets/verve/team';
const destEvents = 'src/assets/verve/events';

const files = fs.readdirSync(srcDir);

for (const file of files) {
    if (file.toLowerCase().endsWith('.ini')) continue;

    const ext = path.extname(file);
    const basename = path.basename(file, ext);

    let destDir = destGallery;
    if (['2ndyear', '3rdyear', '4thyear'].includes(basename.toLowerCase())) {
        destDir = destTeam;
    } else if (basename.toLowerCase() === 'literatiposter') {
        destDir = destEvents;
    }

    const outPath = path.join(destDir, basename + '.webp').replace(/\\/g, '/');
    const inputPath = path.join(srcDir, file).replace(/\\/g, '/');

    console.log(`Converting ${inputPath} to ${outPath}`);
    try {
        execSync(`npx -y sharp-cli@latest -i "${inputPath}" -o "${outPath}"`);
        console.log(`Done converting ${file}`);
    } catch (e) {
        console.error(`Error converting ${file}:`, e.message);
    }
}
