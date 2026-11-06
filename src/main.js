import { initializeAppVersion } from './version.js';

document.querySelector('#app-version').textContent = initializeAppVersion(__APP_VERSION__);
