async function ShowFooter() {
    const iconHome = await LoadSvg("icon-home");
    const iconSearch = await LoadSvg("icon-search");
    const iconUser = await LoadSvg("icon-user");
    const iconCart = await LoadSvg("icon-cart");

    document.querySelector("footer").innerHTML = `
        <ul>
            <li>
                <figure>
                    ${iconHome}
                </figure>
            </li>
            <li>
                <figure>
                    ${iconSearch}
                </figure>
            </li>
            <li>
                <figure>
                    ${iconUser}
                </figure>
            </li>
            <li>
                <figure>
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
            <figure>
                ${iconLogout}
            </figure>
        </li>
        <li>
        </li>
        <li>
            <figure>
                ${iconNotifications}
            </figure>
        </li>
    </ul>`;

    document.querySelector("nav > ul > li:first-child").addEventListener(EVENT_CLICK, e => {
        e.preventDefault();
        Logout();
    })
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
            articles += `
                <article id="prod-${products[i]["ProductId"]}">
                    <header>
                        <h2>${products[i]["Name"]}</h2>
                    </header>
                    <section>
                        <figure>
                            <img src="${products[i]["ImageName"]}" alt=""/>
                            <figcaption></figcaption>
                        </figure>
                        <aside>
                            <h2>$${products[i]["Price"]}</h2>
                            <section>
                                <h2>${products[i]["PlayerNumFrom"]}-${products[i]["PlayerNumTo"]}</h2>
                            </section>
                        </aside>
                    </section>
                    <footer>
                        <h2>${products[i]["ShortDesc"]}</h2>
                    </footer>
                </article>`
        }

        main.innerHTML = `
            <section>
                ${articles}
            </section>`;

        document.querySelectorAll("main > section > article").forEach(element => {
            element.addEventListener(EVENT_CLICK, e => {
                e.preventDefault();
                
                let element = FindClosestParentOfEventArgs(e, "article");
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

    document.querySelector("main > section:last-child > h2")
        .innerHTML = `Total: ${total} €`;
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
                <article id="cart-prod-${cartProducts[i]["ProductId"]}">
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
                // TEST
        }

        main.innerHTML = `
            <section>
                ${articles}
            </section>
            <section>
                <h2>Total: 0.00 €</h2>
                <input type="button" value="Procedi all'acquisto"/>
            </section>`;

        RecalculateCartProductsTotalPrice();

        document.querySelector(`main > section:last-child > input[type="button"]`).addEventListener(EVENT_CLICK, e => {
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

    await ExecutePostRequest("api-cart.php", formData, result => {
        console.log(result);
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
            <article>
                <header>
                    <h2>${result["Name"]}</h2>
                </header>
                <section>
                    <figure>
                        <img src="${result["ImageName"]}" alt=""/>
                        <figcaption></figcaption>
                    </figure>
                    <aside>
                        <h2>$${result["Price"]}</h2>
                        <section>
                            <h2>${result["PlayerNumFrom"]}-${result["PlayerNumTo"]}</h2>
                        </section>
                    </aside>
                </section>
                <footer>
                    <h2>${result["ShortDesc"]}</h2>
                    <input type="button" value="Aggiungi al carrello"/>
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
    document.querySelector("main").innerHTML = ``;

    document.querySelector("nav > ul > li:nth-child(2)").innerHTML = `
        <input type="search" value="" placeholder="Cerca..."/>`;

    document.querySelector(`input[type="search"]`).addEventListener(EVENT_INPUT, e => {
        let text = document.querySelector(`input[type="search"]`).value;
        ShowSearchPageResults(text);
    });
}

async function ShowSearchPageResults(textFilter) {
    const formData = new FormData();
    formData.append("TextFilter", textFilter);

    await ExecutePostRequest("api-search.php", formData, result => {
        let main = document.querySelector("main");
        let articles = "";

        for (let i = 0; i < result.length; i++) {
            articles += `
                <article id="prod-${result[i]["ProductId"]}">
                    <header>
                        <h2>${result[i]["Name"]}</h2>
                    </header>
                    <section>
                        <figure>
                            <img src="${result[i]["ImageName"]}" alt=""/>
                            <figcaption></figcaption>
                        </figure>
                        <aside>
                            <h2>$${result[i]["Price"]}</h2>
                            <section>
                                <h2>${result[i]["PlayerNumFrom"]}-${result[i]["PlayerNumTo"]}</h2>
                            </section>
                        </aside>
                    </section>
                    <footer>
                        <h2>${result[i]["ShortDesc"]}</h2>
                    </footer>
                </article>`
        }

        main.innerHTML = `
            <section>
                ${articles}
            </section>`;

        document.querySelectorAll("main > section > article").forEach(element => {
            element.addEventListener(EVENT_CLICK, e => {
                e.preventDefault();
                
                let element = FindClosestParentOfEventArgs(e, "article");
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
            <section class="wallet">
                <h2>Disponibilità</h2>
                <h1 id="budget">${budget["Budget"]} €</h1>
                <input type="button" id="handle-button" value="Gestisci"/>
            </section>`;

        return resultHtml;
    }, error => console.log(error));
}

function RefreshUserBudget(newBudget) {
    document.querySelector("#budget").innerHTML =
        `Disponibilita': <strong>${newBudget} €</strong>`;
}

async function ChargeUserWallet($money) {
    const formData = new FormData();
    formData.append("action", 2);
    formData.append("Money", $money);

    await ExecutePostRequest("api-wallet.php", formData, async result => {
        RefreshUserBudget(result["newBudget"]);
    }, error => console.log(error));
}

async function WithdrawUserWallet($money) {
    const formData = new FormData();
    formData.append("action", 3);
    formData.append("Money", $money);

    await ExecutePostRequest("api-wallet.php", formData, async result => {
        RefreshUserBudget(result["newBudget"]);
    }, error => console.log(error));
}

async function ShowUserOrders() {
    const formData = new FormData();
    formData.append("action", 2);

    return await ExecutePostRequest("api-orders.php", formData, async orders => {
        let ordersHtml = "";

        for (let i = 0; i < orders.length; i++) {
            const currentOrder = orders[i];
            let orderDetailsHtml = "";

            const innerFormData = new FormData();
            innerFormData.append("action", 3);
            innerFormData.append("OrderId", currentOrder["OrderId"]);

            await ExecutePostRequest("api-orders.php", innerFormData, orderDetails => {
                for (let j = 0; j < orderDetails.length; j++) {
                    let currentOrderDetail = orderDetails[j];

                    orderDetailsHtml += `
                        <tr>
                            <td>${currentOrderDetail["RowNum"]}</td>
                            <td>${currentOrderDetail["Name"]}</td>
                            <td>${currentOrderDetail["Quantity"]}</td>
                            <td>${currentOrderDetail["TotalPrice"]} €</td>
                        </tr>`;
                }

                ordersHtml += `
                    <table>
                        <tr>
                            <td><strong>#${currentOrder["OrderId"]}</strong></td>
                            <td>${currentOrder["Description"]}</td>
                        </tr>
                        <tr>
                            <table>
                                <thead>
                                    <td>Riga</td>
                                    <td>Prodotto</td>
                                    <td>Quantita'</td>
                                    <td>Prezzo Totale</td>
                                </thead>
                                ${orderDetailsHtml}
                            </table>
                        </tr>
                    </table>`;
            }, innerError => console.log(innerError));
        }

        const resultHtml = `
            <section class="orders">
                <table>
                    <caption>I tuoi ordini</caption>
                    ${ordersHtml}
                </table>
            </section>`;

        return resultHtml;
    }, error => console.log(error));
}

async function ShowHandleWalletModal() {
    return `
        <div id="theOuterDiv">            
            <div id="addNewItem">
                <button>Add An Item</button>           
            </div>                    
            <section>
                <input type="number" step=".01" value="0.00"/>
                <section>
                    <input type="button" id="withdraw-button" value="Preleva"/>
                    <input type="button" id="charge-button" value="Carica"/>
                </section>
            </section>
        </div>`;
}

async function EnableHandleWalletModal() {
    document.querySelector("main > div > section").classList.add("show");
}

async function Logout() {
    await ExecutePostRequest("api-secure-logout.php", new FormData(), async res => {
        this.ShowLoginPage();
    }, error => console.log(error));
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