const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '../messages');
const enPath = path.join(messagesDir, 'en.json');
const frPath = path.join(messagesDir, 'fr.json');
const esPath = path.join(messagesDir, 'es.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));

function syncObjects(source, target, langCode) {
    let changed = false;
    for (const key in source) {
        if (typeof source[key] === 'object' && source[key] !== null) {
            if (!target[key]) {
                target[key] = {};
                changed = true;
            }
            if (syncObjects(source[key], target[key], langCode)) {
                changed = true;
            }
        } else {
            if (!target.hasOwnProperty(key)) {
                console.log(`Missing key in ${langCode}: ${key}`);
                target[key] = source[key];
                changed = true;
            }
        }
    }
    return changed;
}

console.log('Syncing FR...');
if (syncObjects(en, fr, 'fr')) {
    fs.writeFileSync(frPath, JSON.stringify(fr, null, 4));
    console.log('Updated fr.json');
} else {
    console.log('fr.json already in sync');
}

console.log('Syncing ES...');
if (syncObjects(en, es, 'es')) {
    fs.writeFileSync(esPath, JSON.stringify(es, null, 4));
    console.log('Updated es.json');
} else {
    console.log('es.json already in sync');
}
