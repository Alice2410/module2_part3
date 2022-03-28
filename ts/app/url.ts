const loginURL = 'http://localhost:8000/index';
const basicGalleryURL = 'http://localhost:8000/gallery';
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