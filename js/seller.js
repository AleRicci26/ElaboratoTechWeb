async function ShowSellerHomePage() {
    await ShowSellerNavbar();
    await ShowSellerFooter();

    await StartUserNotificationsPoll();

    const theUrl = "api-products.php"

    fetch(theUrl, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json()).then(async jsonRes => {

        //console.log(jsonRes.length)
        let theInnerProducts = ``

        for(let theColNum = 0; theColNum < jsonRes.length; theColNum++){
            let theImageUrl = jsonRes[theColNum].ImageName
            let theName = jsonRes[theColNum].Name
            let thePrice = jsonRes[theColNum].Price
            let theUID = jsonRes[theColNum].ProductId
            let theStockQuantity = jsonRes[theColNum].StockQuantity

            theInnerProducts += `
                <div class="product">
                    <div class="product_child-1">
                            <button class='product_editBtn' uid='${theUID}'>Edit</button>
                        <h3>Disponibilità: ${theStockQuantity}</h3>
                        <button>X</button>
                    </div>
                    <div class="product_child-2">
                        <div class="product_child-2_div-1">
                            <img src="${theImageUrl}"/>
                        </div>
                        <div class="product_child-2_div-2">
                            <h3>${thePrice}$</h3>
                            <h4>4</h4>
                        </div>
                    </div>
                    <div class="product_child-3">
                        <h2>${theName}</h2>
                    </div>

                </div>
            `
        }

        const categorySelectHtml = await CraeteProductCategoriesSelectOptions();

        let theOuterContent = `
            <div class="theOuterDiv">            
                <div class="addNewItem">
                    <button>Aggiungi un prodotto</button>           
                </div>                    
                ${theInnerProducts}
                <section class="modal insert">
                    <form>
                        <label for="productName" class="hide"></label>
                        <input type="text" placeholder="Nome" name="productName" id="productName"/>
                        <label for="productPrice" class="hide"></label>
                        <input type="number" placeholder="Prezzo" name="productPrice" id="productPrice" step=".01"/>
                        <label for="productQuantity" class="hide"></label>
                        <input type="number" placeholder="Quantità" name="productQuantity" id="productQuantity"/>
                        <label for="productShortDesc" class="hide"></label>
                        <input type="text" placeholder="Descrizione" name="productShortDesc" id="productShortDesc"/>
                        <label for="productLongDesc" class="hide"></label>
                        <textarea placeholder="Descrizione estesa" name="productLongDesc" id="productLongDesc"></textarea>
                        ${categorySelectHtml}
                        <label for="productFile" class="hide"></label>
                        <input type="file" placeholder="FileName" name="productFile" id="productFile"/>
                        <input type="submit" value="Aggiungi prodotto"/>
                    </form>
                </section>
                <section class="modal update">
                    <form>
                        <label for="productName" class="hide"></label>
                        <input type="text" placeholder="Nome" name="productName" id="productName"/>
                        <label for="productPrice" class="hide"></label>
                        <input type="number" placeholder="Prezzo" name="productPrice" id="productPrice" step=".01"/>
                        <label for="productQuantity" class="hide"></label>
                        <input type="number" placeholder="Quantità" name="productQuantity" id="productQuantity"/>
                        <label for="productShortDesc" class="hide"></label>
                        <input type="text" placeholder="Descrizione" name="productShortDesc" id="productShortDesc"/>
                        <label for="productLongDesc" class="hide"></label>
                        <textarea placeholder="Descrizione estesa" name="productLongDesc" id="productLongDesc"></textarea>
                        ${categorySelectHtml}
                        <input type="submit" value="Aggiorna prodotto"/>
                    </form>
                </section>
            </div>`
        
        
        document.querySelector("main").innerHTML = theOuterContent

        let thePopWrappers= document.querySelectorAll('section')
        for(let i=0; i<thePopWrappers.length; i++){
            thePopWrappers[i].addEventListener('click', (e)=>{
                console.log(e.target)
                if(e.target.nodeName == "SECTION"){
                    e.target.classList.remove('show')
                }
            })
        }

        let theAddItenBtn = document.querySelector('main div div button')
        theAddItenBtn.addEventListener('click', ()=>{
            thePopWrappers[0].classList.add('show')
        })

        let theForm = document.querySelector('form')
        theForm.addEventListener('submit', async (e) => {
            e.preventDefault()
            let theProductName = document.querySelector('input[name=productName]').value
            let theProductPrice = document.querySelector('input[name=productPrice]').value
            let theProductFile = document.querySelector('input[name=productFile]').files[0]
            let theQuantity = document.querySelector('input[name=productQuantity]').value
            let theShortDesc = document.querySelector('input[name=productShortDesc]').value
            let theLongDesc = document.querySelector('.insert > form > textarea').value
            let theCategory = document.querySelector('.insert > form > label > select').value

            //instance of a form
            let theFormData = new FormData()
            //assigning values to the Form
            theFormData.append('name', theProductName)
            theFormData.append('price', theProductPrice)
            theFormData.append('file', theProductFile)
            theFormData.append('category', theCategory)
            theFormData.append('quantity', theQuantity)
            theFormData.append('shortDesc', theShortDesc)
            theFormData.append('longDesc', theLongDesc)

            //send form data to the API
            let response = await fetch('api-new-seller-item.php', {
                method: "POST",
                body: theFormData
            })
            let result = await response.json()
            console.log(result)

            // Refresh the seller home page to show the new product
            ShowSellerHomePage()
        })

        let theEditButtons = document.querySelectorAll('.product_editBtn')
        let theSections = document.querySelectorAll('section')
        for(let  i=0; i<theEditButtons.length; i++){
            theEditButtons[i].addEventListener('click', (e)=>{
                let UID = e.target.getAttribute('uid')
                let theJSForm = new FormData()
                theJSForm.append('ProductId', UID)
                fetch('api-product-Id.php', {
                    method: "POST",
                    body: theJSForm
                }).then(res => {
                    if(res.ok){
                        return res.json()
                    }
                    return console.log('something went wrong')
                }).then(res => {
                    let nameInupt = theSections[1].getElementsByTagName('input')[0]
                    let priceInput = theSections[1].getElementsByTagName('input')[1]
                    let theNewQuantity = theSections[1].getElementsByTagName('input')[2];
                    let theNewShortDesc = theSections[1].getElementsByTagName('input')[3];
                    let theNewLongDesc = theSections[1].getElementsByTagName('textarea')[0];
                    let theNewCategory = theSections[1].getElementsByTagName('select')[0];
                    let updateBtn = theSections[1].getElementsByTagName('input')[4];

                    nameInupt.value = res.Name
                    priceInput.value = res.Price
                    theNewQuantity.value = res.StockQuantity
                    theNewShortDesc.value = res.ShortDesc
                    theNewLongDesc.value = res.LongDesc
                    theNewCategory.value = res.Category

                    updateBtn.setAttribute('uid', res.ProductId)
                    theSections[1].classList.add('show')
                })

                
            })
        }

        let theUpdateBtn = theSections[1].getElementsByTagName('input')[4]

        theUpdateBtn.addEventListener('click', (e)=>{
            e.preventDefault()
            let theUID = e.target.getAttribute('uid')
            let theNewName = theSections[1].getElementsByTagName('input')[0].value
            let theNewPrice = theSections[1].getElementsByTagName('input')[1].value
            let theNewQuantity = theSections[1].getElementsByTagName('input')[2].value;
            let theNewShortDesc = theSections[1].getElementsByTagName('input')[3].value;
            let theNewLongDesc = theSections[1].getElementsByTagName('textarea')[0].value;
            let theNewCategory = theSections[1].getElementsByTagName('select')[0].value;
            
            let theJSForm = new FormData()
            theJSForm.append('ProductId', theUID )
            theJSForm.append('Name', theNewName )
            theJSForm.append('Price', theNewPrice)
            theJSForm.append('category', theNewCategory)
            theJSForm.append('quantity', theNewQuantity)
            theJSForm.append('shortDesc', theNewShortDesc)
            theJSForm.append('longDesc', theNewLongDesc)

            fetch('api-update-product.php', {
                method: "POST",
                body: theJSForm
            }).then(res => {
                if(res.ok){
                    ShowSellerHomePage()
                    return res.json()
                }
                return console.log('unable to update')
            }).then(res => console.log(res))
        
        })
    })
}

