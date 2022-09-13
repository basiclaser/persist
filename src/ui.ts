import {
    PersistOptions,
    verbalise,
    getLocalStoragePersistRelatedData
} from "./index.js";

export function showPersistManager(persistOptions: PersistOptions) {
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
        //@ts-ignore
        persistManagerWrapper.style.display = "none";
    });

    const persistManagerButtonToggle = persistManagerButton.querySelector(".persist-manager__button__toggle");
    const persistManagerWrapper = persistManager.querySelector(".persist-manager__wrapper");
    const persistManagerWrapperInnerList = persistManager.querySelector(".persist-manager__wrapper__inner__list");
    persistManagerButtonToggle.addEventListener("click", () => {
        //@ts-ignore
        persistManagerWrapper.style.display = persistManagerWrapper.style.display === "none" ? "block" : "none";
    });
    const persistedData = getLocalStoragePersistRelatedData(persistOptions);
    persistedData.forEach((data) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<a href="#" class="persist-manager__wrapper__inner__list__item" data-persist-name="${data.name}">${data.name}</a>`;
        persistManagerWrapperInnerList.appendChild(listItem);
    });
    const persistManagerWrapperInnerListItems = persistManager.querySelectorAll(".persist-manager__wrapper__inner__list__item");
    persistManagerWrapperInnerListItems.forEach((item) => {
        item.addEventListener("click", (event) => {
            event.preventDefault();
            const persistName = item.getAttribute("data-persist-name")

            if (persistName) {
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
    function downloadAs(as: "json" | "csv") {
        const data = getLocalStoragePersistRelatedData();
        const dataString = as === "json" ? JSON.stringify(data) : data.map((d: any) => `${d.name},${d.value}`).join("\n");
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
    persistOptions.verbose && verbalise("persist manager added to DOM");
}