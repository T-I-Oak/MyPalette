import { setAppVersion, getAppVersion } from '../../GameWorksOAK/src/lib/utils/env.js';
import packageInfo from '../package.json' with { type: 'json' };

export function initializeAppVersion() {
    setAppVersion(packageInfo.version);
    return getAppVersion();
}
