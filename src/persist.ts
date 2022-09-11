export enum PersistMode {
    "persist-for",
    "persist-until",
    "forget-between-versions",
    "forget-before-date",
}

export interface PersistOptions {
    verbose: boolean;
    cleanup: boolean;
    hide: boolean;
    purge: boolean;
    showPersistManager: boolean;
}

export enum PersistSupportedFieldType {
    "number",
    "date",
    "color",
    "url",
    "email",
    "phone",
    "textarea",
    "select",
    "select[multiple]",
    "checkbox",
    "radio",
    "file",
    "text",
    "range",
    "datetime-local",
    "month",
    "password",
    "search",
    "tel",
    "time",
    "week",
}

interface LocalStoragePersistField {
    value: string;
    name: string;
    version: string;
    createdAt: Date;
    modifiedAt: Date;
    originalFieldType: string;
    mode: PersistMode;
}

function verbalise(...args: any[]) {
    console.log("persist verbose mode: ", ...args)
}

export function persistField(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, options: PersistOptions) {
    localStorage.setItem(field.id, JSON.stringify({
        value: field.value,
        version: VERSION,
        createdAt: new Date(),
        modifiedAt: new Date(),
        originalFieldType: field.type,
        mode: field.dataset.persistMode,
    }));
}

function getLocalStoragePersistRelatedData({ verbose }: PersistOptions): LocalStoragePersistField[] {
    const allValidKeys = Object.keys(localStorage).filter((key) => {
        return key.startsWith("persist--data--");
    });
    const allValidValues = allValidKeys.map((key) => {
        const value = localStorage.getItem(key);
        if (value) {
            return JSON.parse(value as string) as LocalStoragePersistField;
        }
        return null;
    })
    verbose && verbalise("all persisted values", allValidValues)
    return allValidValues
}

function getAllEligibleFields({ verbose }: PersistOptions): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement[] {
    const allEligbleHTMLFields: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement[] = Array.from(document.querySelectorAll("input, textarea, select"));
    verbose && verbalise("all eligible fields", allEligbleHTMLFields)

    return allEligbleHTMLFields;
}

export function persist(options: PersistOptions = { showPersistManager: false, verbose: false, cleanup: true, hide: false, purge: false }) {
    options.verbose && verbalise("hi")

    const { verbose, cleanup, purge, hide } = options;

    // 0 - if purge is true, remove all persist data
    if (purge) {
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("persist--data--") || key.startsWith("persist--meta--")) {
                localStorage.removeItem(key);
            }
        }
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
        })
    }


}

const VERSION = "1.0.0";
export { VERSION };

export function togglePersistmanager() {
    // show persist manager
}