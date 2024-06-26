# Path Manager

When we build a modern web app, it's common for us to end up with a lot of routes. Throughout our projects we implement links to those routes. When we need to change a route, however, updating each place in which we've created a link can be a frustrating process.

Path Manager aims to make this easier in your NextJS Apps using the App Router. That's right **this does not work with the NextJS pages router**. Path Manager will identify your app router directory and generate a central cache of all your route paths. These are stored in the following format:

```typescript
{
  label: string; // labels can be used as the display text for your links
  path: (...args: (string | number)[]) => string; // returns the path to your route. Accepts arguments for dynamic routes, such as id references or slugs.
  type: 'static' | 'dynamic'; // used internally to generate names and path generation
  group?: string; // recognises group dirs like (auth) and ignores, but makes a record.
  navs: string[]; // allows you to label paths according to nav lists you use. These nav lists can be generated via the API later.
}
```

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Initial Setup](#initial-setup)
  - [Methods](#methods)
    - [addPath](#addpath)
    - [updatePath](#updatepath)
    - [getPath](#getpath)
    - [getPaths](#getpaths)
    - [addNav](#addnav)
    - [removeNav](#removenav)
    - [getNavList](#getnavlist)
    - [makeNavList](#makenavlist)
    - [buildPathList](#buildpathlist)
- [Watcher](#watching-for-changes)

## Installation

To install the package, you can use npm or yarn:

```bash
npm i next-path-helper
```

or

```bash
yarn add next-path-helper
```

## Usage

### Initial Setup

First, import the `pathManager`:

```typescript
// layout.tsx
import { pathManager } from "next-path-helper";

// Initial build of the path list
pathManager.buildPathList();

console.log("Paths:", pathManager.getPaths());
```

You may then choose to pass `pathManager` to a context which wraps your project.

### Methods

#### addPath

Adds a path to the path manager. You shouldn't need this.

```typescript
pathManager.addPath(key: string, pathInfo: PathInfo): void
```

- `key`: The key for the path.
- `pathInfo`: The information about the path.

#### updatePath

Updates an existing path. If you're using watcher, this will be done automatically.

```typescript
pathManager.updatePath(key: string, pathInfo: PathInfo): void
```

- `key`: The key for the path.
- `pathInfo`: The information about the path.

#### getPath

Retrieves the path information for a given key. You can use this when adding a single link somewhere in your project.

```typescript
pathManager.getPath(key: string): PathInfo | undefined
```

- `key`: The key of the path.

#### getPaths

Retrieves all the paths managed by the path manager.

```typescript
pathManager.getPaths(): Record<string, PathInfo>
```

#### addNav

Adds navigation links to a path.

```typescript
pathManager.addNav(key: string, ...navs: string[]): void
```

- `key`: The key of the path.
- `navs`: The navigation links to add.

#### addPathsToNav

```typescript
pathManager.addPathsToNav(keys: string[], nav: string): void
```

- `keys`: An array of path keys.
- `nav`: The navigation link to add.

This function finds each path by its key and adds the specified nav link to each path's `navs` array. If a path key does not exist, an error message is logged.

#### removeNav

Removes a navigation link from a path.

```typescript
pathManager.removeNav(key: string, nav: string): void
```

- `key`: The key of the path.
- `nav`: The navigation link to remove.

#### getNavList

Retrieves a list of navigation links that match a keyword.

```typescript
pathManager.getNavList(keyword: string): NavLink[]
```

- `keyword`: The keyword to match.

#### makeNavList

Creates a navigation list based on a specified order of keys.

```typescript
pathManager.makeNavList(keys: string[]): NavLink[]
```

- `keys`: An array of path keys.

This function takes an array of path keys and returns an array of navigation links in the same order as the keys provided.

#### buildPathList

Builds the path list by locating the app directory and processing its subdirectories.

```typescript
pathManager.buildPathList(): void
```

## Example

Here is an example usage of the `PathManager` class:

```typescript
import { pathManager } from "next-path-helper";

// Initial build of the path list
pathManager.buildPathList();

// Add navigation items to the path
pathManager.addNav("examplePath", "mainnav", "sidebar");

// Get specific path by key
const pathInfo = pathManager.getPath("examplePath");
console.log("Path Info:", pathInfo);

// Get all paths
const allPaths = pathManager.getPaths();
console.log("All Paths:", allPaths);

// Get paths with 'mainnav' in their navs array
const mainNavItems = pathManager.getNavList("mainnav");
console.log('Paths with "mainnav" in navs:', mainNavItems);

// Create a navigation list based on a specified order of keys
const customNavList = pathManager.makeNavList(["examplePath", "anotherPath"]);
console.log("Custom Navigation List:", customNavList);

// Remove navigation item from the path
pathManager.removeNav("examplePath", "sidebar");
console.log("Updated Path Info:", pathManager.getPath("examplePath"));
```

## Watching for Changes

1. Create a new file in the project root, along with your config files named `watch.js`.
2. Paste this code:

```typescript
import { startPathWatcher } from "next-path-helper/dist/utils/watch.js";

if (process.env.NODE_ENV !== "production") {
  startPathWatcher();
} else {
  console.log("Watcher not started in production environment");
}
```

3. Add a script into your package.json:

```json
scripts {
  "watch": "node watch.js",
}
```

4. Open up a terminal and `npm run watch`

## How I like to use the package

My personal preference for using the package is to create a `paths.ts` document in `__lib`.

```typescript
import { pathManager } from "next-path-helper";

export const {
  addPath,
  getPath,
  getPaths,
  getNavList,
  makeNavList,
  updatePath,
  addNav,
  addPathsToNav,
  buildPathList,
} = pathManager;

addPathsToNav(["home", "about", "account"], "main");

export const navListOrdered = makeNavList(["home", "about", "account"]); // dictate the order of the links
export const navListUnordered = getNavList("main");
```

## License

This project is licensed under the MIT License.
