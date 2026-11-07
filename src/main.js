import { initializeAppVersion } from './version.js';
import { createLayoutScreen } from './ui/screenLayout/createLayoutScreen.js';
import './ui/theme.css';
import './ui/screenLayout/layout.css';

document.querySelector('#app-version').textContent = initializeAppVersion(__APP_VERSION__);
createLayoutScreen(document.querySelector('#layout-screen'), document.querySelector('#panel-toggle'));
