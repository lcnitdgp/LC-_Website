import webp from 'webp-converter';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Grant permission for the converter
webp.grant_permission();

const convertImage = async (filePath) => {
    if (filePath.match(/\.jpe?g$/i)) {
        const newPath = filePath.replace(/\.jpe?g$/i, '.webp');
        try {
            // cwebp(input, output, option, logging)
            const result = await webp.cwebp(filePath, newPath, "-q 80", "-v");
            console.log(`Converted ${filePath} -> ${newPath}`);
            // Delete original
            if (fs.existsSync(newPath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error(`Error converting ${filePath}:`, error);
        }
    }
};

const processDirectory = async (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            await processDirectory(fullPath);
        } else {
            await convertImage(fullPath);
        }
    }
};

const main = async () => {
    const targetDir = path.join(__dirname, 'src', 'assets', 'nitmunxiv');
    console.log(`Processing directory: ${targetDir}`);
    await processDirectory(targetDir);
    console.log('Conversion complete.');
};

main().catch(console.error);
