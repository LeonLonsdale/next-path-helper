import path from "path";
import fs from "fs";

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
export class PathManager {
  private paths: Record<string, PathInfo> = {};

  constructor() {
    this.paths = {};
    this.addPath = this.addPath.bind(this);
    this.getPath = this.getPath.bind(this);
    this.getPaths = this.getPaths.bind(this);
    this.getNavList = this.getNavList.bind(this);
    this.updatePath = this.updatePath.bind(this);
    this.addNav = this.addNav.bind(this);
    this.addPathsToNav = this.addPathsToNav.bind(this);
    this.buildPathList = this.buildPathList.bind(this);
    this.makeNavList = this.makeNavList.bind(this);
    // Automatically build the path list when the instance is created
    this.buildPathList();
  }

  /**
   * Returns the root directory of the project.
   * @returns The root directory path.
   */
  private getProjectRoot(): string {
    return process.cwd();
  }

  /**
   * Locates the application directory within the project root.
   *
   * @param projectRoot The root directory of the project.
   * @returns The path to the application directory if found, or `false` if not found.
   */
  private locateAppDir(projectRoot: string): string | false {
    const possiblePaths = [
      path.join(projectRoot, "app"),
      path.join(projectRoot, "src", "app"),
    ];

    for (const dirPath of possiblePaths) {
      try {
        const stat = fs.statSync(dirPath);
        if (stat.isDirectory()) {
          return dirPath;
        }
      } catch (error) {
        // an error will be thrown for one of the 2 possible dirPaths even if one of them exists.
      }
    }

    return false;
  }

  /**
   * Removes the plural form of a word and returns its singular form.
   * @param word - The word to be singularised.
   * @returns The singular form of the word.
   */
  private singularise(word: string): string {
    return word.endsWith("s") ? word.slice(0, -1) : word;
  }

  /**
   * Checks if a given relative path contains dynamic segments.
   * Dynamic segments are denoted by square brackets [].
   *
   * @param relativePath - The relative path to check.
   * @returns True if the relative path contains dynamic segments, false otherwise.
   */
  private isDynamicPath(relativePath: string): boolean {
    return /\[.*?\]/.test(relativePath);
  }

  /**
   * Generates a key and label based on the provided relative path and clean item.
   *
   * @param relativePath - The relative path.
   * @param cleanItem - The clean item.
   * @returns An object containing the generated key and label.
   */
  private generateKeyAndLabel(
    relativePath: string,
    cleanItem: string
  ): { key: string; label: string } {
    const segments = relativePath
      .split("/")
      .filter(
        (segment) =>
          segment !== "" && !segment.startsWith("(") && !segment.endsWith(")")
      );
    const lastSegment = segments[segments.length - 1];

    if (this.isDynamicPath(lastSegment)) {
      const nonDynamicSegments = segments.filter(
        (segment) => !this.isDynamicPath(segment)
      );
      const capitalisedSegments = nonDynamicSegments.map((segment) =>
        this.singularise(segment.charAt(0).toUpperCase() + segment.slice(1))
      );
      const key = `view${capitalisedSegments.join("")}`;
      const label = `View ${capitalisedSegments.join(" ")}`;
      return { key: key.charAt(0).toLowerCase() + key.slice(1), label };
    } else {
      const capitalisedLastSegment =
        cleanItem.charAt(0).toUpperCase() + cleanItem.slice(1);
      return {
        key: cleanItem.charAt(0).toLowerCase() + cleanItem.slice(1),
        label: capitalisedLastSegment,
      };
    }
  }

