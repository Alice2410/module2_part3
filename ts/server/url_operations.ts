import * as http from "http";
import * as path from "path";

export {getCurrentUrl, getFilePath};

function getCurrentUrl (req: http.IncomingMessage) {
    let currentUrl = 'http://' + req.headers.host + req.url;

    if ((req.url)?.includes('index') || ((req.url)?.includes('gallery') && !((req.url)?.includes('gallery.html?') || (req.url)?.includes('gallery?')))){
        currentUrl = currentUrl + '.html';
    } 

    return currentUrl;
}

function getFilePath (url: string, req: http.IncomingMessage) {

    let newUrl = new URL(url);
    let htmlFileName = (newUrl.pathname).slice(1);

    if (newUrl.pathname === '/') {
        let filePath = path.join(__dirname, '/../../index.html');
        return filePath;
    }

    if (  ( !(htmlFileName.includes('.')) ) || htmlFileName.includes('.ico')) {
        console.log ('WONT read: ' + htmlFileName);
        return false;
    } 

    let filePath = path.join(__dirname, req.url === '/' ? '/../../index.html' : ('/../../' + htmlFileName) );

    console.log('will read: ' + filePath);
    return filePath;
    
}