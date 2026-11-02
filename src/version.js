import { setAppVersion, getAppVersion } from '../../GameWorksOAK/src/lib/utils/env.js';

export function initializeAppVersion(version) {
    setAppVersion(version);
    return getAppVersion();
}