  /**
   * Adds a path to the path manager.
   *
   * @param relativePath - The relative path of the path being added.
   * @param cleanItem - The clean item associated with the path.
   * @param group - The group to which the path belongs (optional).
   */
  private addPathToManager(
    relativePath: string,
    cleanItem: string,
    group?: string
  ) {
    const isDynamic = this.isDynamicPath(relativePath);
    const { key, label } = this.generateKeyAndLabel(relativePath, cleanItem);

    this.addPath(key, {
      label: label,
      path: (...args: (string | number)[]) => {
        let dynamicPath = `/${relativePath}`;
        args.forEach((arg) => {
          dynamicPath = dynamicPath.replace(/\[.*?\]/, `${arg}`);
        });
        return dynamicPath;
      },
      navs: [],
      group: group || "",
      type: isDynamic ? "dynamic" : "static",
    });
  }

  /**
   * Processes a directory item.
   *
   * @param item - The directory item to process.
   * @param fullPath - The full path of the directory item.
   * @param relativePath - The relative path of the directory item.
   * @param baseDir - The base directory.
   * @param group - The group of the directory item.
   */
  private processDirectory(
    item: string,
    fullPath: string,
    relativePath: string,
    baseDir: string,
    group?: string
  ) {
    const cleanItem = item.replace(/\[.*?\]/, "");
    const isGroup = item.startsWith("(") && item.endsWith(")");

    if (isGroup) {
      const newGroup = item.slice(1, -1);
      this.locateSubDirs(fullPath, baseDir, newGroup);
    } else {
      this.addPathToManager(relativePath, cleanItem, group);
      this.locateSubDirs(fullPath, baseDir, group);
    }
  }

