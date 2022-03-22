import * as fs from "fs";
import * as url from "url";
import * as pathMod from "path";

const picOnPage = 4;
// const path = './../../public/resources/images';
const path = '/Users/admin/Desktop/module2_part3/resources/images'
const userPath = '/Users/admin/Desktop/module2_part3/resources/user-images'

interface responseObj {
    objects: string[];
    page: number;
    total: number;
}

interface Error{
    errorMessage: string;
}

async function getArrayLength () {
    const basicImagesArr = await fs.promises.readdir(path);
    const arrLength = basicImagesArr.length;
    console.log (arrLength);
    return arrLength;
}

// async function makeOneArray() {
//     const basicImagesArr = await fs.promises.readdir(path);
//     const userImagesArr = await fs.promises.readdir(userPath);
//     let imagesArr; 
//     // console.log(userImagesArr);
//     if (userImagesArr) {
//         imagesArr = basicImagesArr.concat(userImagesArr);
//         console.log(imagesArr);
//         return imagesArr;
//     } else {
//         imagesArr = basicImagesArr
//         return imagesArr;
//     }
// }

async function getImagesArr(resObj: responseObj) { //получает массив строк с адресами всех картинок
    
    // let imagesArr = await makeOneArray(); 
    let imagesArr = await fs.promises.readdir(path);
    getTotal(resObj,imagesArr);
    
    return resObj;
}


function getTotal(resObj: responseObj, imagesArr: string[]) { //вычисляет количество страниц
    const picturesAmount = imagesArr.length;
    console.log ('arr : ' + imagesArr)
    console.log ('arr length: ' + imagesArr.length)
    const pagesAmount = Math.ceil(picturesAmount / picOnPage);

    resObj.total = pagesAmount;

    return resObj;
}

function getCurrentPage(obj: responseObj, req: string | undefined) {
    console.log('GET CURRENT PAGE')
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
    // const picArr = await makeOneArray();
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
            case '.jpg':
                return contentType = 'image/jpg';
        }
        console.log('CONTENT TYPE')
        return contentType;

}

export {getImagesArr, getCurrentPage, getRequestedImages, checkPage, getContentType, getArrayLength};