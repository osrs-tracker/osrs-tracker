import { join } from 'path';
import { mkdir, exists } from 'fs';
import { Logger } from './logger';

export class FileSystemUtil {

    static createIconsFolderIfMissing(): void {
        const iconsPath = join(__dirname, '/icons/');
        
        exists(iconsPath, exists => {
            if (!exists) mkdir(iconsPath, () => Logger.log('CREATED ICONS FOLDER'));
        });
    }

}