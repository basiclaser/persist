export function showHelpWidget() {
    const helpWidget = document.getElementById("help-widget");
    if (helpWidget !== null) {
        helpWidget.classList.remove("hidden");
    }
}
export function showExportModal() {
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    modal.style.zIndex = "9999";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.flexDirection = "column";
    modal.style.color = "white";
    modal.style.fontFamily = "sans-serif";
    modal.style.fontSize = "1.5rem";
    modal.style.padding = "1rem";
    modal.style.boxSizing = "border-box";
    modal.style.textAlign = "center";
    modal.innerHTML = `
        <div style="max-width: 500px;">
            <h1>Export your persisted data</h1>
            <p>This website uses <b>persist</b> to remember your input data.</p>
            <p>Click the button below to see all the data that is stored in your browser.</p>
            <button id="localStoragePersistShowDataButton">Show data</button>
            <p>Click the button below to delete all the data that is stored in your browser.</p>
            <button id="localStoragePersistDeleteDataButton">Delete data</button>
        </div>
    `;
    document.body.appendChild(modal);
    const showDataButton = modal.querySelector("#localStoragePersistShowDataButton");
    if (showDataButton) {
        showDataButton.addEventListener("click", () => {
            showAllData();
        });
    }
    const deleteDataButton = modal.querySelector("#localStoragePersistDeleteDataButton");
    if (deleteDataButton) {
        deleteDataButton.addEventListener("click", () => {
            if (confirm("Are you sure you want to delete all the data that is stored in your browser?")) {
                localStorage.clear();
                alert("All data has been deleted.");
            }
        });
    }
}
