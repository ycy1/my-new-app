// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
/**
 * 注意: 您不能在 contextBridge 中暴露原型或者 Symbol !!! 见 https://www.electronjs.org/zh/docs/latest/api/context-bridge
 *  
 * 预加载脚本
 * contextBridge：用于暴露API到渲染进程;
 * ipcRenderer：用于在渲染进程中发送消息到主进程;
 */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke("ping"), // 双向通信
  setTitle: (title) => ipcRenderer.send("set-title", title), // 单向通信 渲染器=>主进程
  // 处理打开文件对话框
  openFile: () => ipcRenderer.invoke("dialog:openFile"), // 双向通信
  // 处理打开文件对话框成功事件
  onOpenFileSuccess: (callback) =>
    ipcRenderer.on("dialog:openFile-success", (event, filePath) =>
      callback(filePath)
    ), // 监听打开文件对话框成功事件
  // 处理更新计数器事件
  onUpdateCounter: (callback) =>
    ipcRenderer.on("update-counter", (event, delta) => callback(delta)), // 监听更新计数器事件
  // 回复主进程 发送当前计数器值
  counterValue: (value) => ipcRenderer.send("counter-value", value),

  /**
   * 注意: 您不能在 contextBridge 中暴露原型或者 Symbol !!!
   *
   * port1 用于渲染进程与主进程通信, 主进程通过 port2 与渲染进程通信
   * @param {*} onMessage 将port1的监听 作为回调返回到渲染进程
   * @returns send: 用于渲染进程向主进程发送消息
   */
  createChannel: (onMessage) => {
    const { port1, port2 } = new MessageChannel();
    port1.start(); // 开启 port1 监听
    port1.onmessage = (e) => onMessage(e.data);
    // 向主进程发送 set-up-channel 函数, 用于监听 port2
    ipcRenderer.postMessage("set-up-channel", null, [port2]);
    // 向渲染进程暴露 port1 的 postMessage 方法, 用于向主进程发送消息
    return { send: (data) => port1.postMessage(data) };
  },
});
