const { app, BrowserWindow } = require('electron');
const path = require('node:path');

// 尝试使用update-electron-app模块
const updateModule = require('update-electron-app');
// console.log('update-electron-app 模块类型:', typeof updateModule);
// console.log('update-electron-app 模块内容:', updateModule);

// 根据模块类型使用正确的方式
if (typeof updateModule === 'function') {
  updateModule();
} else if (updateModule && typeof updateModule === 'object') {
  // 尝试访问对象中的函数
  if (updateModule.updateElectronApp && typeof updateModule.updateElectronApp === 'function') {
    updateModule.updateElectronApp();
    console.log('成功调用 updateModule.updateElectronApp()');
  } else {
    console.log('update-electron-app 对象中没有可用的函数');
  }
} else {
  console.log('无法使用 update-electron-app 模块');
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.  
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // 判断是否为开发环境，若是则打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // 监听关闭事件，阻止默认行为
  // mainWindow.on('close', (event) => {
  //   event.preventDefault();
  //   console.log('close 事件触发');
  //   mainWindow.hide();
  // });


};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  console.log('app is ready 平台：' + process.platform);
  console.log('NODE_ENV：' + process.env.NODE_ENV);
  console.log('CERTIFICATE_PASSWORD：' + process.env.CERTIFICATE_PASSWORD);
  console.log('GITHUB_TOKEN：' + process.env.GITHUB_TOKEN);
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
// 所有窗口关闭时仅在非 macOS 平台上退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
