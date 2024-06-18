import chokidar from "chokidar";
import { pathManager } from "../index.js";

/**
 * Starts the path watcher to monitor directory changes.
 */
export function startPathWatcher() {
  /**
   * Rebuilds the path list when a change is identified.
   */
  const rebuildPathList = () => {
    console.log("Change identified, rebuilding path list...");
    pathManager.buildPathList();
    console.log("Path list rebuilt successfully.");
  };

  const appDirPath = pathManager.getAppDir();

  if (typeof appDirPath === "string") {
    const watcher = chokidar.watch(appDirPath, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
    });

    watcher
      .on("addDir", (path) => {
        console.log(`Directory ${path} has been added`);
        rebuildPathList();
      })
      .on("unlinkDir", (path) => {
        console.log(`Directory ${path} has been removed`);
        rebuildPathList();
      })
      .on("error", (error) => console.log(`Watcher error: ${error}`));

    console.log("Watching for directory changes in ", appDirPath);
  }
}
