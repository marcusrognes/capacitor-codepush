import { FilesystemDirectory, FilesystemEncoding, GetUriOptions, Plugins } from "@capacitor/core";
import { Callback } from "./callbackUtil";

const { Filesystem } = Plugins;

/**
 * File utilities for CodePush.
 */
export class FileUtil {
    public static async directoryExists(directory: FilesystemDirectory, path: string): Promise<boolean> {
        try {
            const statResult = await Filesystem.stat({directory, path});
            return statResult.type === "directory";
        } catch (error) {
            return false;
        }
    }

    public static writeStringToDataFile(content: string, path: string, createIfNotExists: boolean, callback: Callback<void>): void {
        FileUtil.writeStringToFile(content, FilesystemDirectory.Data, path, createIfNotExists, callback);
    }

    public static async fileExists(directory: FilesystemDirectory, path: string): Promise<boolean> {
        try {
            const statResult = await Filesystem.stat({directory, path});
            return statResult.type === "file";
        } catch (error) {
            return false;
        }
    }

    /**
     * Makes sure the given directory exists and is empty.
     */
    public static async cleanDataDirectory(path: string): Promise<string> {
        if (await FileUtil.dataDirectoryExists(path)) {
            await FileUtil.deleteDataDirectory(path);
        }

        await Filesystem.mkdir({directory: FilesystemDirectory.Data, path, createIntermediateDirectories: true});
        const appDir = await Filesystem.getUri({directory: FilesystemDirectory.Data, path});
        return appDir.uri;
    }

    public static async getUri(fsDir: FilesystemDirectory, path: string): Promise<string> {
        const result = await Filesystem.getUri({directory: fsDir, path});
        return result.uri;
    }

    public static getDataUri(path: string): Promise<string> {
        return FileUtil.getUri(FilesystemDirectory.Data, path);
    }

    public static dataDirectoryExists(path: string): Promise<boolean> {
        return FileUtil.directoryExists(FilesystemDirectory.Data, path);
    }

    public static async copyDirectoryEntriesTo(sourceDir: GetUriOptions, destinationDir: GetUriOptions, ignoreList: string[] = []): Promise<void> {
        /*
            Native-side exception occurs while trying to copy “.DS_Store” and “__MACOSX” entries generated by macOS, so just skip them
        */
        if (ignoreList.indexOf(".DS_Store") === -1){
            ignoreList.push(".DS_Store");
        }
        if (ignoreList.indexOf("__MACOSX") === -1){
            ignoreList.push("__MACOSX");
        }

        // TODO: implement recursive directory copy natively in capacitor
        return null;
    }

    public static async copyFile(source: GetUriOptions, destination: GetUriOptions): Promise<void> {
        // TODO: implement file copy natively in capacitor
    }

    /**
     * Recursively deletes the contents of a directory.
     */
    public static async deleteDataDirectory(path: string): Promise<void> {
        return Filesystem.rmdir({directory: FilesystemDirectory.Data, path, recursive: true}).then(() => null);
    }

    /**
     * Deletes a given set of files from a directory.
     */
    public static async deleteEntriesFromDataDirectory(dirPath: string, filesToDelete: string[]): Promise<void> {
        for (const file of filesToDelete) {
            const path = dirPath + "/" + file;
            const fileExists = await FileUtil.fileExists(FilesystemDirectory.Data, path);
            if (!fileExists) continue;

            try {
                await Filesystem.deleteFile({directory: FilesystemDirectory.Data, path});
            } catch (error) {
                /* If delete fails, silently continue */
                console.log("Could not delete file: " + path);
            }
        }
    }

    /**
     * Writes a string to a file.
     */
    public static async writeStringToFile(data: string, directory: FilesystemDirectory, path: string, createIfNotExists: boolean, callback: Callback<void>): Promise<void> {
        try {
            await Filesystem.writeFile({directory, path, data, encoding: FilesystemEncoding.UTF8});
            callback(null, null);
        } catch (error) {
            callback(new Error("Could write the current package information file. Error code: " + error.code), null);
        }
    }

    public static async readFile(directory: FilesystemDirectory, path: string): Promise<string> {
        const result = await Filesystem.readFile({directory, path, encoding: FilesystemEncoding.UTF8});
        return result.data;
    }

    public static readDataFile(path: string): Promise<string> {
        return FileUtil.readFile(FilesystemDirectory.Data, path);
    }
}