  /**
   * Locates subdirectories within a given directory.
   *
   * @param dir - The directory to search for subdirectories.
   * @param baseDir - The base directory from which the search is performed.
   * @param group - Optional group parameter.
   */
  private locateSubDirs(dir: string, baseDir: string, group?: string) {
    const items = fs.readdirSync(dir);

    items.forEach((item) => {
      const fullPath = path.join(dir, item);
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        this.processDirectory(item, fullPath, relativePath, baseDir, group);
      }
    });
  }

  public getAppDir = (): string | boolean => {
    const appDirPath = this.locateAppDir(this.getProjectRoot());
    if (appDirPath) {
      return appDirPath;
    } else {
      return false;
    }
  };

  /**
   * Adds a path to the path manager.
   * @param key - The key for the path.
   * @param pathInfo - The information about the path.
   */
  public addPath = (key: string, pathInfo: PathInfo): void => {
    // Check if the path already exists
    if (this.paths[key]) {
      throw new Error(`Path '${key}' already exists.`);
    }

    // Validate the pathInfo object
    if (typeof pathInfo.label !== "string") {
      throw new Error(`Invalid pathInfo object: 'label' should be a string.`);
    }
    if (typeof pathInfo.path !== "function") {
      throw new Error(`Invalid pathInfo object: 'path' should be a function.`);
    }
    if (!Array.isArray(pathInfo.navs)) {
      throw new Error(`Invalid pathInfo object: 'navs' should be an array.`);
    }
    if (pathInfo.group && typeof pathInfo.group !== "string") {
      throw new Error(`Invalid pathInfo object: 'group' should be a string.`);
    }
    if (pathInfo.type !== "static" && pathInfo.type !== "dynamic") {
      throw new Error(
        `Invalid pathInfo object: 'type' should be either 'static' or 'dynamic'.`
      );
    }

    this.paths[key] = pathInfo;
  };

  /**
   * Updates an existing path in the path manager.
   * @param key - The key for the path.
   * @param pathInfo - The new information about the path.
   */
  public updatePath = (key: string, pathInfo: PathInfo): void => {
    // Validate the pathInfo object
    if (typeof pathInfo.label !== "string") {
      throw new Error(`Invalid pathInfo object: 'label' should be a string.`);
    }
    if (typeof pathInfo.path !== "function") {
      throw new Error(`Invalid pathInfo object: 'path' should be a function.`);
    }
    if (!Array.isArray(pathInfo.navs)) {
      throw new Error(`Invalid pathInfo object: 'navs' should be an array.`);
    }
    if (pathInfo.group && typeof pathInfo.group !== "string") {
      throw new Error(`Invalid pathInfo object: 'group' should be a string.`);
    }
    if (pathInfo.type !== "static" && pathInfo.type !== "dynamic") {
      throw new Error(
        `Invalid pathInfo object: 'type' should be either 'static' or 'dynamic'.`
      );
    }

    this.paths[key] = pathInfo;
  };

  /**
   * Retrieves the path information for a given key.
   * @param key - The key of the path.
   * @returns The path information, or undefined if not found.
   */
  public getPath = (key: string): PathInfo | undefined => {
    return this.paths[key];
  };

  /**
   * Retrieves all the paths managed by the path manager.
   * @returns The paths as a record of key-value pairs.
   */
  public getPaths = (): Record<string, PathInfo> => {
    return this.paths;
  };

  /**
   * Adds unique navigation links to a path.
   * @param key - The key of the path.
   * @param navs - The navigation links to add.
   */
  public addNav = (key: string, ...navs: string[]): void => {
    const pathInfo = this.paths[key];

    if (pathInfo) {
      navs.forEach((nav) => {
        if (!pathInfo.navs.includes(nav)) {
          pathInfo.navs.push(nav);
        }
      });
    } else {
      console.error(`Path '${key}' not found.`);
    }
  };

  /**
   * Adds a navigation link to multiple paths.
   * @param keys - An array of path keys.
   * @param nav - The navigation link to add.
   */
  public addPathsToNav = (keys: string[], nav: string): void => {
    keys.forEach((key) => {
      const pathInfo = this.paths[key];
      if (pathInfo) {
        if (!pathInfo.navs.includes(nav)) {
          pathInfo.navs.push(nav);
        }
      } else {
        console.error(`Path '${key}' not found.`);
      }
    });
  };

  /**
   * Removes navigation links from a path.
   * @param key - The key of the path.
   * @param nav - The navigation link to remove.
   */
  public removeNav = (key: string, nav: string): void => {
    const pathInfo = this.paths[key];

    if (pathInfo) {
      const index = pathInfo.navs.indexOf(nav);
      if (index > -1) {
        pathInfo.navs.splice(index, 1);
      }
    } else {
      console.error(`Path '${key}' not found.`);
    }
  };

  /**
   * Retrieves a list of navigation links that match a keyword.
   * @param keyword - The keyword to match.
   * @returns The list of matching navigation links.
   */
  public getNavList = (keyword: string): NavLink[] => {
    const matches: NavLink[] = [];

    Object.entries(this.paths).forEach(([key, value]) => {
      if (value.navs.includes(keyword)) {
        matches.push({ label: value.label, path: value.path });
      }
    });

    return matches;
  };

  /**
   * Makes a navigation list based on the provided keys.
   * @param keys - An array of path keys.
   * @returns An array of navigation links in the order of the provided keys.
   */
  public makeNavList = (keys: string[]): NavLink[] => {
    return keys
      .map((key) => {
        const pathInfo = this.paths[key];
        if (pathInfo) {
          return { label: pathInfo.label, path: pathInfo.path };
        } else {
          console.error(`Path '${key}' not found.`);
          return null;
        }
      })
      .filter((navLink): navLink is NavLink => navLink !== null);
  };

  /**
   * Builds the path list by locating the app directory and processing its subdirectories.
   */
  public buildPathList = (): void => {
    const appDirPath = this.locateAppDir(this.getProjectRoot());
    console.log("***** Path Manager *****");
    if (appDirPath) {
      this.paths = {
        home: { label: "Home", path: () => "/", navs: [], type: "static" },
      };
      this.locateSubDirs(appDirPath, appDirPath);
      console.log("App router detected", appDirPath);
      console.log("Paths have been generated");
      console.log("Ensure you read the docs for more information");
    } else {
      console.error(
        "App directory not found in the project root:",
        this.getProjectRoot()
      );
    }
    console.log("************************");
  };
}

/**
 * The instance of the PathManager class.
 */
const pathManager = new PathManager();
export { pathManager };
