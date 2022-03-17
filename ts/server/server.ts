import * as http from "http";
import * as path from "path";
import * as fs from "fs";
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

const server = http.createServer((req, res) => { //Create a server
    const currentUrl = urlOperations.getCurrentUrl(req);
    const filePath = urlOperations.getFilePath(currentUrl, req);
    let contentType = 'text/html';
    if (filePath) {
        fs.readFile(filePath, (err, content) => {
            contentType = pageOperations.getContentType(filePath);

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
            } else {
                //Success
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf8');
            }
        });
    }

    if (req.method === 'POST') {
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
    }

    if (req.method === 'GET') {
        if((req.url)?.includes('gallery?')) {
            
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
        }  
    }
    
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function makeFalsePageError (resObj: responseObj, res: http.ServerResponse) {

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
    makeFalsePageError(resObj, res);
    await pageOperations.getRequestedImages(resObj);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(resObj));

}