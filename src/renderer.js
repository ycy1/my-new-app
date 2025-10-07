const information = document.getElementById("info");
// console.log(versions)
information.innerText = `本应用正在使用 Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), 和 Electron (v${versions.electron()})`;
versions.ping().then((response) => {
  console.log(response); // 输出: 'pong'
});

versions.setTitle("Hello World!2");

// 处理打开文件按钮点击事件
document.getElementById("btn").addEventListener("click", async () => {
  const filePath = await versions.openFile();
  //   console.log('选择的文件路径:', filePath);
  //   if (filePath) {
  //     document.getElementById('filePath').textContent = filePath;
  //   }
});

// 处理打开文件对话框成功事件
versions.onOpenFileSuccess((filePath) => {
  console.log("选择的文件路径:", filePath);
  if (filePath) {
    document.getElementById("filePath").textContent = filePath;
  }
});

// 处理更新计数器事件
versions.onUpdateCounter((delta) => {
  console.log("收到更新计数器事件:", delta);
  // 这里可以更新渲染器中的计数器显示
  const counterElement = document.getElementById("counter");
  const currentValue = parseInt(counterElement.textContent);
  counterElement.textContent = currentValue + delta;
  // 回复主进程 发送当前计数器值
  versions.counterValue(counterElement.textContent);
});

// 渲染进程代码
const port1 = window.versions.createChannel((e) => {
  console.log('收到消息:', e);
});
port1.send('来自渲染进程');

