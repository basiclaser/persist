import { persist, togglePersistmanager } from "./index.js";


persist({
    key: 'demo',
    version: 1,
    verbose: true,
    cleanup: true,
    hide: false,
    showPersistManager: false
})
