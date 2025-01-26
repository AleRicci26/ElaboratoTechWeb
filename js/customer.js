async function ShowFooter() {
    const iconHome = await LoadSvg("icon-home");
    const iconSearch = await LoadSvg("icon-search");
    const iconUser = await LoadSvg("icon-user");
    const iconCart = await LoadSvg("icon-cart");

    document.querySelector("footer").innerHTML = `
        <ul>
            <li>
                <figure class="scale-on-hover">
                    ${iconHome}
                </figure>
            </li>
            <li>
                <figure class="scale-on-hover">
                    ${iconSearch}
                </figure>
            </li>
            <li>
                <figure class="scale-on-hover">
                    ${iconUser}
                </figure>
            </li>
            <li>
                <figure class="scale-on-hover">
                    ${iconCart}
                </figure>
            </li>
        </ul>`;

    let icons = document.querySelectorAll("footer ul li");

    icons[0].addEventListener("click", e => {
        e.preventDefault();
        ShowUserHomePage();
    });

    icons[1].addEventListener("click", e => {
        e.preventDefault();
        ShowSearchPage();
    });

    icons[2].addEventListener("click", e => {
        e.preventDefault();
        ShowUserPage();
    });

    icons[3].addEventListener("click", e => {
        e.preventDefault();
        ShowCartPage();
    });
}

async function ShowNavbar() {
    const iconLogout = await LoadSvg("icon-logout");
    const iconNotifications = await LoadSvg("icon-notifications");

    document.querySelector("nav").innerHTML = `
    <ul>
        <li>
            <figure class="scale-on-hover">
                ${iconLogout}
            </figure>
        </li>
        <li>
        </li>
        <li>
            <figure class="scale-on-hover">
                ${iconNotifications}
            </figure>
        </li>
    </ul>`;

    document.querySelector("nav > ul > li:first-child").addEventListener(EVENT_CLICK, e => {
        e.preventDefault();
        Logout();
    });

    document.querySelector("nav > ul > li:last-child").addEventListener(EVENT_CLICK, e => {
        e.preventDefault();
        ShowUserNotificationPage();
    });
}

async function ClearPageControls() {
    document.querySelector("nav > ul > li:nth-child(2)").innerHTML = ``;
}

async function ChangeSelectedIcon(index) {
    document.querySelectorAll("footer ul li figure svg path").forEach(element => {
        element.setAttribute("stroke-width", 1.5);
    });

    document.querySelector(`footer ul li:nth-child(${index}) figure svg path`).setAttribute("stroke-width", 2.5);
}

async function ShowUserHomePage() {
    await ShowNavbar();
    await ShowFooter();
    await ClearPageControls();

    await ChangeSelectedIcon(1);
    await ShowProducts();

    await StartUserNotificationsPoll();
}

function CreateProduct(product) {
    return `
        <article id="prod-${product["ProductId"]}" class="product">
            <header>
                <h2>${product["Name"]}</h2>
            </header>
            <section>
                <figure>
                    <img src="${product["ImageName"]}" alt=""/>
                    <figcaption></figcaption>
                </figure>
                <aside>
                    <h3>${product["Price"]} €</h3>
                    <section>
                        <figure>${iconPlayers}</figure>
                        <h3>${product["PlayerNumFrom"]}-${product["PlayerNumTo"]}</h3>
                    </section>
                </aside>
            </section>
            <footer>
                <h3>${product["ShortDesc"]}</h3>
            </footer>
        </article>`;
}

