/**
 * Represents the information about a path.
 */
export interface PathInfo {
    label: string;
    path: (...args: (string | number)[]) => string;
    navs: string[];
    group?: string;
    type: "static" | "dynamic";
}
/**
 * Represents a navigation link.
 */
export type NavLink = {
    label: string;
    path: (...args: (string | number)[]) => string;
};
/**
 * The `PathManager` class manages paths and navigation links for an application.
 * It provides methods to add paths, retrieve path information, add navigation links,
 * and retrieve matching navigation links based on a keyword.
 */
export declare class PathManager {
    private paths;
    constructor();
    /**
     * Returns the root directory of the project.
     * @returns The root directory path.
     */
    private getProjectRoot;
    /**
     * Locates the application directory within the project root.
     *
     * @param projectRoot The root directory of the project.
     * @returns The path to the application directory if found, or `false` if not found.
     */
    private locateAppDir;
    /**
     * Removes the plural form of a word and returns its singular form.
     * @param word - The word to be singularised.
     * @returns The singular form of the word.
     */
    private singularise;
    /**
     * Checks if a given relative path contains dynamic segments.
     * Dynamic segments are denoted by square brackets [].
     *
     * @param relativePath - The relative path to check.
     * @returns True if the relative path contains dynamic segments, false otherwise.
     */
    private isDynamicPath;
    /**
     * Generates a key and label based on the provided relative path and clean item.
     *
     * @param relativePath - The relative path.
     * @param cleanItem - The clean item.
     * @returns An object containing the generated key and label.
     */
    private generateKeyAndLabel;
    /**
     * Adds a path to the path manager.
     *
     * @param relativePath - The relative path of the path being added.
     * @param cleanItem - The clean item associated with the path.
     * @param group - The group to which the path belongs (optional).
     */
    private addPathToManager;
    /**
     * Processes a directory item.
     *
     * @param item - The directory item to process.
     * @param fullPath - The full path of the directory item.
     * @param relativePath - The relative path of the directory item.
     * @param baseDir - The base directory.
     * @param group - The group of the directory item.
     */
    private processDirectory;
    /**
     * Locates subdirectories within a given directory.
     *
     * @param dir - The directory to search for subdirectories.
     * @param baseDir - The base directory from which the search is performed.
     * @param group - Optional group parameter.
     */
    private locateSubDirs;
    getAppDir(): string | boolean;
    /**
     * Adds a path to the path manager.
     * @param key - The key for the path.
     * @param pathInfo - The information about the path.
     */
    addPath(key: string, pathInfo: PathInfo): void;
    /**
     * Updates an existing path in the path manager.
     * @param key - The key for the path.
     * @param pathInfo - The new information about the path.
     */
    updatePath(key: string, pathInfo: PathInfo): void;
    /**
     * Retrieves the path information for a given key.
     * @param key - The key of the path.
     * @returns The path information, or undefined if not found.
     */
    getPath(key: string): PathInfo | undefined;
    /**
     * Retrieves all the paths managed by the path manager.
     * @returns The paths as a record of key-value pairs.
     */
    getPaths(): Record<string, PathInfo>;
    /**
     * Adds unique navigation links to a path.
     * @param key - The key of the path.
     * @param navs - The navigation links to add.
     */
    addNav(key: string, ...navs: string[]): void;
    /**
     * Adds a navigation link to multiple paths.
     * @param keys - An array of path keys.
     * @param nav - The navigation link to add.
     */
    addPathsToNav(keys: string[], nav: string): void;
    /**
     * Removes navigation links from a path.
     * @param key - The key of the path.
     * @param nav - The navigation link to remove.
     */
    removeNav(key: string, nav: string): void;
    /**
     * Retrieves a list of navigation links that match a keyword.
     * @param keyword - The keyword to match.
     * @returns The list of matching navigation links.
     */
    getNavList(keyword: string): NavLink[];
    /**
     * Makes a navigation list based on the provided keys.
     * @param keys - An array of path keys.
     * @returns An array of navigation links in the order of the provided keys.
     */
    makeNavList(keys: string[]): NavLink[];
    /**
     * Builds the path list by locating the app directory and processing its subdirectories.
     */
    buildPathList(): void;
}
/**
 * The instance of the PathManager class.
 */
declare const pathManager: PathManager;
export { pathManager };
//# sourceMappingURL=pathManager.d.ts.map