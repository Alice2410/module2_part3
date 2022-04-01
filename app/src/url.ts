export const loginURL = 'http://localhost:5000/authorization';
export const basicGalleryURL = 'http://localhost:5000/gallery';
export const localStorageTokenKey = 'token';
export const tokenTimestampKey = 'tokenReceiptTime';

export interface Token {
    token: string;
}

export interface Error {
    errorMessage: string;
}

export interface Gallery {
    objects: string[];
    page: number;
    total: number;
}