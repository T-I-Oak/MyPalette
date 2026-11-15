const key = 'MyPalette:MP28-02';
const page = Date.now().toString(36);
let entries = [];
let samples = [];
let cardFrames = [];
let game = 0;
let previousDays = 0;
let day = 0;
let storageError = '';
let sequence = 0;
let actionId = 0;
let versions = {};
try {
    entries = JSON.parse(sessionStorage.getItem(key) ?? '[]');
    samples = JSON.parse(sessionStorage.getItem(key + ':samples') ?? '[]');
    cardFrames = JSON.parse(sessionStorage.getItem(key + ':card-frames') ?? '[]');
    versions = JSON.parse(sessionStorage.getItem(key + ':versions') ?? '{}');
} catch (error) {
    storageError = String(error);
}

export function setTraceVersion(value) {
    for (const record of [...entries, ...samples, ...cardFrames]) {
        const version = record.version ?? (record.event === 'page-open' ? record.data?.version : undefined);
        if (version) versions[record.page] = version;
    }
    versions[page] = value;
    try {
        sessionStorage.setItem(key + ':versions', JSON.stringify(versions));
    } catch (error) {
        storageError = String(error);
    }
}

function exportRecord({ version, ...record }) {
    if (record.event === 'page-open' && record.data?.version) {
        const { version: startupVersion, ...data } = record.data;
        return { ...record, data };
    }
    return record;
}

export function trace(event, data, action = actionId) {
    const seq = ++sequence;
    entries.push({ page, seq, action, at: new Date().toISOString(), event, data });
    entries = entries.slice(-80);
    try {
        sessionStorage.setItem(key, JSON.stringify(entries));
    } catch (error) {
        storageError = String(error);
    }
    return seq;
}

export function startTraceAction() { actionId++; }
export function currentTraceAction() { return actionId; }

export function traceCardFrame(event, data, action) {
    cardFrames.push({ page, seq: ++sequence, action, at: new Date().toISOString(), event, data });
    cardFrames = cardFrames.slice(-24);
    try {
        sessionStorage.setItem(key + ':card-frames', JSON.stringify(cardFrames));
    } catch (error) {
        storageError = String(error);
    }
}

export function traceText() {
    const pages = new Set([page, ...[...samples, ...entries, ...cardFrames].map(record => record.page)]);
    const pageVersions = Object.fromEntries([...pages].map(id => [id, versions[id] ?? null]));
    return JSON.stringify({
        page, pageVersions, storageError,
        samples: samples.map(exportRecord),
        entries: entries.map(exportRecord),
        cardFrames: cardFrames.map(exportRecord),
    }, null, 2);
}

export function startTraceGame() {
    previousDays += day;
    game++;
    day = 0;
}

export function sampleResources(stage, resources, currentDay = day) {
    day = currentDay;
    samples.push({ page, game, day, cumulativeDays: previousDays + day, stage, at: new Date().toISOString(), resources });
    try {
        sessionStorage.setItem(key + ':samples', JSON.stringify(samples));
    } catch (error) {
        storageError = String(error);
    }
}

export function traceWebGL(canvas, area) {
    const counts = { changed: 0, unchanged: 0 };
    function countWrites(records) {
        const values = { width: canvas.getAttribute('width'), height: canvas.getAttribute('height') };
        for (let i = records.length - 1; i >= 0; i--) {
            const { attributeName, oldValue } = records[i];
            const defaultSize = attributeName === 'width' ? 300 : 150;
            const before = Number(oldValue ?? defaultSize);
            const after = Number(values[attributeName] ?? defaultSize);
            counts[before === after ? 'unchanged' : 'changed']++;
            values[attributeName] = oldValue;
        }
    }
    const observer = new MutationObserver(countWrites);
    observer.observe(canvas, { attributeFilter: ['width', 'height'], attributeOldValue: true });
    canvas.addEventListener('webglcontextlost', () => trace('webgl-lost', { area }));
    canvas.addEventListener('webglcontextrestored', () => trace('webgl-restored', { area }));
    return {
        read() {
            countWrites(observer.takeRecords());
            return { ...counts, width: canvas.width, height: canvas.height };
        },
        stop() {
            countWrites(observer.takeRecords());
            observer.disconnect();
        },
    };
}
