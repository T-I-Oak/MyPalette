const key = 'MyPalette:MP28-02';
const page = Date.now().toString(36);
let entries = [];
let samples = [];
let game = 0;
let previousDays = 0;
let day = 0;
let storageError = '';
try {
    entries = JSON.parse(sessionStorage.getItem(key) ?? '[]');
    samples = JSON.parse(sessionStorage.getItem(key + ':samples') ?? '[]');
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
    return JSON.stringify({ storageError, samples, entries }, null, 2);
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
