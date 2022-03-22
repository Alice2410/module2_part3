import * as http from "http";
import * as path from "path";
import * as fs from "fs";
import express, {NextFunction, Request, Response} from "express";
import upload, { UploadedFile } from "express-fileupload";
import { checkValidUserData } from './check_valid';
import * as pageOperations from './page_operations';
import * as urlOperations from './url_operations';

interface responseObj {
    objects: string[];
    page: number;
    total: number;
}

const token = { token: "token" };
const PORT = 5000;
const app = express();
let contentType = 'text/html';

app.use('/', express.static(path.join(__dirname, '..', '..')));

app.use(upload())

app.post('/gallery', (req, res) => {
    console.log('in post')
    if (req.files) {
        let file = req.files.file as UploadedFile;

        getUploadedFileName(file, res)
        res.redirect('http://localhost:5000/gallery.html?page=1')
        res.end()
    }

})

app.get('/gallery', (req, res) => {
   
    const headers = req.headers;

    if (headers.authorization === 'token') {              
        const reqUrl = req.url;
        const resObj = {
            objects: [''],
            page: 0,
            total: 0,
        }

        try {
            sendResponse(resObj, reqUrl, res);
        } catch (error) {
            console.log(error);
        }
        
    } else {
        if (headers.authorization) {
            res.writeHead(403, { 'Content-Type': 'text/html' });
            res.end('Неверное значение токена. Повторите авторизацию.', 'utf-8');
        } else {
            res.writeHead(403, { 'Content-Type': 'text/html' });
            res.end('Токен отсутствует. Повторите авторизацию.', 'utf-8');
        }
    }
    
})

app.post('/index', (req, res) => {
    let body = {
        email: '',
        password: ''
    };
    req.on('data', (chunk: string) => {
        body = JSON.parse(chunk);
     });

    req.on('end', () => {
        if (checkValidUserData(body)) { //проверка данных пользователя
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(JSON.stringify(token));
        } else {
            res.writeHead(403, { 'Content-Type': contentType });
            res.end();
        }
    });
})

app.use(errorHandler)


// ______________________________________________________________

// app.get('/', (req, res) => {
//     const currentUrl = urlOperations.getCurrentUrl(req);
//     const filePath = urlOperations.getFilePath(currentUrl, req);

//     if (filePath) {
//         res.sendFile(filePath, function (err) {

//             if (err) {
//                 handleError(res, err);
//                 console.log('err with: ' + filePath)
//             }
//             else {
//                 console.log('Sent:', filePath);
//             }
//         });
//     }
// })

// __________________________________________________________

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function handleFalsePageError (resObj: responseObj, res: http.ServerResponse) {

    if (!pageOperations.checkPage(resObj)) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end();
        
        throw new Error ('Такой страницы не существует')
    } 

    return resObj;
}

async function sendResponse (resObj: responseObj, reqUrl: string, res: http.ServerResponse) {
    
    await pageOperations.getImagesArr(resObj);
    pageOperations.getCurrentPage(resObj, reqUrl);

    try {
        handleFalsePageError(resObj, res);
    } catch (err) {
        return err;
    }
    
    await pageOperations.getRequestedImages(resObj);
    let contentType = pageOperations.getContentType(reqUrl);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(JSON.stringify(resObj));

}

function handleError (res: http.ServerResponse, err: NodeJS.ErrnoException) {
    if(err) {

        if(err.code == 'ENOENT') { //Page not found
            fs.readFile(path.join(__dirname, '/../../404.html'), (err, content) => {
                if (err) {
                    console.log('Ошибка чтения файла');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf8');
                }
            })

        } else { //Some server error
            res.writeHead(500);
            res.end(`Server error ${err.code}`);
        }
    }
}

async function getUploadedFileName(file: UploadedFile, res: Response) {
    let fileName = file.name;
    let noSpaceFileName = fileName.replace(/\s/g, '');
    let number = await pageOperations.getArrayLength() 
    number++;
    let newFileName = 'user-' + number + '_' +  noSpaceFileName;

    file.mv('/Users/admin/Desktop/module2_part3/public/resources/images/' + newFileName, (err) => {
        if(err){
            res.send (err);
        }  
    })
}

function errorHandler (req: Request, res: Response) {
    res.redirect('http://localhost:5000/404.html')
    res.end()

}