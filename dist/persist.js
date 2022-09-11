export var PersistMode;
(function (PersistMode) {
    PersistMode[PersistMode["persist-for"] = 0] = "persist-for";
    PersistMode[PersistMode["persist-until"] = 1] = "persist-until";
    PersistMode[PersistMode["forget-between-versions"] = 2] = "forget-between-versions";
    PersistMode[PersistMode["forget-before-date"] = 3] = "forget-before-date";
})(PersistMode || (PersistMode = {}));
export var PersistSupportedFieldType;
(function (PersistSupportedFieldType) {
    PersistSupportedFieldType[PersistSupportedFieldType["number"] = 0] = "number";
    PersistSupportedFieldType[PersistSupportedFieldType["date"] = 1] = "date";
    PersistSupportedFieldType[PersistSupportedFieldType["color"] = 2] = "color";
    PersistSupportedFieldType[PersistSupportedFieldType["url"] = 3] = "url";
    PersistSupportedFieldType[PersistSupportedFieldType["email"] = 4] = "email";
    PersistSupportedFieldType[PersistSupportedFieldType["phone"] = 5] = "phone";
    PersistSupportedFieldType[PersistSupportedFieldType["textarea"] = 6] = "textarea";
    PersistSupportedFieldType[PersistSupportedFieldType["select"] = 7] = "select";
    PersistSupportedFieldType[PersistSupportedFieldType["select[multiple]"] = 8] = "select[multiple]";
    PersistSupportedFieldType[PersistSupportedFieldType["checkbox"] = 9] = "checkbox";
    PersistSupportedFieldType[PersistSupportedFieldType["radio"] = 10] = "radio";
    PersistSupportedFieldType[PersistSupportedFieldType["file"] = 11] = "file";
    PersistSupportedFieldType[PersistSupportedFieldType["text"] = 12] = "text";
    PersistSupportedFieldType[PersistSupportedFieldType["range"] = 13] = "range";
    PersistSupportedFieldType[PersistSupportedFieldType["datetime-local"] = 14] = "datetime-local";
    PersistSupportedFieldType[PersistSupportedFieldType["month"] = 15] = "month";
    PersistSupportedFieldType[PersistSupportedFieldType["password"] = 16] = "password";
    PersistSupportedFieldType[PersistSupportedFieldType["search"] = 17] = "search";
    PersistSupportedFieldType[PersistSupportedFieldType["tel"] = 18] = "tel";
    PersistSupportedFieldType[PersistSupportedFieldType["time"] = 19] = "time";
    PersistSupportedFieldType[PersistSupportedFieldType["week"] = 20] = "week";
})(PersistSupportedFieldType || (PersistSupportedFieldType = {}));
function verbalise(...args) {
    console.log("persist verbose mode: ", ...args);
}
export function persistField(field, options) {
    localStorage.setItem(field.id, JSON.stringify({
        value: field.value,
        version: VERSION,
        createdAt: new Date(),
        modifiedAt: new Date(),
        originalFieldType: field.type,
        mode: field.dataset.persistMode,
    }));
}
function getLocalStoragePersistRelatedData({ verbose }) {
    const allValidKeys = Object.keys(localStorage).filter((key) => {
        return key.startsWith("persist--data--");
    });
    const allValidValues = allValidKeys.map((key) => {
        const value = localStorage.getItem(key);
        if (value) {
            return JSON.parse(value);
        }
        return null;
    });
    verbose && verbalise("all persisted values", allValidValues);
    return allValidValues;
}
function getAllEligibleFields({ verbose }) {
    const allEligbleHTMLFields = Array.from(document.querySelectorAll("input, textarea, select"));
    verbose && verbalise("all eligible fields", allEligbleHTMLFields);
    return allEligbleHTMLFields;
}
export function persist(options = { showPersistManager: false, verbose: false, cleanup: true, hide: false, purge: false }) {
    options.verbose && verbalise("hi");
    const { verbose, cleanup, purge, hide } = options;
    // 0 - if purge is true, remove all persist data
    if (purge) {
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("persist--data--") || key.startsWith("persist--meta--")) {
                localStorage.removeItem(key);
            }
        });
    }
    // 1 - get all persisted data from local storage
    const persistedData = getLocalStoragePersistRelatedData(options);
    // 2 - get all eligible fields from the DOM
    const allEligbleFields = getAllEligibleFields(options);
    // 3 - hydrate all fields with persist attribute if hide is not true
    if (!hide) {
        allEligbleFields.forEach((field) => {
            const persist = field.attributes.getNamedItem("persist");
            if (persist) {
                const persistData = persistedData.find((data) => data.originalFieldType === field.type && data.mode === persist.value);
                if (persistData) {
                    field.value = persistData.value;
                }
            }
        });
    }
    // 4 - start listening to changes on all fields with persist attribute
    // 4 - if cleanup is true, remove all data which has expired or is older than the current version
    if (cleanup) {
        persistedData.forEach((data) => {
            localStorage.removeItem(data.id);
        });
    }
}
const VERSION = "1.0.0";
export { VERSION };
export function togglePersistmanager() {
    // show persist manager
}
