const fs = require('fs');
const firstLine = fs.readFileSync('public/seeds.csv', 'utf8').split('\n')[0];
const cols = firstLine.split(',');
console.log('Column Count:', cols.length);
console.log('Header:', firstLine);
