import { showPersistManager } from "./ui.js";
export enum PersistMode {
    "persist-for",
    "persist-until",
    "forget-between-versions",
}

export interface PersistOptions {
    namespace: string;
    verbose: boolean;
    cleanup: boolean;
    purge: boolean;
    showPersistManager: boolean;
    version: string;
    highlight: boolean;
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

export interface LocalStoragePersistField {
    value: string | number | boolean;
    name: string;
    version: string;
    createdAt: number;
    modifiedAt: number;
}


export function verbalise(...args: any[]) {
    console.info("persist: ", ...args)
}

function getFieldIdentifier(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
    return field.getAttribute("persist-name") || field.getAttribute("name") || field.getAttribute("id") || field.type || field.tagName.toLowerCase();
}

function getValueFromField(field) {
    switch (field.tagName.toLowerCase()) {
        case "input":
            switch (field.getAttribute("type")) {
                case "checkbox":
                case "radio":
                    //@ts-ignore
                    return field.checked;
                case "number":
                case "range":
                    //@ts-ignore
                    if (field.value) {
                        return parseInt(field.value);
                    } else {
                        return null;
                    }
                default:
                    try {
                        return field.value;
                    } catch (error) {
                        console.error("persist: could not get value from field", field, "because it is not a valid field type")
                        return null;
                    }
            }
        case "textarea":
            return field.value;
        case "select":
            if (field.hasAttribute("multiple")) {
                const options: HTMLOptionElement[] = Array.from(field.querySelectorAll("option"));
                return options.filter((option) => option.selected).map(option => option.value);
            } else {
                return field.value;
            }
        default:
            try {
                return field.value;
            } catch (error) {
                console.error("persist: could not get value from field", field, "because it is not a valid field type")
            }
    }
}

export function persistField(field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, options: PersistOptions) {
    const identifier = `${options.namespace}--${getFieldIdentifier(field)}`;
    const value = getValueFromField(field);
    const data = localStorage.getItem(identifier)
    if (data) {
        localStorage.setItem(identifier,
            JSON.stringify({
                value,
                name: identifier,
                version: options.version,
                createdAt: JSON.parse(data).createdAt,
                modifiedAt: Date.now(),
            } as LocalStoragePersistField)
        );
        options.verbose && verbalise(`updated ${identifier} in local storage with value ${value}`);
    } else {
        localStorage.setItem(identifier,
            JSON.stringify({
                value,
                name: identifier,
                version: options.version,
                createdAt: Date.now(),
                modifiedAt: Date.now(),
            } as LocalStoragePersistField)
        );
        options.verbose && verbalise(`created ${identifier} in local storage with value ${value}`);
    }
}

export function getLocalStoragePersistRelatedData(persistOptions?: PersistOptions): LocalStoragePersistField[] {
    const allValidKeys = Object.keys(localStorage).filter((key) => {
        return key.startsWith(`${persistOptions.namespace}--`);
    });
    const allValidValues = allValidKeys.map((key) => {
        const value = localStorage.getItem(key);
        if (value) {
            return JSON.parse(value as string) as LocalStoragePersistField;
        }
        return null;
    })
    persistOptions?.verbose && verbalise("all persisted values", allValidValues)
    return allValidValues
}

function getAllEligibleFields({ verbose }: PersistOptions): (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[] {
    const allEligbleHTMLFields: (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[] = Array.from(document.querySelectorAll("input, textarea, select"));
    verbose && verbalise("all eligible fields", allEligbleHTMLFields)

    return allEligbleHTMLFields;
}

function checkFieldExpiry(data: LocalStoragePersistField, field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, options: PersistOptions) {
    const identifier = `${options.namespace}--${getFieldIdentifier(field)}`;
    const attributeExists = (attribute: string) => field.hasAttribute(attribute);
    if (attributeExists("persist-for")) {
        const persistFor = parseInt(field.getAttribute("persist-for") as string);
        const timeElapsed = Date.now() - data.createdAt;
        if (timeElapsed > persistFor) {
            localStorage.removeItem(identifier);
            options.verbose && verbalise(`removed ${identifier} from local storage because it has expired`)
            return false
        }
    } else if (attributeExists("persist-until")) {
        const persistUntil = parseInt(field.getAttribute("persist-until") as string);
        if (persistUntil < Date.now()) {
            localStorage.removeItem(identifier);
            options.verbose && verbalise(`removed ${identifier} from local storage because was due to expire on ${new Date(persistUntil)}`)
            return false
        }
    } else if (attributeExists("forget-between-versions")) {
        if (data.version !== options.version) {
            localStorage.removeItem(identifier);
            options.verbose && verbalise(`removed ${identifier} from local storage because the version has changed`)
            return false
        }
    }
    return true;
}

export function persist(options: PersistOptions = { namespace: "persist", showPersistManager: false, verbose: false, cleanup: true, purge: false, version: "1.0.0", highlight: false }) {
    const { verbose, purge, highlight } = options;
    verbose && verbalise("app started with options", options);
    const bodyMode = document.querySelector("body")?.hasAttribute("persist");
    verbose && verbalise("body mode", bodyMode);

    // 0 - if purge is true, remove all persist data
    if (purge) {
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith(`${options.namespace}--`) || key.startsWith(`persist--meta--`)) {
                localStorage.removeItem(key);
            }
        })
    }

