const { contextBridge, ipcRenderer } = require("electron");

let functions = {};
let jsonCache = {};

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  reset: () => {
    Object.keys(functions).forEach((key) => {
      ipcRenderer.removeAllListeners(key);
      delete functions[key];
    });
  },

  send: (event, data) => {
    // clear cache on resource update
    if (event === "UPDATE_RESOURCES") {
      jsonCache = {};
    }

    // cache stuff so we don't have to hit disk so much
    if (event === "JSON" && functions.json && jsonCache[data.json]) {
      console.log("[Cache JSON]", data.json);
      functions.json({ name: data.json, data: jsonCache[data.json] });
      return;
    }

    console.log("[Send]", event, data);
    ipcRenderer.send(event, data);
  },

  receive: (event, func) => {
    // cache functions
    functions[event] = func;

    const callFunc = (ev, ...args) => {
      console.log("[Receive]", event, ...args);

      // cache json if we get it
      if (event === "json") jsonCache[args[0].name] = args[0].data;

      func(...args);
    };

    ipcRenderer.on(event, callFunc);
  },
});
