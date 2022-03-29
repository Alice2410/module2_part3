import * as http from "http";
import * as path from "path";
import * as fs from "fs";
import * as config from "./../config"
import express, {NextFunction, Request, Response} from "express";
import upload, { UploadedFile } from "express-fileupload";
import { checkValidUserData } from './check_valid';
import * as pageOperations from './page_operations';
import { responseObj } from "./page_operations";
import morgan from 'morgan'
import * as rfs from "rotating-file-stream";

const token = { token: "token" };
const PORT = 8000;
const app = express();

const generator = () => {
    let time = new Date();
    let timeZoneOffset = time.getTimezoneOffset() * 60000;
    let localISOTime = (new Date(Date.now() - timeZoneOffset)).toISOString().slice(0, -5).replace( /[T]/, '_');

    return localISOTime;
};

let accessLogStream = rfs.createStream( generator, {
    interval: '1h',
    path: config.LOG_PATH,
});

app.use(morgan('tiny', { stream: accessLogStream }))

app.use('/', express.static(config.SCRIPTS_STATIC_PATH), express.static(config.SOURCES_STATIC_PATH));

app.use(express.json());

app.post('/authorization', (req, res) => {

    if (checkValidUserData(req.body)) { //проверка данных пользователя
        
        res.statusCode = 200;
        res.end(JSON.stringify(token));
    } else {

        res.sendStatus(403);
    }
    
})

app.use(upload())

app.use('/gallery', checkToken)

app.post('/gallery', async (req, res) => {
    
    try{
        if(!req.files) {
            throw new Error('Ошибка загрузки. Картинка не сохранена')
        } else {
            
            
            let file = req.files.file as UploadedFile;

            getUploadedFileName(file, res)
            
            res.end()
        }
    } catch(err) {
        let error = err as Error
        res.status(500).send(error);
    }
    
});

app.get('/gallery', (req, res) => {
               
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
        
})

app.use((req, res) => {
    res.redirect('http://localhost:8000/404.html')
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function handleFalsePageError (resObj: responseObj, res: http.ServerResponse) {

    if (!pageOperations.checkPage(resObj)) {
        res.statusCode = 404;
        res.end();

        throw new Error ('Такой страницы не существует')
    } 

    return resObj;
}

async function sendResponse (resObj: responseObj, reqUrl: string, res: http.ServerResponse) {
    
    await pageOperations.getTotal(resObj);
    pageOperations.getCurrentPage(resObj, reqUrl);

    try {
        handleFalsePageError(resObj, res);
    } catch (err) {
        return err;
    }
    
    await pageOperations.getRequestedImages(resObj);
    res.statusCode = 200;
    res.end(JSON.stringify(resObj));

}

async function getUploadedFileName(file: UploadedFile, res: Response) {
    
    let fileName = file.name;
    let noSpaceFileName = fileName.replace(/\s/g, '');
    let number = await pageOperations.getArrayLength() + 1;

    let newFileName = 'user-' + number + '_' +  noSpaceFileName;

    file.mv((config.IMAGES_PATH + newFileName), (err: Error) => {
    
        if(err){
            res.send (err);
            res.end()
        }  
    })
}

function checkToken (req: Request, res: Response, next: NextFunction) {
    const headers = req.headers;

    if (headers.authorization === 'token' || req.path==='/') {  
        next()
    } else {
        res.sendStatus(403);
        next()
    }
}

  const getActualRequestDurationInMilliseconds = (start: [number, number]) => {
    const NS_PER_SEC = 1e9; //  convert to nanoseconds
    const NS_TO_MS = 1e6; // convert to milliseconds
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
  };