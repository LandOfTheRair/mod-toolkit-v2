const packageJson = require("../package.json");
const electronPackageJson = require("../app/package.json");

electronPackageJson.version = packageJson.version;
require("fs").writeFileSync(
  "./app/package.json",
  JSON.stringify(electronPackageJson, null, 2)
);

console.log("Updated Electron version!");
