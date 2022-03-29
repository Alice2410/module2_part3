import * as path from "path";

export const ROOT_PATH = __dirname;
export const SCRIPTS_STATIC_PATH = path.join(ROOT_PATH, '/app/');
export const SOURCES_STATIC_PATH = path.join(ROOT_PATH, '/..');
export const LOG_PATH = path.join(ROOT_PATH, '..', 'log');
export const IMAGES_PATH = path.join(ROOT_PATH,'..', '/resources/images/')

console.log(ROOT_PATH, SCRIPTS_STATIC_PATH, SOURCES_STATIC_PATH)

