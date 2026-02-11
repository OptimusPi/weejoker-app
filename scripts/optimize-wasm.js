const fs = require('fs');
const path = require('path');

const frameworkDir = path.join(process.cwd(), '.vercel/output/static/_framework');
const headersFile = path.join(process.cwd(), '.vercel/output/static/_headers');

// 25MB in bytes
const SIZE_LIMIT = 25 * 1024 * 1024;

if (!fs.existsSync(frameworkDir)) {
  console.log('Framework directory not found, skipping optimization.');
  process.exit(0);
}

const files = fs.readdirSync(frameworkDir);
const largeWasmFiles = [];

console.log('Scanning for large WASM files...');

files.forEach(file => {
  if (file.endsWith('.wasm')) {
    const filePath = path.join(frameworkDir, file);
    const stats = fs.statSync(filePath);

    if (stats.size > SIZE_LIMIT) {
      const brFile = filePath + '.br';
      if (fs.existsSync(brFile)) {
        console.log(`Optimizing ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB) -> replacing with Brotli version`);
        
        // Read the brotli file
        const brContent = fs.readFileSync(brFile);
        
        // Overwrite the original wasm file with brotli content
        fs.writeFileSync(filePath, brContent);
        
        // Add to list for headers
        largeWasmFiles.push(file);
      } else {
        console.warn(`Warning: Large file ${file} found but no .br version available.`);
      }
    }
  }
});

if (largeWasmFiles.length > 0) {
  console.log('Updating _headers file...');
  let headersContent = '';
  if (fs.existsSync(headersFile)) {
    headersContent = fs.readFileSync(headersFile, 'utf8');
  }

  // Ensure there's a newline at the end
  if (headersContent && !headersContent.endsWith('\n')) {
    headersContent += '\n';
  }

  largeWasmFiles.forEach(file => {
    // Path relative to static root
    const headerPath = `/_framework/${file}`;
    headersContent += `${headerPath}\n  Content-Encoding: br\n`;
  });

  fs.writeFileSync(headersFile, headersContent);
  console.log(`Added headers for ${largeWasmFiles.length} files.`);
} else {
  console.log('No large WASM files required optimization.');
}