    // 1 - get all persisted data from local storage
    const persistedData = getLocalStoragePersistRelatedData(options);

    // 2 - get all eligible fields
    const allEligibleFields = getAllEligibleFields(options);

    // 3 - hydrate, expire, highlight all fields with persist attribute
    allEligibleFields.forEach((field) => {
        if (bodyMode || field.hasAttribute("persist") || field.closest("form")?.hasAttribute("persist")) {
            highlight && (field.style.border = "3px solid #7CFCaa");
            const identifier = `${options.namespace}--${getFieldIdentifier(field)}`;
            const data = persistedData.find((data) => data.name === identifier);
            if (data) {
                if (!checkFieldExpiry(data, field, options)) {
                    return;
                }
                verbose && verbalise("hydrating field", identifier, "with value", data.value);
                switch (field.tagName.toLowerCase()) {
                    case "input":
                        switch (field.getAttribute("type")) {
                            case "file":
                                break;
                            case "checkbox":
                            case "radio":
                                //@ts-ignore
                                field.checked = data.value as boolean;
                                break;
                            case "number":
                            case "range":
                                //@ts-ignore
                                field.value = data.value as number;
                            default:
                                field.value = data.value as string;
                        }
                        break;
                    case "textarea":
                        field.value = data.value as string;
                        break;
                    case "select":
                        if (field.hasAttribute("multiple")) {
                            const values = data.value;
                            //@ts-ignore
                            values.forEach((value) => {
                                const option = field.querySelector(`option[value="${value}"]`);
                                if (option) {
                                    //@ts-ignore
                                    option.selected = true;
                                }
                            })
                        } else {
                            const value = data.value as string;
                            const option = field.querySelector(`option[value="${value}"]`);
                            if (option) {
                                //@ts-ignore
                                option.selected = true;
                            }
                        }
                        break;
                    default:
                        try {
                            field.value = data.value as string;
                        } catch (error) {
                            console.error("persist: could not hydrate field", field, "with value", data.value, "because it is not a valid field type")
                        }
                }
            }
        }
    });

    // 4 - add event listeners to all eligible fields
    allEligibleFields.forEach((field) => {
        if (bodyMode || field.hasAttribute("persist") || field.closest("form")?.hasAttribute("persist")) {
            const persistOnBlur = field.hasAttribute("persist-on-blur");
            const persistOnSubmit = field.hasAttribute("persist-on-submit");

            if (!persistOnBlur && !persistOnSubmit) {
                field.addEventListener("change", () => {
                    persistField(field, options);
                })
                field.addEventListener("keypress", (event) => {
                    persistField(field, options);
                })
            } else if (persistOnBlur) {
                field.addEventListener("blur", () => {
                    persistField(field, options);
                })
            } else if (persistOnSubmit) {
                const form = field.closest("form");
                if (form) {
                    form.addEventListener("submit", () => {
                        persistField(field, options);
                    })
                }
            }

        }
    })
    verbose && verbalise("ephemeral fields", allEligibleFields.filter((field) => !field.hasAttribute("persist")))
    verbose && verbalise("persisted fields", allEligibleFields.filter((field) => field.hasAttribute("persist")));
    if (options.showPersistManager) {
        showPersistManager(options);
    }
}

const PERSIST_VERSION = "1.0.0";
export { PERSIST_VERSION };


persist({
    namespace: 'persist-demo',
    version: "1",
    verbose: true,
    cleanup: true,
    purge: false,
    showPersistManager: true,
    highlight: true,
})
