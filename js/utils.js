EVENT_CLICK = "click";
EVENT_INPUT = "input";
EVENT_CHANGE = "change";

NOTIFICATION_POLL_INTERVAL = 2000;

let cartProducts;
let selectedProductId;

let iconPlayers;
LoadSvg("icon-players").then(res => iconPlayers = res);

function ReportAndCheckFormValidity(form) {
    form.reportValidity();
    return form.checkValidity();
}

async function LoadSvg(name) {
    const response = await fetch(`./resources/${name}.svg`);
    return await response.text();
}

function FindClosestParentTagOfEventArgs(eventArgs, tagName) {
    let element = eventArgs.target || eventArgs.srcElement;
    if (element.tagName.toLowerCase() === tagName) {
        return element;
    }
    return element.closest(tagName);
}

function FindClosestParentClassOfEventArgs(eventArgs, className) {
    let element = eventArgs.target || eventArgs.srcElement;
    if (element.classList.contains(className.toLowerCase())) {
        return element;
    }
    return element.closest(`.${className}`);
}

function ElementIdToDbId(elementId) {
    let strings = elementId.split('-');
    return strings[strings.length - 1];
}

async function ExecutePostRequest(url, formData, onSuccess, onError) {    
    try {
        const response = await fetch(url, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        return onSuccess(await response.json());
    } catch (error) {
        onError(error);
    }
}

function GetCurretDateTime() {
    const date = new Date(Date.now());

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}