async function ShowProducts() {
    const url = 'api-products.php';
    
    try {
        const response = await fetch(url, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const products = await response.json();

        let main = document.querySelector("main");
        let articles = "";

        for (let i = 0; i < products.length; i++) {
            articles += CreateProduct(products[i]);
        }

        main.innerHTML = `
            <section>
                ${articles}
            </section>`;

        document.querySelectorAll("main > section > article").forEach(element => {
            element.addEventListener(EVENT_CLICK, e => {
                e.preventDefault();
                
                let element = FindClosestParentTagOfEventArgs(e, "article");
                selectedProductId = ElementIdToDbId(element.id);
                ShowProductDetailsPage();
            });
        });
    } catch (error) {
        console.log(error.message);
    }
}

function RecalculateCartProductsTotalPrice() {
    let total = 0;
    cartProducts.forEach(product => {
        total += product["Price"] * product["Quantity"];
    });

    document.querySelector("main > aside > h2")
        .innerHTML = `Totale: ${total.toFixed(2)} €`;
}

async function ShowCartProducts() {
    const url = 'api-cart.php';

    const formData = new FormData();
    formData.append('action', 1);
    
    try {
        const response = await fetch(url, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        cartProducts = await response.json();

        let main = document.querySelector("main");
        let articles = "";

        for (let i = 0; i < cartProducts.length; i++) {
            articles += `
                <article id="cart-prod-${cartProducts[i]["ProductId"]}" class="product">
                    <header>
                        <h2>${cartProducts[i]["Name"]}</h2>
                    </header>
                    <section>
                        <figure>
                            <img src="${cartProducts[i]["ImageName"]}" alt=""/>
                            <figcaption></figcaption>
                        </figure>
                        <aside>
                            <h2>$${cartProducts[i]["Price"]}</h2>
                            <section>
                                <figure>${iconPlayers}</figure>
                                <h2>${cartProducts[i]["PlayerNumFrom"]}-${cartProducts[i]["PlayerNumTo"]}</h2>
                            </section>
                        </aside>
                    </section>
                    <footer>
                        <section>
                            <h2>-</h2>
                            <h2>${cartProducts[i]["Quantity"]}</h2>
                            <h2>+</h2>
                        </section>
                    </footer>
                </article>`;
        }

        main.innerHTML = `
            <section>
                ${articles}
            </section>
            <aside class="cart">
                <h2>Totale: 0.00 €</h2>
                <input type="button" class="primaryButton" value="Procedi all'acquisto"/>
            </aside>`;

        RecalculateCartProductsTotalPrice();

        document.querySelector(`main > aside > input[type="button"]`).addEventListener(EVENT_CLICK, e => {
            e.preventDefault();
            CheckoutCart();
        });

        let minusButtons = document.querySelectorAll("article > footer > section > h2:first-child");
        for (let i = 0; i < minusButtons.length; i++) {
            minusButtons[i].addEventListener(EVENT_CLICK, e => DecreaseCartProductQuantity(i));
        }

        let plusButtons = document.querySelectorAll("article > footer > section > h2:last-child");
        for (let i = 0; i < plusButtons.length; i++) {
            plusButtons[i].addEventListener(EVENT_CLICK, e => IncreaseCartProductQuantity(i));
        }
            
    } catch (error) {
        console.log(error);
    }
}

async function IncreaseCartProductQuantity(index) {
    const productId = cartProducts[index]["ProductId"];

    const formData = new FormData();
    formData.append("action", 2);
    formData.append("productId", productId);

    await ExecutePostRequest("api-cart.php", formData, newQuantity => {
        cartProducts[index]["Quantity"] = newQuantity;
        document.querySelector(`#cart-prod-${productId} > footer > section > h2:nth-child(2)`)
            .innerHTML = newQuantity;
    }, error => console.log(error));

    RecalculateCartProductsTotalPrice();
}

async function DecreaseCartProductQuantity(index) {
    const productId = cartProducts[index]["ProductId"];

    const formData = new FormData();
    formData.append("action", 3);
    formData.append("productId", productId);

    await ExecutePostRequest("api-cart.php", formData, newQuantity => {
        if (newQuantity <= 0) {
            cartProducts[index]["Quantity"] = 0;
            document.querySelector(`#cart-prod-${productId}`).remove();
        } else {
            cartProducts[index]["Quantity"] = newQuantity;
            document.querySelector(`#cart-prod-${productId} > footer > section > h2:nth-child(2)`)
                .innerHTML = newQuantity;
        }
    }, error => console.log(error));

    RecalculateCartProductsTotalPrice();
}

async function CheckoutCart() {
    const formData = new FormData();
    formData.append("action", 4);

    await ExecutePostRequest("api-cart.php", formData, async result => {
        await StopUserNotificationsPoll();
        await StartUserNotificationsPoll();
        ShowCartPage();
    }, error => console.log(error));

    RecalculateCartProductsTotalPrice();
}

async function ShowProductDetails() {
    const formData = new FormData();
    formData.append("action", 1);
    formData.append("ProductId", selectedProductId);

    await ExecutePostRequest("api-product-details.php", formData, result => {
        document.querySelector("main").innerHTML = `
            <article class="product">
                <header>
                    <h2>${result["Name"]}</h2>
                </header>
                <section>
                    <figure>
                        <img src="${result["ImageName"]}" alt=""/>
                        <figcaption></figcaption>
                    </figure>
                    <aside>
                        <h2>${result["Price"]} €</h2>
                        <section>
                            <h2>${result["PlayerNumFrom"]}-${result["PlayerNumTo"]}</h2>
                        </section>
                    </aside>
                </section>
                <footer>
                    <h2>${result["ShortDesc"]}</h2>
                    <input type="button" class="primaryButton" value="Aggiungi al carrello"/>
                </footer>
            </article>`;
        
        document.querySelector(`article > footer > input[type="button"]`).addEventListener(EVENT_CLICK, e => {
            e.preventDefault();
            AddProductToCart();
        });
    }, error => console.log(error));
}

async function AddProductToCart() {
    const formData = new FormData();
    formData.append("action", 2);
    formData.append("ProductId", selectedProductId);

    await ExecutePostRequest("api-product-details.php", formData, result => {
        console.log(result);
    }, error => console.log(error));
}

async function ShowSearchPageControls() {
    document.querySelector("nav > ul > li:nth-child(2)").innerHTML = `
        <input type="search" value="" placeholder="Cerca..."/>`;

    document.querySelector("main").innerHTML = `
        <section class="filters">
            <section>
                <h3>Giocatori:</h3>
                <section>
                    <label for="playersFrom">Da</label>
                    <input type="number" name="playersFrom" id="playersFrom"/>
                    <label for="playersTo">A</label>
                    <input type="number" name="playersTo" id="playersTo"/>
                </section>
            </section>
            <section>
                <h3>Budget:</h3>
                <section class="no-label">
                    <label for="maxPrice">Budget: </label>
                    <input type="number" name="maxPrice" id="maxPrice"/>
                    <h3> €</h3>
                </section>
            </section>
        </section>
        <section>
        </section>`;

    document.querySelector(`input[type="search"]`).addEventListener(EVENT_INPUT, e => {
        ShowSearchPageResults();
    });

    document.querySelector(`.filters > section:nth-child(1) > section > input[type="number"]:nth-child(2)`).addEventListener(EVENT_INPUT, e => {
        ShowSearchPageResults();
    });

    document.querySelector(`.filters > section:nth-child(1) > section > input[type="number"]:nth-child(4)`).addEventListener(EVENT_INPUT, e => {
        ShowSearchPageResults();
    });

    document.querySelector(`.filters > section:nth-child(2) > section > input[type="number"]`).addEventListener(EVENT_INPUT, e => {
        ShowSearchPageResults();
    });

    ShowSearchPageResults();
}

async function ShowSearchPageResults() {
    const textFilter = document.querySelector(`input[type="search"]`).value == "" ? "%" : document.querySelector(`input[type="search"]`).value;
    const playerFrom = document.querySelector(`.filters > section:nth-child(1) > section > input[type="number"]:nth-child(2)`).value || 0;
    const playerTo = document.querySelector(`.filters > section:nth-child(1) > section > input[type="number"]:nth-child(4)`).value || Number.MAX_VALUE;
    const maxPrice = document.querySelector(`.filters > section:nth-child(2) > section > input[type="number"]`).value || Number.MAX_VALUE;

    const formData = new FormData();
    formData.append("TextFilter", textFilter);
    formData.append("PlayerFrom", playerFrom);
    formData.append("PlayerTo", playerTo);
    formData.append("MaxPrice", maxPrice);

    await ExecutePostRequest("api-search.php", formData, result => {
        let container = document.querySelector("main > section:nth-child(2)");
        let articles = "";

        for (let i = 0; i < result.length; i++) {
            articles += CreateProduct(result[i]);
        }

        container.innerHTML = articles;

        document.querySelectorAll("main > section:nth-child(2) > article").forEach(element => {
            element.addEventListener(EVENT_CLICK, e => {
                e.preventDefault();
                
                let element = FindClosestParentTagOfEventArgs(e, "article");
                selectedProductId = ElementIdToDbId(element.id);
                ShowProductDetailsPage();
            });
        });
    }, error => console.log(error));
}

async function ShowUserPageControls() {
    const budgetHtml = await ShowUserBudget();
    const ordersHtml = await ShowUserOrders();
    const handleWalletHtml = await ShowHandleWalletModal();

    document.querySelector("main").innerHTML = `
        ${budgetHtml}
        ${ordersHtml}
        ${handleWalletHtml}`;

    document.querySelector("main > div > section").addEventListener(EVENT_CLICK, e => {
        if (e.target.nodeName == "SECTION") {
            HideHandleWalletModal();
        }
    })

    document.querySelector("#handle-button").addEventListener(EVENT_CLICK, e => {
        e.preventDefault();
        EnableHandleWalletModal();
    });

    document.querySelector("#charge-button").addEventListener(EVENT_CLICK, e => {
        e.preventDefault();
        const money = document.querySelector(`input[type="number"]`).value;
        ChargeUserWallet(money);
    });

    document.querySelector("#withdraw-button").addEventListener(EVENT_CLICK, e => {
        e.preventDefault();
        const money = document.querySelector(`input[type="number"]`).value;
        WithdrawUserWallet(money);
    });
}

async function ShowUserBudget() {
    const formData = new FormData();
    formData.append("action", 1);

    return await ExecutePostRequest("api-wallet.php", formData, async budget => {
        const resultHtml = `
            <aside class="wallet">
                <h2>Disponibilità</h2>
                <h1 id="budget">${budget["Budget"]} €</h1>
                <input type="button" class="primaryButton" id="handle-button" value="Gestisci"/>
            </aside>`;

        return resultHtml;
    }, error => console.log(error));
}

function RefreshUserBudget(newBudget) {
    document.querySelector("#budget").innerHTML = `${newBudget} €</strong>`;
}

async function ChargeUserWallet($money) {
    const formData = new FormData();
    formData.append("action", 2);
    formData.append("Money", $money);

    await ExecutePostRequest("api-wallet.php", formData, async result => {
        RefreshUserBudget(result["newBudget"]);
        HideHandleWalletModal();
    }, error => console.log(error));
}

async function WithdrawUserWallet($money) {
    const formData = new FormData();
    formData.append("action", 3);
    formData.append("Money", $money);

    await ExecutePostRequest("api-wallet.php", formData, async result => {
        console.log(result);
        RefreshUserBudget(result["newBudget"]);
        HideHandleWalletModal();
    }, error => console.log(error));
}

function OrderStatusToClass(orderStatus) {
    if (orderStatus == 3) {
        return "error";
    }
    return "success";
}

async function ShowUserOrders() {
    const formData = new FormData();
    formData.append("action", 1);

    return await ExecutePostRequest("api-orders.php", formData, async orders => {
        let ordersHtml = "";

        for (let i = 0; i < orders.length; i++) {
            const currentOrder = orders[i];
            const orderId = currentOrder["OrderId"];
            
            let orderDetailsHtml = "";

            const innerFormData = new FormData();
            innerFormData.append("action", 2);
            innerFormData.append("OrderId", currentOrder["OrderId"]);

            await ExecutePostRequest("api-orders.php", innerFormData, orderDetails => {
                for (let j = 0; j < orderDetails.length; j++) {
                    let currentOrderDetail = orderDetails[j];

                    orderDetailsHtml += `
                        <tr>
                            <td headers="${orderId}-row">${currentOrderDetail["RowNum"]}</td>
                            <td headers="${orderId}-product">${currentOrderDetail["Name"]}</td>
                            <td headers="${orderId}-quantity">${currentOrderDetail["Quantity"]}</td>
                            <td headers="${orderId}-price">${currentOrderDetail["TotalPrice"]} €</td>
                        </tr>`;
                }

                ordersHtml += `
                    <table>
                        <thead>
                            <tr class="order-header">
                                <th class="${OrderStatusToClass(currentOrder["Status"])}"></th>
                                <th>Ordine #${orderId}</th>
                                <th>Stato: ${currentOrder["Description"]}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="3">
                                    <table>
                                        <thead>
                                            <th id="${orderId}-row">Riga</th>
                                            <th id="${orderId}-product">Prodotto</th>
                                            <th id="${orderId}-quantity">Quantita'</th>
                                            <th id="${orderId}-price">Prezzo Totale</th>
                                        </thead>
                                        <tbody>
                                            ${orderDetailsHtml}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>`;
            }, innerError => console.log(innerError));
        }

        const resultHtml = `
            <section class="orders">
                <caption>I tuoi ordini</caption>
                <section>
                    ${ordersHtml}
                </section>
            </section>`;

        return resultHtml;
    }, error => console.log(error));
}

async function ShowHandleWalletModal() {
    return `
        <div>
            <section class="modal">
                <form>
                    <label for="amount">Seleziona un importo</label>
                    <input type="number" name="amount" id="amount" step=".01" value="0.00"/>
                    <section>
                        <input type="button" class="primaryButton" id="withdraw-button" value="Preleva"/>
                        <input type="button" class="primaryButton" id="charge-button" value="Carica"/>
                    </section>
                </form>
            </section>
        </div>`;
}

async function HideHandleWalletModal() {
    let modal = document.querySelector("main > div > section");

    modal.classList.remove("show");
    // modal.classList.add("fade-out");
}

async function EnableHandleWalletModal() {
    document.querySelector("main > div > section").classList.add("show");
}

async function Logout() {
    await ExecutePostRequest("api-secure-logout.php", new FormData(), async res => {
        ShowLoginPage();
        StopUserNotificationsPoll();
    }, error => console.log(error));
}

async function ShowUserNotifications() {
    const formData = new FormData();
    formData.append("action", 1);

    await ExecutePostRequest("api-notifications.php", formData, async notifications => {
        const iconTrash = await LoadSvg("icon-trash");
        let notificationsHtml = "";
        
        for (let i = 0; i < notifications.length; i++) {
            const notification = notifications[i];
            const id = notification["NotificationId"];

            notificationsHtml += `
                <section id="notification-${id}" class="notification ${notification["Viewed"] ? "viewed" : ""}">
                    <section>
                        <h2>${notification["TypeDesc"]}</h2>
                        <h3>${notification["Message"]}</h3>
                    </section>
                    <section>
                        <section>
                            <label for="notification-check-${id}">Già letto</label>
                            <input type="checkbox" id="notification-check-${id}" name="notification-check-${id}" ${notification["Viewed"] ? "checked" : ""} class="scale-on-hover"/>
                        </section>
                        <figure class="scale-on-hover">
                            ${iconTrash}
                        </figure>
                    </section>
                </section>`;
        }

        document.querySelector("main").innerHTML = notificationsHtml;

        document.querySelectorAll(`.notification > section:last-child > section > input[type="checkbox"]`).forEach(checkbox => {
            checkbox.addEventListener(EVENT_CLICK, e => {
                e.preventDefault();
                    
                let element = FindClosestParentClassOfEventArgs(e, "notification");
                const notificationId = ElementIdToDbId(element.id);
                const viewed = e.target.checked ? 1 : 0;
    
                ChangeUserNotificationViewedStatus(notificationId, viewed);
            });
        });

        document.querySelectorAll(`.notification > section:last-child > figure`).forEach(trash => {
            trash.addEventListener(EVENT_CLICK, e => {
                e.preventDefault();

                let element = FindClosestParentClassOfEventArgs(e, "notification");
                const notificationId = ElementIdToDbId(element.id);
                
                DeleteUserNotification(notificationId);
            });
        });

    }, error => console.log(error));
}

async function ChangeUserNotificationViewedStatus(notificationId, viewed) {
    const formData = new FormData();
    formData.append("action", 2);
    formData.append("NotificationId", notificationId);
    formData.append("Viewed", viewed);

    await ExecutePostRequest("api-notifications.php", formData, async res => {
        await ShowUserNotifications();
    }, error => console.log(error));
}

async function DeleteUserNotification(notificationId) {
    const formData = new FormData();
    formData.append("action", 3);
    formData.append("NotificationId", notificationId);

    await ExecutePostRequest("api-notifications.php", formData, async res => {
        await ShowUserNotifications();
    }, error => console.log(error));
}

let prevUserNotificationPollDateTime = GetCurretDateTime();
let userNotificationPoll;

async function PollUserNotifications() {
    const formData = new FormData();
    formData.append("action", 4);
    formData.append("PreviousDateTime", prevUserNotificationPollDateTime);

    prevUserNotificationPollDateTime = GetCurretDateTime();

    await ExecutePostRequest("api-notifications.php", formData, async notifications => {
        console.log(notifications);
        if (notifications.length == 0) return;

        const notification = notifications[0];

        let notificationElement = document.createElement("section");
        notificationElement.classList.add("notification-fixed");
        notificationElement.classList.add("notification-popup-in")

        notificationElement.innerHTML = `
            <section class="notification">
                <section>
                    <h2>${notification["TypeDesc"]}</h2>
                    <h3>${notification["Message"]}</h3>
                </section>
            </section>`;

        document.querySelector("body").appendChild(notificationElement);

        setTimeout(() => {
            notificationElement.classList.remove("notification-popup-in");
            notificationElement.classList.add("notification-popup-out");

            setTimeout(() => {
                document.querySelector("body").removeChild(notificationElement);
            }, NOTIFICATION_ALERT_ANIMATION_DURATION - 10);
        }, NOTIFICATION_ALERT_TIMEOUT);
    }, error => console.log(error));
}

async function StartUserNotificationsPoll() {
    clearInterval(userNotificationPoll);
    userNotificationPoll = setInterval(PollUserNotifications, NOTIFICATION_POLL_INTERVAL);

    // PollUserNotifications();
}

async function StopUserNotificationsPoll() {
    clearInterval(userNotificationPoll);
}

// async function 

async function ShowSearchPage() {
    await ClearPageControls();
    await ChangeSelectedIcon(2);
    await ShowSearchPageControls();
}

async function ShowUserPage() {
    await ClearPageControls();
    await ChangeSelectedIcon(3);
    await ShowUserPageControls();
}

async function ShowCartPage() {
    await ClearPageControls();
    await ChangeSelectedIcon(4);
    await ShowCartProducts();
}

async function ShowProductDetailsPage() {
    await ClearPageControls();
    await ShowProductDetails();
}

async function ShowUserNotificationPage() {
    await ClearPageControls();
    await ShowUserNotifications();
}