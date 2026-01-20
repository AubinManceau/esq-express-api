import fs from 'fs';
import path from 'path';

/**
 * Safely deletes a file if it exists.
 * @param {string} relativePath - The path relative to the project root or the stored path in DB.
 */
export const deleteFile = (filePath: string | null | undefined): void => {
    if (!filePath) return;

    try {
        const fileName = path.basename(filePath);
        const fullPath = path.resolve('app/uploads', fileName);

        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`File deleted: ${fullPath}`);
        }
    } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
    }
};
