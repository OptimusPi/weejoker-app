const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Assuming run from project root
const frameworkDir = path.join(process.cwd(), 'public', '_framework');

console.log('Target directory:', frameworkDir);

if (!fs.existsSync(frameworkDir)) {
    console.error('Framework directory not found:', frameworkDir);
    console.log('Current working directory:', process.cwd());
    process.exit(1);
}

const files = fs.readdirSync(frameworkDir);
let fixedCount = 0;
let errorCount = 0;

console.log(`Found ${files.length} files in directory.`);

files.forEach(file => {
    if (file.endsWith('.br')) {
        const originalName = file.slice(0, -3); // Remove .br extension
        const originalPath = path.join(frameworkDir, originalName);
        const brPath = path.join(frameworkDir, file);

        if (!fs.existsSync(originalPath)) {
            console.log(`Missing uncompressed file: ${originalName}`);
            console.log(`Decompressing ${file} -> ${originalName}...`);
            try {
                const compressed = fs.readFileSync(brPath);
                const decompressed = zlib.brotliDecompressSync(compressed);
                fs.writeFileSync(originalPath, decompressed);
                console.log(`Position restored: ${originalName}`);
                fixedCount++;
            } catch (err) {
                console.error(`Failed to decompress ${file}:`, err.message);
                errorCount++;
            }
        }
    }
});

console.log(`Operation complete. Restored: ${fixedCount}, Errors: ${errorCount}.`);
