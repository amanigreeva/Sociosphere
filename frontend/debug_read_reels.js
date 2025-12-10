const fs = require('fs');
const path = 'frontend/src/pages/Reels.jsx';
try {
    const content = fs.readFileSync(path, 'utf8');
    console.log('--- CONTENT START ---');
    console.log(content);
    console.log('--- CONTENT END ---');
} catch (e) {
    console.error('Error reading file:', e);
}
