const {
	contextBridge,
	ipcRenderer
} = require('electron');

contextBridge.exposeInMainWorld(
	'nostlan', {
		send: (ping) => {
			if (typeof ping != 'string') ping = JSON.stringify(ping);
			ipcRenderer.sendToHost(ping);
			console.log('sent to nostlan: ', ping);
		}
	}
)

console.log('preload completed');
