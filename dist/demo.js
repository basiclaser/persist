import { persist } from "./index.js";


persist({
    namespace: 'persist-demo',
    version: 1,
    verbose: true,
    cleanup: true,
    showPersistManager: true,
    highlight: true,
})
