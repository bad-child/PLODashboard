const fs = require('fs');
const lines = fs.readFileSync('c:/Users/prayo/.gemini/antigravity-ide/brain/1b112cbb-9009-4cdf-be6c-a86c45fc71c1/.system_generated/logs/transcript.jsonl', 'utf-8').split('\n');
let found = false;
for(let i=lines.length-1; i>=0; i--) {
    if(lines[i].includes('data:image/')) {
        const match = lines[i].match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
        if(match) {
            fs.writeFileSync('public/logo.png', match[1], 'base64');
            console.log('Saved image!');
            found = true;
            break;
        }
    }
}
if (!found) console.log('Image not found in transcript');
