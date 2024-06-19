#!/usr/bin/env node

import { startPathWatcher } from "../dist/utils/watch.js";

if (process.env.NODE_ENV !== "production") {
  startPathWatcher();
} else {
  console.log("Watcher is not started in production environment.");
}
