this.ShowLoginPage();

async function ShowLoginPage() {
    document.querySelector("main").innerHTML = `
        <form action="" method="POST">
            <fieldset>
                <label for="email">Email: </label>
                <input type="email" id="email" name="email" placeholder="Email *" required value="test.prova@gmail.com"/>
                <label for="password">Password: </label>
                <input type="password" id="password" name="password" placeholder="Password *" required value="test"/>
            </fieldset>
            <input type="submit" value="Accedi"/>
            <p class="error"></p>
            <p>Non hai un account? <a href="javascript:ShowSignUpPage()">Registrati</a></p>
        </form>`;

    document.querySelector("main form input[type=submit]").addEventListener(EVENT_CLICK, e => {
        e.preventDefault();

        if (ReportAndCheckFormValidity(document.querySelector("form"))) {
            Login();
        }
    });

    document.querySelector("nav").innerHTML = "";
    document.querySelector("footer").innerHTML = "";
}

async function ShowSignUpPage() {
    document.querySelector("main").innerHTML = `
        <form action="" method="POST">
            <fieldset>
                <input type="email" id="email" name="email" placeholder="Email *" required/>
                <input type="tel" id="tel" name="tel" placeholder="Telefono"/>
                <input type="password" id="password" name="password" placeholder="Password *" required/>
                <input type="password" id="confirm-password" name="confirm-password" placeholder="Conferma Password *" required/>
            </fieldset>
            <input type="submit" value="Registrati">
            <p class="error"></p>
            <p>Hai già un account? <a href="javascript:ShowLoginPage()">Accedi</a></p>
        </form>`;

    document.querySelector("main form input[type=submit]").addEventListener(EVENT_CLICK, e => {
        e.preventDefault();

        if (ReportAndCheckFormValidity(document.querySelector("form"))) {
            SignUp();
        }
    });
}

async function Login() {
    const url = 'api-secure-login.php';

    const email = document.querySelector("input[type=email]").value;
    const password = document.querySelector("input[type=password]").value;
    
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    
    try {
        const response = await fetch(url, {
            method: "POST",                   
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        console.log(json);

        if(json["success"]) {
            if (json["role"] == 0) {
                ShowSellerHomePage();
            } else {
                ShowUserHomePage();
            }
        }
        else {
            document.querySelector("form > p").innerText = json["error"];
        }
    } catch (error) {
        console.log(error.message);
    }
}

async function SignUp() {
    const url = 'api-secure-signup.php';

    const password = document.querySelector("#password").value;
    const confirmPassword = document.querySelector("#confirm-password").value;

    if (password !== confirmPassword) {
        document.querySelector("form > p").innerText = "Le password non corrispondono";
        return;
    }

    const email = document.querySelector("input[type=email]").value;
    const phoneNum = document.querySelector("input[type=tel]").value;
    
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('phoneNum', phoneNum);
    
    try {
        const response = await fetch(url, {
            method: "POST",                   
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        console.log(json);

        if(json["success"]) {
            ShowUserHomePage();
        }
        else{
            document.querySelector("form > p").innerText = json["error"];
        }
    } catch (error) {
        console.log(error.message);
    }
}