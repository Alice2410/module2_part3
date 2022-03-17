import * as fs from "fs";
import * as url from "url";
import * as pathMod from "path";

const picOnPage = 4;
const path = './resources/images';

interface responseObj {
    objects: string[];
    page: number;
    total: number;
}

interface Error{
    errorMessage: string;
}

async function getImagesArr(resObj: responseObj) { //получает массив строк с адресами всех картинок
    const imagesArr = await fs.promises.readdir(path);

    getTotal(resObj,imagesArr)

    return resObj;
}

function getTotal(resObj: responseObj, imagesArr: string[]) { //вычисляет количество страниц
    const picturesAmount = imagesArr.length;
    const pagesAmount = Math.ceil(picturesAmount / picOnPage);

    resObj.total = pagesAmount;

    return resObj;
}

function getCurrentPage(obj: responseObj, req: string | undefined) {
    if (req) {
        const requestedPage = url.parse(req, true).query.page;//получает номер страницы из URL запроса

        if (requestedPage) {
            obj.page = +requestedPage;
        }
    }
    
    return obj;
}

async function getRequestedImages(resObj: responseObj) { //формирует массив адресов картинок для нужной страницы
    const arr: string[] = [];
    const page = resObj.page;
    const picArr = await fs.promises.readdir(path);

    for (let i = picOnPage * (page - 1); i < picOnPage * page; i++) {
        if (picArr[i]) {
            arr.push(picArr[i]);
        }
    }

    resObj.objects = arr;

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
        }

        return contentType;

}

export {getImagesArr, getCurrentPage, getRequestedImages, checkPage, getContentType};