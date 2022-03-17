const loginURL = 'http://localhost:5000/index';
const basicGalleryURL = 'http://localhost:5000/gallery';
const localStorageTokenKey = 'token';
const tokenTimestampKey = 'tokenReceiptTime';

interface Token {
    token: string;
}

interface Error {
    errorMessage: string;
}

interface Gallery {
    objects: string[];
    page: number;
    total: number;
}