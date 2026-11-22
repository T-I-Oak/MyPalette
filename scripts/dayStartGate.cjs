// Development-only observation barrier. Production keeps automatic progression.
exports.installDayStartGate = async page => {
    await page.route('**/src/game/dayStartMotion.js*', async route => {
        const response = await route.fetch();
        const body = (await response.text()).replace(
            'const placeholder = document.createElement',
            `await new Promise(resolve => {
                window.releaseDayStart = resolve;
                window.dayStartWaiting = true;
                signal.addEventListener('abort', resolve, { once: true });
            });
            window.dayStartWaiting = false;
            if (signal.aborted) return;
            const placeholder = document.createElement`);
        if (!body.includes('window.dayStartWaiting = true')) throw new Error('Day-start observation barrier was not installed');
        await route.fulfill({ response, body });
    });
};
exports.waitDayStart = page => page.waitForFunction(() => window.dayStartWaiting === true, null, { timeout: 60000 });
exports.releaseDayStart = async page => {
    await exports.waitDayStart(page);
    await page.evaluate(() => window.releaseDayStart());
};
