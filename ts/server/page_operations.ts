import * as fs from "fs";
import * as url from "url";
import * as pathMod from "path";

const picOnPage = 4;
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

async function getImagesArr() { //получает массив строк с адресами всех картинок
    let imagesArr = await fs.promises.readdir(path);

    return imagesArr;
}


async function getTotal(resObj: responseObj) { //вычисляет количество страниц 
    const picturesAmount = await getArrayLength();         // назначает TOTAL
    const pagesAmount = Math.ceil(picturesAmount / picOnPage);

    resObj.total = pagesAmount;

    return resObj;
}

function getCurrentPage(obj: responseObj, reqURL: string) { //назначает PAGE
    const requestedPage = url.parse(reqURL, true).query.page as string;
    
    obj.page = +requestedPage;
        
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

export {getTotal, getCurrentPage, getRequestedImages, checkPage, getArrayLength};