// Copia delle funzioni ShowNavbar e ShowFooter da customer.js

async function ShowSellerNavbar() {
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
    });

    document.querySelector("nav > ul > li:last-child").addEventListener(EVENT_CLICK, e => {
        e.preventDefault();
        ShowUserNotificationPage();
    });
}

async function ShowSellerFooter() {
    const iconHome = await LoadSvg("icon-home");
    const iconUser = await LoadSvg("icon-user");

    document.querySelector("footer").innerHTML = `
        <ul>
            <li>
                <figure>
                    ${iconHome}
                </figure>
            </li>
            <li>
                <figure>
                    ${iconUser}
                </figure>
            </li>
        </ul>`;

    let icons = document.querySelectorAll("footer ul li");

    icons[0].addEventListener("click", e => {
        e.preventDefault();
        ShowSellerHomePage();
    });

    icons[1].addEventListener("click", e => {
        e.preventDefault();
        ShowSellerOrdersPage();
    });
}

async function CraeteProductCategoriesSelectOptions() {
    let optionsHtml = "";

    const categories = await ExecutePostRequest("api-product-categories.php", new FormData(), async categories => {        
        return categories;
    }, error => console.log(error));

    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];

        optionsHtml += `
            <option value="${category["CategoryId"]}"}>
                ${category["Description"]}
            </option>`;
    }

    return `
        <label>
            Categoria: 
            <select name="select-product-category">
                ${optionsHtml}
            </select>
        </label>`;
}

