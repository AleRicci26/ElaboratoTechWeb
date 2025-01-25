async function ShowSellerHomePage() {
    await ShowSellerNavbar();
    await ShowSellerFooter();

    const theUrl = "api-products.php"

   

    fetch(theUrl, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json()).then(jsonRes => {

        //console.log(jsonRes.length)
        let theInnerProducts = ``

        for(let theColNum = 0; theColNum < jsonRes.length; theColNum++){
            let theImageUrl = jsonRes[theColNum].ImageName
            let theName = jsonRes[theColNum].Name
            let thePrice = jsonRes[theColNum].Price
            let theUID = jsonRes[theColNum].ProductId

            theInnerProducts += `
                <div class="product">
                    <div class="product_child-1">
                            <button class='product_editBtn' uid='${theUID}'>Edit</button>
                        <h3>22</h3>
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

        let theOuterContent = `
            <div class="theOuterDiv">            
                <div class="addNewItem">
                    <button>Add An Item</button>           
                </div>                    
                ${theInnerProducts}
                <section>
                    <form>
                        <input type="text" placeholder="Name" name="productName"/>
                        <input type="text" placeholder="Price" name="productPrice"/>
                        <input type="file" placeholder="FileName" name="productFile"/>
                        
                        <input type="submit" value="Add Iten"/>
                    </form>
                </section>
                <section>
                    <form>
                        <input type="text" placeholder="Name" name="productName"/>
                        <input type="text" placeholder="Price" name="productPrice"/>
                        
                        <input type="submit" value="Update"/>
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

            //instance of a form
            let theFormData = new FormData()
            //assigning values to the Form
            theFormData.append('name', theProductName)
            theFormData.append('price', theProductPrice)
            theFormData.append('file', theProductFile)

            //send form data to the API
            let response = await fetch('./api-new-seller-item.php', {
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
                fetch('./api-product-Id.php', {
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
                    let updateBtn = theSections[1].getElementsByTagName('input')[2]
                    nameInupt.value = res.Name
                    priceInput.value = res.Price
                    updateBtn.setAttribute('uid', res.ProductId)
                    theSections[1].classList.add('show')
                })

                
            })
        }

        let theUpdateBtn = theSections[1].getElementsByTagName('input')[2]

        theUpdateBtn.addEventListener('click', (e)=>{
            e.preventDefault()
            let theUID = e.target.getAttribute('uid')
            let theNewName = theSections[1].getElementsByTagName('input')[0].value
            let theNewPrice = theSections[1].getElementsByTagName('input')[1].value
            
            let theJSForm = new FormData()
            theJSForm.append('ProductId', theUID )
            theJSForm.append('Name', theNewName )
            theJSForm.append('Price', theNewPrice)

            fetch('./api-update-product.php', {
                method: "POST",
                body: theJSForm
            }).then(res => {
                if(res.ok){
                    return res.json()
                }
                return console.log('un able to update')
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
    })
}

async function ShowSellerFooter() {
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
        ShowSellerHomePage();
    });

    icons[1].addEventListener("click", e => {
        e.preventDefault();
        ShowSearchPage();
    });

    icons[2].addEventListener("click", e => {
        e.preventDefault();
        ShowSellerHomePage();
    });

    icons[3].addEventListener("click", e => {
        e.preventDefault();
        ShowSellerHomePage();
    });
}