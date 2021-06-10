const {
	ipcRenderer
} = require('electron');

global.sendToNostlan = (ping) => {
	ipcRenderer.sendToHost(ping);
}

console.log('preload completed');
