const electronInstaller = require("electron-winstaller");
const fs = require("fs");

const generate = async () => {
  fs.copyFileSync("./LICENSE", "release/win-unpacked/LICENSE");

  try {
    await electronInstaller.createWindowsInstaller({
      appDirectory: "./release/win-unpacked",
      outputDirectory: "./release/win-installer",
      authors: "Land of the Rair",
      exe: "Land of the Rair ModKit.exe",
    });
    console.log("Success!");
  } catch (e) {
    console.log(`No dice: ${e.message}`);
  }
};

generate();
