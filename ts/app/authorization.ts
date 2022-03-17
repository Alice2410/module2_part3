const authorizationForm = document.getElementById('authorization-form');
const userEmail = <HTMLInputElement>document.getElementById('email');
const userPassword = <HTMLInputElement>document.getElementById('password');

authorizationForm?.addEventListener("submit", startAuthorization);

function startAuthorization(e: Event) {
    e.preventDefault();
    loginWithToken();
}

async function loginWithToken() { 
    let user = {
        email: userEmail.value,
        password: userPassword.value
    };
    
    try {
        const response = await fetch( loginURL,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(user),
        });
        
        checkTokenResponse(response);
        const jsonObj: Token = await response.json();
        const tokenJson = tokenIs(jsonObj);
        if (tokenJson) {
            saveToken(tokenJson);
            saveTokenReceiptTime();
        }
        redirect();
    } catch (error) {
        console.log(error) 
    } 

}

function redirect() {
    const currentPage = window.location;
    const pageNumber = currentPage.search;

    authorizationForm?.removeEventListener("submit", startAuthorization);

    if (pageNumber) {
        window.location.href = "gallery.html" + pageNumber;
    } else {
        window.location.href = "gallery.html" + "?page=1";
    }
}

function saveToken(json: Token) {
    localStorage.setItem (localStorageTokenKey, JSON.stringify(json));
}

function saveTokenReceiptTime() {
    let tokenReceiptTime = Date.now();
    localStorage.setItem (tokenTimestampKey, JSON.stringify(tokenReceiptTime));
}

function checkTokenResponse(response: Response) {
    if (response.ok){
        return response;
    } else {
        let TokenErrorElement = document.getElementById('token-error');
        if (TokenErrorElement) {
            TokenErrorElement.innerHTML = 'Ошибка получения токена. Введите верные логин и пароль.';
        }
    }

    throw new Error(`${response.status} — ${response.statusText}`);
}

function tokenIs (json: Token) {

    if (json.token){ 
        return json;
    } else {
        let TokenErrorElement = document.getElementById('token-error');
        if (TokenErrorElement) {
            TokenErrorElement.innerHTML = 'Ошибка получения токена';

            return json;
        }
    }
}