async function CreateChangeOrderStatusSelectOptions(selectId, statusId) {
    const formData = new FormData();
    formData.append("action", 4);

    const statusList = await ExecutePostRequest("api-seller-orders.php", formData, async res => {
        return res;
    }, error => console.log(error));

    let optionsHtml = "";

    for (let i = 0; i < statusList.length; i++) {
        const currentStatus = statusList[i];

        optionsHtml += `
            <option value="${currentStatus["StatusId"]}" ${currentStatus["StatusId"] == statusId ? "selected" : ""}>
                ${currentStatus["Description"]}
            </option>`;
    }

    return `
        <label>
            Stato: 
            <select name="change-order-status" id="${selectId}">
                ${optionsHtml}
            </select>
        </label>`;
}

async function GetAllUsersOrders() {
    const formData = new FormData();
    formData.append("action", 1);

    return await ExecutePostRequest("api-seller-orders.php", formData, async users => {
        let usersHtml = "";

        for (let i = 0; i < users.length; i++) {
            const currentUser = users[i];
            let ordersHtml = "";

            const userFormData = new FormData();
            userFormData.append("action", 2);
            userFormData.append("UserId", currentUser["UserId"]);

            await ExecutePostRequest("api-seller-orders.php", userFormData, async orders => {
                for (let j = 0; j < orders.length; j++) {
                    const currentOrder = orders[j];
                    const orderId = currentOrder["OrderId"];

                    let orderDetailsHtml = "";
        
                    const innerFormData = new FormData();
                    innerFormData.append("action", 2);
                    innerFormData.append("OrderId", currentOrder["OrderId"]);
        
                    await ExecutePostRequest("api-orders.php", innerFormData, async orderDetails => {
                        for (let k = 0; k < orderDetails.length; k++) {
                            let currentOrderDetail = orderDetails[k];
        
                            orderDetailsHtml += `
                                <tr>
                                    <td>${currentOrderDetail["RowNum"]}</td>
                                    <td>${currentOrderDetail["Name"]}</td>
                                    <td>${currentOrderDetail["Quantity"]}</td>
                                    <td>${currentOrderDetail["TotalPrice"]} €</td>
                                </tr>`;
                        }

                        const selectId = `change-status-${currentOrder["OrderId"]}`;
                        const statusId = currentOrder["Status"];

                        const optionsHtml = await CreateChangeOrderStatusSelectOptions(selectId, statusId);
        
                        ordersHtml += `
                            <table>
                                <thead>
                                    <tr class="order-header">
                                        <th class="${OrderStatusToClass(currentOrder["Status"])}"></th>
                                        <th>Ordine #${orderId}</th>
                                        <th>${optionsHtml}</th>
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
                    }, orderDetailsError => console.log(orderDetailsError));
                }

                usersHtml += `
                    <table>
                        <thead>
                            <tr>
                                <td><strong>Utente: ${currentUser["UserId"]}</strong></td>
                                <td>Mail: ${currentUser["Email"]}</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="2">
                                    ${ordersHtml}
                                </td>
                            </tr>
                        </tbody>
                    </table>`;
            }, ordersError => console.log(ordersError));
        }

        const resultHtml = `
            <section class="seller-orders">
                <caption>Ordini utenti</caption>
                <table>
                    ${usersHtml}
                </table>
            </section>`;

        return resultHtml;
    }, error => console.log(error));
}

async function ChangeOrderStatus(orderId, statusId) {
    const formData = new FormData();
    formData.append("action", 3);
    formData.append("OrderId", orderId);
    formData.append("StatusId", statusId);

    await ExecutePostRequest("api-seller-orders.php", formData, async res => {
        const select = document.querySelector(`#change-status-${orderId}`);
        const orderHeader = FindClosestParentClassOfElement(select, "order-header");

        const statusCell = orderHeader.children[0];

        statusCell.classList.remove("success");
        statusCell.classList.remove("warning");
        statusCell.classList.remove("error");

        statusCell.classList.add(OrderStatusToClass(statusId));
    }, error => console.log(error));
}

async function ShowSellerOrdersPage() {
    await ClearPageControls();
    await ChangeSelectedIcon(2);
    
    const ordersHtml = await GetAllUsersOrders();

    document.querySelector("main").innerHTML = ordersHtml;

    document.querySelectorAll("select").forEach(select => {
        select.addEventListener(EVENT_CHANGE, e => {
            e.preventDefault();

            const orderId = ElementIdToDbId(e.target.id);
            const statusId = e.target.value;

            ChangeOrderStatus(orderId, statusId);
        })
    });
}