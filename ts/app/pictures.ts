const linksList = document.getElementById('links');
let tokenObject: Token;
setInterval(checkTokenIs, 5000);
checkLocalStorage();
goToNewGalleryPage();
linksList?.addEventListener("click", createNewAddressOfCurrentPage);


async function goToNewGalleryPage() { 
    let requestGalleryURL = basicGalleryURL + window.location.search;
    
    try {
        const response = await fetch( requestGalleryURL,
            {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': tokenObject.token
                }
            }
        );
        
        checkResponse(response);
        let responseObj = await response.json();
        createLinks(responseObj);
        createImages(responseObj);
    } catch(error) {
        console.log(error);
        alert(error);
    }
}

function createLinks(imagesObject: Gallery){
    console.log (imagesObject);
    let totalPages = imagesObject.total;
    let linksSection = document.getElementById("links");

    for ( let i = 1; i <= totalPages; i++) {
        let pictureLink = document.createElement('li');
        pictureLink.innerHTML = `<a>${i}</a>`
        linksSection?.append(pictureLink);
    }

    return imagesObject;
}

function createImages(imagesObject: Gallery) {
        let imagesArray = imagesObject.objects;
        let imageSection = document.getElementById("photo-section");

        for ( let i = 0; i < imagesArray.length; i++) {
            let galleryImage = document.createElement('img');
            galleryImage.src = './resources/images/' + imagesArray[i];
            imageSection?.append(galleryImage);
        }
}

function checkTokenIs() {
    if ((Date.now() - JSON.parse(localStorage.getItem(tokenTimestampKey) || "")) >= 10000000) {
        localStorage.removeItem(localStorageTokenKey);
        localStorage.removeItem(tokenTimestampKey);
        linksList?.removeEventListener("click", createNewAddressOfCurrentPage);
        redirectToAuthorization();
    }
}

function redirectToAuthorization() {
        let currentPage = window.location;
        let searchParam = currentPage.search;
        window.location.href = "index.html" + searchParam;
}

function checkResponse (response: Response) {
    if (response.ok) {
        return response;
    } 

    let errorMessage: string;

    if (response.status === 403) {
        errorMessage = "Токен некорректен или отсутствует. Повторите авторизацию."
        writeErrorMessage (errorMessage,response);
    } else if (response.status === 404) {
        errorMessage = "Такой страницы не существует."
        writeErrorMessage (errorMessage, response);
    }

    throw new Error(`${response.status} — ${response.body}`);
    
}

function checkLocalStorage () {
    if (localStorage.getItem(localStorageTokenKey)) {
        tokenObject = JSON.parse(localStorage.getItem(localStorageTokenKey) || '');
     } else {
         redirectToAuthorization()
     }
}

function createNewAddressOfCurrentPage(e: Event) {
    let number = (e.target as HTMLLinkElement).textContent;
    window.location.href = "gallery.html" + "?page=" + number;
}

function writeErrorMessage (message: string, response: Response) {
    const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.innerHTML = message;

            const toAuthorizationLink = document.getElementById('back-gallery');
            if (toAuthorizationLink) {

                toAuthorizationLink.classList.remove('back-link--disabled');
                toAuthorizationLink.classList.add('aback-link--abled');
                toAuthorizationLink.addEventListener("click", redirectToAuthorization);
            }
        }  
    throw new Error(`${response.status} — ${response.body}`);
}
            
