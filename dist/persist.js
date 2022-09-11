export var PersistMode;
(function (PersistMode) {
    PersistMode[PersistMode["persist-for"] = 0] = "persist-for";
    PersistMode[PersistMode["persist-until"] = 1] = "persist-until";
    PersistMode[PersistMode["forget-between-versions"] = 2] = "forget-between-versions";
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
    PersistSupportedFieldType[PersistSupportedFieldType["text"] = 11] = "text";
    PersistSupportedFieldType[PersistSupportedFieldType["range"] = 12] = "range";
    PersistSupportedFieldType[PersistSupportedFieldType["datetime-local"] = 13] = "datetime-local";
    PersistSupportedFieldType[PersistSupportedFieldType["month"] = 14] = "month";
    PersistSupportedFieldType[PersistSupportedFieldType["password"] = 15] = "password";
    PersistSupportedFieldType[PersistSupportedFieldType["search"] = 16] = "search";
    PersistSupportedFieldType[PersistSupportedFieldType["tel"] = 17] = "tel";
    PersistSupportedFieldType[PersistSupportedFieldType["time"] = 18] = "time";
    PersistSupportedFieldType[PersistSupportedFieldType["week"] = 19] = "week";
})(PersistSupportedFieldType || (PersistSupportedFieldType = {}));
function verbalise(...args) {
    console.info("persist: ", ...args);
}
function getFieldIdentifier(field) {
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
                    console.log(field);
                    if (field.value) {
                        return parseInt(field.value);
                    }
                    else {
                        return null;
                    }
                default:
                    try {
                        return field.value;
                    }
                    catch (error) {
                        console.error("persist: could not get value from field", field, "because it is not a valid field type");
                        return null;
                    }
            }
        case "textarea":
            return field.value;
        case "select":
            if (field.hasAttribute("multiple")) {
                const options = Array.from(field.querySelectorAll("option"));
                return options.filter((option) => option.selected).map(option => option.value);
            }
            else {
                return field.value;
            }
        default:
            try {
                return field.value;
            }
            catch (error) {
                console.error("persist: could not get value from field", field, "because it is not a valid field type");
            }
    }
}
function setValueInField(field) {
}
export function persistField(field, options) {
    const identifier = `${options.namespace}--${getFieldIdentifier(field)}`;
    console.log(identifier, field.getAttribute("name"), field.getAttribute("id"));
    const value = getValueFromField(field);
    const data = localStorage.getItem(identifier);
    console.log(data);
    if (data) {
        localStorage.setItem(identifier, JSON.stringify({
            value,
            name: identifier,
            version: options.version,
            createdAt: JSON.parse(data).createdAt,
            modifiedAt: Date.now(),
        }));
        options.verbose && verbalise(`updated ${identifier} in local storage with value ${value}`);
    }
    else {
        localStorage.setItem(identifier, JSON.stringify({
            value,
            name: identifier,
            version: options.version,
            createdAt: Date.now(),
            modifiedAt: Date.now(),
        }));
        options.verbose && verbalise(`created ${identifier} in local storage with value ${value}`);
    }
}
function getLocalStoragePersistRelatedData(persistOptions) {
    const allValidKeys = Object.keys(localStorage).filter((key) => {
        return key.startsWith(`${persistOptions.namespace}--`);
    });
    const allValidValues = allValidKeys.map((key) => {
        const value = localStorage.getItem(key);
        if (value) {
            return JSON.parse(value);
        }
        return null;
    });
    persistOptions?.verbose && verbalise("all persisted values", allValidValues);
    return allValidValues;
}
function getAllEligibleFields({ verbose }) {
    const allEligbleHTMLFields = Array.from(document.querySelectorAll("input, textarea, select"));
    verbose && verbalise("all eligible fields", allEligbleHTMLFields);
    return allEligbleHTMLFields;
}
function checkFieldExpiry(data, field, options) {
    const identifier = `${options.namespace}--${getFieldIdentifier(field)}`;
    const attributeExists = (attribute) => field.hasAttribute(attribute);
    if (attributeExists("persist-for")) {
        const persistFor = parseInt(field.getAttribute("persist-for"));
        const timeElapsed = Date.now() - data.createdAt;
        if (timeElapsed > persistFor) {
            localStorage.removeItem(identifier);
            options.verbose && verbalise(`removed ${identifier} from local storage because it has expired`);
            return false;
        }
    }
    else if (attributeExists("persist-until")) {
        const persistUntil = parseInt(field.getAttribute("persist-until"));
        if (persistUntil < Date.now()) {
            localStorage.removeItem(identifier);
            options.verbose && verbalise(`removed ${identifier} from local storage because was due to expire on ${new Date(persistUntil)}`);
            return false;
        }
    }
    else if (attributeExists("forget-between-versions")) {
        if (data.version !== options.version) {
            localStorage.removeItem(identifier);
            options.verbose && verbalise(`removed ${identifier} from local storage because the version has changed`);
            return false;
        }
    }
    return true;
}
export function persist(options = { namespace: "persist", showPersistManager: false, verbose: false, cleanup: true, purge: false, version: "1.0.0", highlight: false }) {
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
        });
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
                                field.checked = data.value;
                                break;
                            case "number":
                            case "range":
                                //@ts-ignore
                                field.value = data.value;
                            default:
                                field.value = data.value;
                        }
                        break;
                    case "textarea":
                        field.value = data.value;
                        break;
                    case "select":
                        if (field.hasAttribute("multiple")) {
                            const values = data.value;
                            values.forEach((value) => {
                                const option = field.querySelector(`option[value="${value}"]`);
                                if (option) {
                                    //@ts-ignore
                                    option.selected = true;
                                }
                            });
                        }
                        else {
                            const value = data.value;
                            const option = field.querySelector(`option[value="${value}"]`);
                            if (option) {
                                //@ts-ignore
                                option.selected = true;
                            }
                        }
                        break;
                    default:
                        try {
                            field.value = data.value;
                        }
                        catch (error) {
                            console.error("persist: could not hydrate field", field, "with value", data.value, "because it is not a valid field type");
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
                });
                field.addEventListener("keypress", (event) => {
                    persistField(field, options);
                });
            }
            else if (persistOnBlur) {
                field.addEventListener("blur", () => {
                    persistField(field, options);
                });
            }
            else if (persistOnSubmit) {
                const form = field.closest("form");
                if (form) {
                    form.addEventListener("submit", () => {
                        persistField(field, options);
                    });
                }
            }
        }
    });
    verbose && verbalise("ephemeral fields", allEligibleFields.filter((field) => !field.hasAttribute("persist")));
    verbose && verbalise("persisted fields", allEligibleFields.filter((field) => field.hasAttribute("persist")));
    if (options.showPersistManager) {
        showPersistManager(options);
    }
}
const PERSIST_VERSION = "1.0.0";
export { PERSIST_VERSION };
export function showPersistManager({ verbose }) {
    // show round button for persist manager in bottom right corner like a typical helpdesk plugin
    const persistWrapperMarkup = `
        <div class="persist-manager__button" style="position: fixed; right:20px; bottom:20px">
            <button class="persist-manager__button__toggle" title="Toggle Persist Manager">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.94 8a2 2 0 0 1 3.12 0"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                persist
            </button>
        </div>
    `;
    const persistManagerMarkup = `
        <div class="persist-manager__wrapper" style="position: fixed; right:20px; bottom:20px; display:none">
            <div class="persist-manager__wrapper__inner" style="background-color: #fff; border: 1px solid #ccc; border-radius: 5px; padding: 20px; width: 300px; height: 300px; overflow: auto">
                <div style="display: flex; justify-content: space-between; align-items: center">    
                    <h2>Persist Manager</h2>
                    <!-- collapse manager -->
                    <button class="persist-manager__wrapper__inner__close" title="Close Persist Manager" style="height:40px; width:40px">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.94 8a2 2 0 0 1 3.12 0"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                    </button>
                </div>
                <!-- collapse manager -->
                <!-- download -->
                <p>download the all persist data as JSON or CSV.</p>
                <div style="display: flex; justify-content: space-evenly; align-items: stretch">
                    <button class="persist-manager__wrapper__inner__download_JSON" title="Download Persist Data as JSON">JSON</button>
                    <button class="persist-manager__wrapper__inner__download_CSV" title="Download Persist Data as CSV">CSV</button>
                </div>
                <!-- download -->

                <p>Here you can see all the data that is currently persisted in local storage.</p>
                <p>Click on the name of a field to remove it from local storage.</p>
                <ul class="persist-manager__wrapper__inner__list">
                </ul>
            </div>
        </div>
    `;
    const persistManagerButton = document.createElement("div");
    persistManagerButton.innerHTML = persistWrapperMarkup;
    document.body.appendChild(persistManagerButton);
    const persistManager = document.createElement("div");
    persistManager.innerHTML = persistManagerMarkup;
    document.body.appendChild(persistManager);
    const persistManagerButtonClose = persistManager.querySelector(".persist-manager__wrapper__inner__close");
    persistManagerButtonClose.addEventListener("click", () => {
        persistManagerWrapper.style.display = "none";
    });
    const persistManagerButtonToggle = persistManagerButton.querySelector(".persist-manager__button__toggle");
    const persistManagerWrapper = persistManager.querySelector(".persist-manager__wrapper");
    const persistManagerWrapperInnerList = persistManager.querySelector(".persist-manager__wrapper__inner__list");
    persistManagerButtonToggle.addEventListener("click", () => {
        persistManagerWrapper.style.display = persistManagerWrapper.style.display === "none" ? "block" : "none";
    });
    const persistedData = getLocalStoragePersistRelatedData({ verbose });
    persistedData.forEach((data) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<a href="#" class="persist-manager__wrapper__inner__list__item" data-persist-name="${data.name}">${data.name}</a>`;
        persistManagerWrapperInnerList.appendChild(listItem);
    });
    const persistManagerWrapperInnerListItems = persistManager.querySelectorAll(".persist-manager__wrapper__inner__list__item");
    persistManagerWrapperInnerListItems.forEach((item) => {
        item.addEventListener("click", (event) => {
            event.preventDefault();
            const persistName = item.getAttribute("data-persist-name");
            if (persistName) {
                removePersistedData(persistName, { verbose });
                item.parentElement?.removeChild(item);
            }
        });
    });
    const persistWrapper = document.createElement("div");
    persistWrapper.innerHTML = persistWrapperMarkup;
    persistWrapper.querySelector(".persist-manager__button")?.addEventListener("click", () => {
        persistWrapper.classList.toggle("persist-manager--open");
    });
    // DOWNLOAD BUTTONS
    function downloadAs(as) {
        const data = getLocalStoragePersistRelatedData();
        const dataString = as === "json" ? JSON.stringify(data) : data.map((d) => `${d.name},${d.value}`).join("\n");
        const dataBlob = new Blob([dataString], { type: "application/json" });
        const url = window.URL.createObjectURL(dataBlob);
        const a = document.createElement("a");
        a.download = `persist-data.${as}`;
        a.href = url;
        a.click();
    }
    const persistManagerWrapperInnerDownloadJSON = persistManager.querySelector(".persist-manager__wrapper__inner__download_JSON");
    const persistManagerWrapperInnerDownloadCSV = persistManager.querySelector(".persist-manager__wrapper__inner__download_CSV");
    persistManagerWrapperInnerDownloadJSON.addEventListener("click", () => downloadAs("json"));
    persistManagerWrapperInnerDownloadCSV.addEventListener("click", () => downloadAs("csv"));
    document.body.appendChild(persistManager);
    verbose && verbalise("persist manager added to DOM");
}
