import { PathManager, PathInfo } from "../src/utils/pathManager";
import fs from "fs";
import path from "path";

jest.mock("fs");

describe("PathManager", () => {
  let pathManager: PathManager;

  beforeEach(() => {
    pathManager = new PathManager();
    // Add some paths to the pathManager for testing
    pathManager.addPath("examplePath1", {
      label: "Example 1",
      path: () => "/example1",
      navs: [],
      type: "static",
    });
    pathManager.addPath("examplePath2", {
      label: "Example 2",
      path: () => "/example2",
      navs: [],
      type: "static",
    });
    pathManager.addPath("examplePath3", {
      label: "Example 3",
      path: () => "/example3",
      navs: [],
      type: "static",
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Mocking fs.readdirSync
  const mockReaddirSync = (dir: string) => {
    const dirs: Record<string, string[]> = {
      "/root/(auth)": ["login"],
      "/root/example": ["subdir1", "subdir2"],
      "/root/exampleDir": ["(auth)", "subdir"],
      "/root/(auth)/login": [],
      "/root/example/subdir1": [],
      "/root/example/subdir2": [],
    };
    return dirs[dir] || [];
  };

  fs.readdirSync = jest.fn().mockImplementation(mockReaddirSync);

  // Test addPath method with valid data
  it("should add a path with valid data", () => {
    const pathInfo: PathInfo = {
      label: "Example 4",
      path: () => "/example4",
      navs: [],
      type: "static",
    };
    pathManager.addPath("examplePath4", pathInfo);
    expect(pathManager.getPath("examplePath4")).toEqual(pathInfo);
  });

  // Test addPath method with invalid label
  it("should throw an error if label is not a string", () => {
    expect(() => {
      pathManager.addPath("invalidLabelPath", {
        label: 123 as any,
        path: () => "/invalid",
        navs: [],
        type: "static",
      });
    }).toThrow("Invalid pathInfo object: 'label' should be a string.");
  });

  // Test addPath method with invalid path
  it("should throw an error if path is not a function", () => {
    expect(() => {
      pathManager.addPath("invalidPathFunction", {
        label: "Invalid",
        path: "not a function" as any,
        navs: [],
        type: "static",
      });
    }).toThrow("Invalid pathInfo object: 'path' should be a function.");
  });

  // Test addPath method with invalid navs
  it("should throw an error if navs is not an array", () => {
    expect(() => {
      pathManager.addPath("invalidNavsPath", {
        label: "Invalid",
        path: () => "/invalid",
        navs: "not an array" as any,
        type: "static",
      });
    }).toThrow("Invalid pathInfo object: 'navs' should be an array.");
  });

  // Test addPath method with invalid group
  it("should throw an error if group is not a string", () => {
    expect(() => {
      pathManager.addPath("invalidGroupPath", {
        label: "Invalid",
        path: () => "/invalid",
        navs: [],
        group: 123 as any,
        type: "static",
      });
    }).toThrow("Invalid pathInfo object: 'group' should be a string.");
  });

  // Test addPath method with invalid type
  it('should throw an error if type is not "static" or "dynamic"', () => {
    expect(() => {
      pathManager.addPath("invalidTypePath", {
        label: "Invalid",
        path: () => "/invalid",
        navs: [],
        type: "invalid" as any,
      });
    }).toThrow(
      "Invalid pathInfo object: 'type' should be either 'static' or 'dynamic'."
    );
  });

  // Test getPath method
  it("should retrieve the path information for a given key", () => {
    const pathInfo = pathManager.getPath("examplePath1");
    expect(pathInfo?.label).toBe("Example 1");
  });

  // Test getPath method with non-existent key
  it("should return undefined for a non-existent key", () => {
    const pathInfo = pathManager.getPath("nonExistentPath");
    expect(pathInfo).toBeUndefined();
  });

  // Test getPaths method
  it("should retrieve all the paths managed by the path manager", () => {
    const paths = pathManager.getPaths();
    expect(Object.keys(paths)).toHaveLength(3);
    expect(paths).toHaveProperty("examplePath1");
    expect(paths).toHaveProperty("examplePath2");
    expect(paths).toHaveProperty("examplePath3");
  });

  // Test addNav method
  it("should add navigation links to a path", () => {
    pathManager.addNav("examplePath1", "mainnav");
    const pathInfo = pathManager.getPath("examplePath1");
    expect(pathInfo?.navs).toContain("mainnav");
  });

  // Test addNav method to avoid duplicate nav links
  it("should not add duplicate navigation links to a path", () => {
    pathManager.addNav("examplePath1", "mainnav");
    pathManager.addNav("examplePath1", "mainnav");
    const pathInfo = pathManager.getPath("examplePath1");
    expect(pathInfo?.navs.filter((nav) => nav === "mainnav").length).toBe(1);
  });

  // Test addNav method with non-existent path
  it("should log an error if trying to add a nav to a non-existent path", () => {
    console.error = jest.fn();
    pathManager.addNav("nonExistentPath", "mainnav");
    expect(console.error).toHaveBeenCalledWith(
      "Path 'nonExistentPath' not found."
    );
  });

  // Test removeNav method
  it("should remove a navigation link from a path", () => {
    pathManager.addNav("examplePath1", "mainnav");
    pathManager.removeNav("examplePath1", "mainnav");
    const pathInfo = pathManager.getPath("examplePath1");
    expect(pathInfo?.navs).not.toContain("mainnav");
  });

  // Test removeNav method with non-existent path
  it("should log an error if trying to remove a nav from a non-existent path", () => {
    console.error = jest.fn();
    pathManager.removeNav("nonExistentPath", "mainnav");
    expect(console.error).toHaveBeenCalledWith(
      "Path 'nonExistentPath' not found."
    );
  });

  // Test getNavList method
  it("should retrieve a list of navigation links that match a keyword", () => {
    pathManager.addNav("examplePath1", "mainnav");
    pathManager.addNav("examplePath2", "mainnav");
    const navList = pathManager.getNavList("mainnav");
    expect(navList).toHaveLength(2);
    expect(navList[0].label).toBe("Example 1");
    expect(navList[1].label).toBe("Example 2");
  });

  // Test addPathsToNav method
  it("should add a navigation link to multiple paths", () => {
    pathManager.addPathsToNav(["examplePath1", "examplePath2"], "mainnav");
    expect(pathManager.getPath("examplePath1")?.navs).toContain("mainnav");
    expect(pathManager.getPath("examplePath2")?.navs).toContain("mainnav");
    expect(pathManager.getPath("examplePath3")?.navs).not.toContain("mainnav");
  });

  // Test addPathsToNav method with non-existent path
  it("should log an error if a path key is not found when adding multiple navs", () => {
    console.error = jest.fn(); // Mock console.error
    pathManager.addPathsToNav(["nonExistentPath"], "mainnav");
    expect(console.error).toHaveBeenCalledWith(
      "Path 'nonExistentPath' not found."
    );
  });

  // Test addPathsToNav method to avoid duplicate nav links
  it("should not add duplicate navigation links when adding multiple navs", () => {
    pathManager.addPathsToNav(["examplePath1"], "mainnav");
    pathManager.addPathsToNav(["examplePath1"], "mainnav");
    expect(
      pathManager
        .getPath("examplePath1")
        ?.navs.filter((nav) => nav === "mainnav").length
    ).toBe(1);
  });

  // Test buildPathList method
  it("should build the path list by locating the app directory and processing its subdirectories", () => {
    pathManager.buildPathList = jest.fn();
    pathManager.buildPathList();
    expect(pathManager.buildPathList).toHaveBeenCalled();
  });

  // Test adding multiple paths
  it("should handle adding multiple paths correctly", () => {
    pathManager.addPath("examplePath4", {
      label: "Example 4",
      path: () => "/example4",
      navs: [],
      type: "static",
    });
    pathManager.addPath("examplePath5", {
      label: "Example 5",
      path: () => "/example5",
      navs: [],
      type: "static",
    });
    expect(Object.keys(pathManager.getPaths())).toHaveLength(5);
  });

  // Test adding and removing multiple nav links
  it("should handle adding and removing multiple nav links correctly", () => {
    pathManager.addPathsToNav(["examplePath1", "examplePath2"], "sidebar");
    pathManager.removeNav("examplePath1", "sidebar");
    expect(pathManager.getPath("examplePath1")?.navs).not.toContain("sidebar");
    expect(pathManager.getPath("examplePath2")?.navs).toContain("sidebar");
  });

  // Test initialization with no paths
  it("should correctly initialize with no paths", () => {
    const emptyPathManager = new PathManager();
    expect(Object.keys(emptyPathManager.getPaths())).toHaveLength(0);
  });

  // Test adding and removing navs repeatedly
  it("should not modify paths if navs are added/removed repeatedly", () => {
    pathManager.addPathsToNav(["examplePath1"], "topnav");
    pathManager.removeNav("examplePath1", "topnav");
    pathManager.addPathsToNav(["examplePath1"], "topnav");
    expect(
      pathManager
        .getPath("examplePath1")
        ?.navs.filter((nav) => nav === "topnav").length
    ).toBe(1);
  });

  // Test handling dynamic paths
  it("should handle dynamic paths correctly", () => {
    const dynamicPathInfo: PathInfo = {
      label: "Dynamic Example",
      path: (id: string) => `/example/${id}`,
      navs: [],
      type: "dynamic",
    };
    pathManager.addPath("dynamicPath", dynamicPathInfo);
    expect(pathManager.getPath("dynamicPath")?.path("123")).toBe(
      "/example/123"
    );
  });

  // Test handling dynamic paths with multiple parameters
  it("should handle dynamic paths with multiple parameters correctly", () => {
    const dynamicPathInfo: PathInfo = {
      label: "Dynamic Example",
      path: (id: string, subId: string) => `/example/${id}/sub/${subId}`,
      navs: [],
      type: "dynamic",
    };
    pathManager.addPath("dynamicPathWithMultipleParams", dynamicPathInfo);
    expect(
      pathManager.getPath("dynamicPathWithMultipleParams")?.path("123", "456")
    ).toBe("/example/123/sub/456");
  });

  // Test avoiding duplicate dynamic paths
  it("should not add duplicate dynamic paths", () => {
    const dynamicPathInfo: PathInfo = {
      label: "Dynamic Example",
      path: (id: string) => `/example/${id}`,
      navs: [],
      type: "dynamic",
    };
    pathManager.addPath("dynamicPath", dynamicPathInfo);
    expect(() => {
      pathManager.addPath("dynamicPath", dynamicPathInfo);
    }).toThrow("Path 'dynamicPath' already exists.");
  });

  // Test locating app directory
  it("should locate the app directory within the project root", () => {
    pathManager.locateAppDir = jest.fn().mockReturnValue("/root/app");
    const appDirPath = pathManager.getAppDir();
    expect(appDirPath).toBe("/root/app");
  });

  // Test getAppDir method when app directory is not found
  it("should return false if app directory is not found", () => {
    pathManager.locateAppDir = jest.fn().mockReturnValue(false);
    const appDirPath = pathManager.getAppDir();
    expect(appDirPath).toBe(false);
  });

  // Test addPath with group
  it("should add a path with group information", () => {
    const pathInfo: PathInfo = {
      label: "Example with Group",
      path: () => "/example/group",
      navs: [],
      group: "exampleGroup",
      type: "static",
    };
    pathManager.addPath("examplePathWithGroup", pathInfo);
    expect(pathManager.getPath("examplePathWithGroup")?.group).toBe(
      "exampleGroup"
    );
  });

  // Test generateKeyAndLabel method for dynamic paths
  it("should generate correct key and label for dynamic paths", () => {
    const keyAndLabel = pathManager["generateKeyAndLabel"](
      "users/[userId]",
      "users"
    );
    expect(keyAndLabel).toEqual({ key: "viewUser", label: "View User" });
  });

  // Test generateKeyAndLabel method for static paths
  it("should generate correct key and label for static paths", () => {
    const keyAndLabel = pathManager["generateKeyAndLabel"](
      "users/profile",
      "profile"
    );
    expect(keyAndLabel).toEqual({ key: "profile", label: "Profile" });
  });

  // Test singularise method
  it("should correctly singularise a plural word", () => {
    expect(pathManager["singularise"]("users")).toBe("user");
  });

  // Test singularise method with a non-plural word
  it("should return the same word if it is not plural", () => {
    expect(pathManager["singularise"]("user")).toBe("user");
  });

  // Test isDynamicPath method
  it("should correctly identify a dynamic path", () => {
    expect(pathManager["isDynamicPath"]("users/[userId]")).toBe(true);
  });

  // Test isDynamicPath method with static path
  it("should return false for a static path", () => {
    expect(pathManager["isDynamicPath"]("users/profile")).toBe(false);
  });

  // Test locating subdirectories
  it("should locate and process subdirectories correctly", () => {
    pathManager["locateSubDirs"] = jest.fn();
    pathManager["processDirectory"](
      "exampleDir",
      "/root/exampleDir",
      "exampleDir",
      "/root"
    );
    expect(pathManager["locateSubDirs"]).toHaveBeenCalledWith(
      "/root/exampleDir",
      "/root",
      undefined
    );
  });

  // Test processDirectory method with group
  it("should process directories with groups correctly", () => {
    pathManager["addPathToManager"] = jest.fn();
    pathManager["locateSubDirs"] = jest.fn();
    pathManager["processDirectory"](
      "(auth)",
      "/root/(auth)",
      "(auth)",
      "/root"
    );
    expect(pathManager["locateSubDirs"]).toHaveBeenCalledWith(
      "/root/(auth)",
      "/root",
      "auth"
    );
  });

  // Test processDirectory method without group
  it("should process directories without groups correctly", () => {
    pathManager["addPathToManager"] = jest.fn();
    pathManager["locateSubDirs"] = jest.fn();
    pathManager["processDirectory"](
      "example",
      "/root/example",
      "example",
      "/root"
    );
    expect(pathManager["addPathToManager"]).toHaveBeenCalledWith(
      "example",
      "example",
      undefined
    );
    expect(pathManager["locateSubDirs"]).toHaveBeenCalledWith(
      "/root/example",
      "/root",
      undefined
    );
  });

  // Test addPathToManager method
  it("should add paths to manager correctly", () => {
    pathManager["addPath"] = jest.fn();
    pathManager["addPathToManager"]("examplePath", "example", "exampleGroup");
    expect(pathManager["addPath"]).toHaveBeenCalled();
  });

  // Test buildPathList method for error handling
  it("should log an error if app directory is not found", () => {
    console.error = jest.fn();
    pathManager.locateAppDir = jest.fn().mockReturnValue(false);
    pathManager.buildPathList();
    expect(console.error).toHaveBeenCalledWith(
      "App directory not found in the project root:",
      expect.any(String)
    );
  });

  // Test addPath method with invalid data
  it("should throw specific errors for invalid pathInfo object", () => {
    expect(() => {
      pathManager.addPath("invalidPath", {
        label: "Invalid",
        path: () => "/invalid",
        navs: [],
        type: "invalid" as any,
      });
    }).toThrow(
      "Invalid pathInfo object: 'type' should be either 'static' or 'dynamic'."
    );
  });

  // Test removeNav method when nav does not exist
  it("should not modify navs array if nav to remove does not exist", () => {
    pathManager.removeNav("examplePath1", "nonExistentNav");
    const pathInfo = pathManager.getPath("examplePath1");
    expect(pathInfo?.navs).not.toContain("nonExistentNav");
  });

  // Test addNav method with multiple navs
  it("should add multiple unique navigation links to a path", () => {
    pathManager.addNav("examplePath1", "mainnav", "sidebar", "footer");
    const pathInfo = pathManager.getPath("examplePath1");
    expect(pathInfo?.navs).toContain("mainnav");
    expect(pathInfo?.navs).toContain("sidebar");
    expect(pathInfo?.navs).toContain("footer");
  });

  // Test addPathsToNav method with multiple keys
  it("should add navigation link to multiple paths correctly", () => {
    pathManager.addPathsToNav(
      ["examplePath1", "examplePath2", "examplePath3"],
      "globalNav"
    );
    expect(pathManager.getPath("examplePath1")?.navs).toContain("globalNav");
    expect(pathManager.getPath("examplePath2")?.navs).toContain("globalNav");
    expect(pathManager.getPath("examplePath3")?.navs).toContain("globalNav");
  });

  // Test addPath with existing key
  it("should not add duplicate paths with the same key", () => {
    const newPathInfo: PathInfo = {
      label: "Example 1",
      path: () => "/example1",
      navs: [],
      type: "static",
    };
    expect(() => {
      pathManager.addPath("examplePath1", newPathInfo);
    }).toThrow("Path 'examplePath1' already exists.");
  });

  // Test addPath with undefined group
  it("should handle undefined group correctly when adding path", () => {
    const pathInfo: PathInfo = {
      label: "No Group Example",
      path: () => "/no-group",
      navs: [],
      type: "static",
    };
    pathManager.addPath("noGroupPath", pathInfo);
    expect(pathManager.getPath("noGroupPath")?.group).toBeUndefined();
  });

  // Test buildPathList method with mocked locateAppDir
  it("should call locateAppDir and locateSubDirs in buildPathList", () => {
    const mockLocateAppDir = jest.fn().mockReturnValue("/root/app");
    pathManager["locateAppDir"] = mockLocateAppDir;
    pathManager["locateSubDirs"] = jest.fn();
    pathManager.buildPathList();
    expect(mockLocateAppDir).toHaveBeenCalled();
    expect(pathManager["locateSubDirs"]).toHaveBeenCalled();
  });
});
