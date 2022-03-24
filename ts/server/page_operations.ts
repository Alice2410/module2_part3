import * as fs from "fs";
import * as url from "url";
import * as pathMod from "path";

const picOnPage = 4;
// const path = './../../public/resources/images';
// const path = '/Users/admin/Desktop/module2_part3/resources/images'
// const path = pathMod.join(__dirname, '../../resources/images')
const path = '/Users/admin/Desktop/module2_part3/public/resources/images'

interface responseObj {
    objects: string[];
    page: number;
    total: number;
}

interface Error{
    errorMessage: string;
}

async function getArrayLength () { //вычисляет количество картинок всего
    const imagesArr = await getImagesArr();
    const arrLength = imagesArr.length;
    
    return arrLength;
}

async function getImagesArr(/*resObj: responseObj*/) { //получает массив строк с адресами всех картинок
    
    // let imagesArr = await makeOneArray(); 
    let imagesArr = await fs.promises.readdir(path);
    // getTotal(resObj,imagesArr);
    
    // return resObj;
    return imagesArr;
}


async function getTotal(resObj: responseObj/*, imagesArr: string[]*/) { //вычисляет количество страниц 
    const picturesAmount = await getArrayLength();                      // назначает TOTAL
    const pagesAmount = Math.ceil(picturesAmount / picOnPage);

    resObj.total = pagesAmount;

    return resObj;
}

function getCurrentPage(obj: responseObj, reqURL: string) { //назначает PAGE
    
    // if (req) {
        const requestedPage = url.parse(reqURL, true).query.page as string;
    
        obj.page = +requestedPage;
        
    // }
    
    return obj;
}

async function getRequestedImages(resObj: responseObj) { //назначает OBJECTS
    const arrForPage: string[] = [];
    const page = resObj.page;
    const picArr = await getImagesArr();

    for (let i = picOnPage * (page - 1); i < picOnPage * page; i++) {
        if (picArr[i]) {
            arrForPage.push(picArr[i]);
        }
    }

    resObj.objects = arrForPage;

    return resObj;
}

function checkPage(resObj: responseObj) {
    
    if ((resObj.page > 0) && (resObj.page <= resObj.total)) {
        return resObj;
    } 

    return false;
    
}

function getContentType(filePath: string) {

    let contentType = 'text/html';

    let extname = pathMod.extname(filePath);
        
        switch (extname) {
            case '.js':
                return contentType = 'text/javascript';
            case '.css':
                return contentType = 'text/css';
            case '.json':
                return contentType = 'application/json';
            case '.png':
                return contentType = 'image/png';
            case '.jpeg':
                return contentType = 'image/jpeg';
            case '.jpg':
                return contentType = 'image/jpg';
        }
        console.log('CONTENT TYPE')
        return contentType;

}

export {getTotal, getCurrentPage, getRequestedImages, checkPage, getContentType, getArrayLength};