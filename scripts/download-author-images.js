
const fs = require('fs');
const path = require('path');
const https = require('https');

const AUTHORS_DATA = {
    "Chef Alex": "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&q=80",
    "Sarah Jenkins": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    "Dr. Emily Foodsci": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    "Giulia Rossi": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
    "Marcus Chen": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
    "Elena Rodriguez": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    "James Oliver": "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&q=80",
    "Priya Patel": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80",
    "Sophie Dubois": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
    "Kenji Yamamoto": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
};

const outputDir = path.join(process.cwd(), 'public', 'images', 'team');
const logFile = path.join(process.cwd(), 'download_log.txt');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function log(msg) {
    try {
        fs.appendFileSync(logFile, msg + '\n');
        console.log(msg);
    } catch (e) {
        console.error("Logging failed", e);
    }
}

log("Script started (JS).");

function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const filepath = path.join(outputDir, filename);
        log(`Starting download for ${filename} to ${filepath}`);
        const file = fs.createWriteStream(filepath);
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
            if (response.statusCode !== 200) {
                log(`Failed to download ${filename}: Status Code ${response.statusCode}`);
                response.resume();
                file.close();
                fs.unlink(filepath, () => { });
                resolve(null);
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                log(`Downloaded ${filename}`);
                resolve(null);
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { });
            log(`Error downloading ${filename}: ${err.message}`);
            reject(err);
        });
    });
}

function getFilename(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.jpg';
}

async function main() {
    log("Main started");
    try {
        const promises = Object.entries(AUTHORS_DATA).map(([name, url]) => {
            return downloadImage(url, getFilename(name));
        });
        await Promise.all(promises);
        log("All images downloaded.");
    } catch (e) {
        log("Fatal error: " + e.message);
    }
}

main();
