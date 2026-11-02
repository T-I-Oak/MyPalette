import { initializeAppVersion } from './version.js';
import './style.css';

document.querySelector('#app-version').textContent = initializeAppVersion(__APP_VERSION__);
