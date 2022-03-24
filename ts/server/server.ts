import * as http from "http";
import * as path from "path";
import * as fs from "fs";
import express, {NextFunction, Request, Response} from "express";
import upload, { UploadedFile } from "express-fileupload";
import { checkValidUserData } from './check_valid';
import * as pageOperations from './page_operations';
import * as urlOperations from './url_operations';
import { nextTick } from "process";

interface responseObj {
    objects: string[];
    page: number;
    total: number;
}

const token = { token: "token" };
const PORT = 5000;
const app = express();
let contentType = 'text/html';

app.use(logger)

app.use('/', express.static(path.join(__dirname, '..', '..')));

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
            // res.writeHead(200, { 'Content-Type': contentType });
            res.statusCode = 200;
            res.end(JSON.stringify(token));
        } else {
            // res.writeHead(403, { 'Content-Type': contentType });
            // res.end();
            res.sendStatus(403);
        }
    });
})

app.use(upload())

app.use(checkToken)

app.post('/gallery', async (req, res) => {
    console.log('I am in POST /gallery')
    
    try{
        if(!req.files) {
            res.send({
                status: false,
                message: 'No files uploaded'
            });
        } else {
            if (req.files) {
                console.log('true')
            }
            console.log(req.files.file);
            let file = req.files.file as UploadedFile;

            getUploadedFileName(file, res)
            // res.send(true)
            res.end()
            // res.send({
            //     status: true,
            //     massage: 'File is uploaded',
            //     data: {
            //         name: file.name,
            //         mimetype: file.mimetype,
            //         size: file.size
            //     }
            // })
            
            
            
        }
    } catch(err) {
        res.status(500).send(err);
    }
    
    // if (req.files) {
        
    //     let file = req.files.file as UploadedFile;

    //     getUploadedFileName(file, res)
    //     res.redirect('http://localhost:5000/gallery.html?page=1')
    //     res.end()
    // } else {
    //     console.log('some error uppears')
    //     res.send({error: 'some error'})
    // }

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
    
    await pageOperations.getTotal(resObj);
    pageOperations.getCurrentPage(resObj, reqUrl);

    try {
        handleFalsePageError(resObj, res);
    } catch (err) {
        return err;
    }
    
    await pageOperations.getRequestedImages(resObj);
    let contentType = pageOperations.getContentType(reqUrl);
    res.writeHead(200, { 'Content-Type': contentType });
    // res.statusCode = 200;
    res.end(JSON.stringify(resObj));

}

// function handleError (res: http.ServerResponse, err: NodeJS.ErrnoException) {
//     if(err) {

//         if(err.code == 'ENOENT') { //Page not found
//             fs.readFile(path.join(__dirname, '/../../404.html'), (err, content) => {
//                 if (err) {
//                     console.log('Ошибка чтения файла');
//                 } else {
//                     res.writeHead(200, { 'Content-Type': 'text/html' });
//                     res.end(content, 'utf8');
//                 }
//             })

//         } else { //Some server error
//             res.writeHead(500);
//             res.end(`Server error ${err.code}`);
//         }
//     }
// }

async function getUploadedFileName(file: UploadedFile, res: Response) {
    console.log('in get uploaded filename')
    let fileName = file.name;
    console.log(fileName)
    let noSpaceFileName = fileName.replace(/\s/g, '');
    let number = await pageOperations.getArrayLength() + 1;

    let newFileName = 'user-' + number + '_' +  noSpaceFileName;

    file.mv(('/Users/admin/Desktop/module2_part3/public/resources/images/' + newFileName), (err: Error) => {
    
        if(err){
            res.send (err);
            res.end()
        }  
    })
}

function errorHandler (req: Request, res: Response) {
    res.redirect('http://localhost:5000/404.html')
    res.end()
}

function checkToken (req: Request, res: Response, next: NextFunction) {
    console.log('in server-checkToken')

    const headers = req.headers;

    if (headers.authorization === 'token' || req.path==='/') {  
        console.log('checkToken: token is fine')
        next()
    } else {
        console.log('checkToken: token is NOT fine')
        res.sendStatus(403);
    }
}

function logger (req: Request, res: Response, next: NextFunction) { //middleware function
    let current_datetime = new Date();
    let formatted_date =
      current_datetime.getFullYear() +
      "-" +
      (current_datetime.getMonth() + 1) +
      "-" +
      current_datetime.getDate() +
      " " +
      current_datetime.getHours() +
      ":" +
      current_datetime.getMinutes() +
      ":" +
      current_datetime.getSeconds();
    let method = req.method;
    let url = req.url;
    let status = res.statusCode;
    const start = process.hrtime();
    const durationInMilliseconds = getActualRequestDurationInMilliseconds(start);
    let log = `[${formatted_date}] ${method}:${url} ${status} ${durationInMilliseconds.toLocaleString()} ms`;
    console.log(log);
    fs.appendFile("request_logs.txt", log + "\n", err => {
      if (err) {
        console.log(err);
      }
    });
    next();
  };

  const getActualRequestDurationInMilliseconds = (start: [number, number]) => {
    const NS_PER_SEC = 1e9; //  convert to nanoseconds
    const NS_TO_MS = 1e6; // convert to milliseconds
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
  };