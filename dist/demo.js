import { persist } from "./index.js";


persist({
    namespace: 'persist-demo',
    version: 1,
    verbose: true,
    cleanup: true,
    hide: false,
    showPersistManager: true,
    highlight: true,
})
