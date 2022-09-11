export enum PersistMode {
    "persist-for",
    "persist-until",
    "forget-between-versions ",
    "forget-before-date",
}

export interface PersistOptions {
    verbose: boolean;
    cleanup: boolean;
    hide: boolean;
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
    version: string;
    createdAt: Date;
    modifiedAt: Date;
    originalFieldType: string;
    mode: PersistMode;
}

// show user all data as JSON in a popup 
function showAllData() {
    const data = getLocalStoragePersistRelatedData;
    const dataString = JSON.stringify(data, null, 2);
    alert(dataString);
}


function getLocalStoragePersistRelatedData(): LocalStoragePersistField[] {
    const allValidKeys = Object.keys(localStorage).filter((key) => {
        return key.startsWith("persist-");
    });
    const allValidValues = allValidKeys.map((key) => {
        const value = localStorage.getItem(key);
        if (value) {
            return JSON.parse(value);
        }
        return null;
    })
    return allValidValues.filter((value) => value !== null) as LocalStoragePersistField[];
}

function getAllEligibleFields(): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement[] {
    return Array.from(document.querySelectorAll("input, textarea, select"));
}

export function persist(options: PersistOptions = { verbose: false, cleanup: true, hide: false }) {
    const { verbose, cleanup, hide } = options;

    // 1 - get all persisted data from local storage
    const persistedData = getLocalStoragePersistRelatedData();

    // 2 - get all fields from the DOM
    const allFields = getAllEligibleFields();

    // 3 - if cleanup is true, remove all persisted data from local storage

    const initialStateFromLocalStorage = Object.keys(localStorage).reduce((acc, key) => {
        const value = localStorage.getItem(key);
        if (value) {
            try {
                const { value: v, version, mode } = JSON.parse(value) as LocalStoragePersistField;
                if (mode === PersistMode["persist-until"]) {
                    if (version === VERSION) {
                        acc[key] = v;
                    }
                } else if (mode === PersistMode["persist-for"]) {
                    if (version === VERSION) {
                        acc[key] = v;
                    } else {
                        localStorage.removeItem(key);
                    }
                } else if (mode === PersistMode["forget-before-date"]) {
                    const date = new Date(version);
                    if (date > new Date()) {
                        acc[key] = v;
                    } else {
                        localStorage.removeItem(key);
                    }
                } else if (mode === PersistMode["forget-between-versions"]) {
                    const [from, to] = version.split("-");
                    if (from <= VERSION && VERSION <= to) {
                        acc[key] = v;
                    } else {
                        localStorage.removeItem(key);
                    }
                }
            } catch (e) {

            }
        }
        return acc;
    }, {} as { [key: string]: string });

    if (verbose) {
        console.log("persist is in verbose mode");
    }

    // check document for any persist attributes
    // if there is a persist tag, check if the tag is a persist-for or persist-until tag
    // if it is a persist-for or persist-until tag, check if the tag is a valid tag
    document.querySelectorAll('[persist]').forEach((element) => {
        const persistTag = element.getAttribute('persist')

        if (persistTag !== null) {
            const persistAttributes = element.attributes as unknown as PersistMode

            if (persistAttributes['persist-for'] !== undefined) {
                const persistFor = persistAttributes['persist-for']

            } else if (persistAttributes['persist-until'] !== undefined) {
                const persistUntil = persistAttributes['persist-until']
                if (persistUntil === 'session') {
                    // persist until session
                } else if (persistUntil === 'version') {
                    // persist until version
                } else if (persistUntil === 'forever') {
                    // persist forever
                }
            }
        }
    })
}

const VERSION = "1.0.0";
export { VERSION };


export function lol() {
    console.log("qwoidjqwoidjqodjdwoij")
}