async function ShowSellerHomePage() {
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

            theInnerProducts +=
             `<div id="sellerItemWrapper">
                    <img id="previewImage" src="${theImageUrl}"/>
                    <h3 id="previewTitle">${theName}</h3>
                    <button id="previewEdit">${thePrice}</button>
                    <button id="previewDelete">Delete</button>
            </div>`
        }

        let theOuterContent = `
            <div id="theOuterDiv">            
                <div id="addNewItem">
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
            </div>`
        
        
        document.querySelector("main").innerHTML = theOuterContent

        let thePopWrapper = document.querySelector('section')
        thePopWrapper.addEventListener('click', (e)=>{
            if(e.target.nodeName == "SECTION"){
                e.target.classList.remove('show')
            }
        })

        let theAddItenBtn = document.querySelector('main div div button')
        theAddItenBtn.addEventListener('click', ()=>{
            thePopWrapper.classList.add('show')
        })

        let theForm = document.querySelector('form')
        theForm.addEventListener('submit', async (e)=>{
             e.preventDefault()
             let theProductName = document.querySelector('input[name=productName]').value
             let theProductPrice = document.querySelector('input[name=productPrice]').value
             let theProductFile = document.querySelector('input[name=productFile]').value
             theProductFile = theProductFile.replace('C:\\fakepath\\', "")
            //instance of a form
             let theFormData = new FormData()
             //assigning values to the FOrm
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

             //refresh page
             ShowSellerHomePage()
             


        })

        

    })


}