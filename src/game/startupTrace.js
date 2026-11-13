const key = 'MyPalette:MP28-02';
const page = Date.now().toString(36);
let entries = [];
let storageError = '';
try {
    entries = JSON.parse(sessionStorage.getItem(key) ?? '[]');
} catch (error) {
    storageError = String(error);
}

export function trace(event, data) {
    entries.push({ page, at: new Date().toISOString(), event, data });
    entries = entries.slice(-80);
    try {
        sessionStorage.setItem(key, JSON.stringify(entries));
    } catch (error) {
        storageError = String(error);
    }
}

export function traceText() {
    return JSON.stringify({ storageError, entries }, null, 2);
}
