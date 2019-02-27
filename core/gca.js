module.exports = function() {
	process.stdin.resume();
	var gca = require('gca-js');

	// Get the first detected GameCube adapter.
	var adapter = gca.getAdaptersList()[0];

	// Start communication to the first adapter detected.
	gca.startAdapter(adapter);

	// Begin polling status information of the adapter, and call a function once
	// a response has been received.
	gca.pollData(adapter, function(data) {
		// Get the status of all controllers
		var gamepads = gca.objectData(data);

		// 		axes:
		// cStickHorizontal: 0.015625
		// cStickVertical: -0.0234375
		// mainStickHorizontal: 0
		// mainStickVertical: 0.0234375
		// triggerL: -0.7578125
		// triggerR: -0.7265625
		// __proto__: Object
		// buttons:
		// buttonA: false
		// buttonB: false
		// buttonL: false
		// buttonR: false
		// buttonStart: false
		// buttonX: false
		// buttonY: false
		// buttonZ: false
		// padDown: false
		// padLeft: false
		// padRight: false
		// padUp: false
		// __proto__: Object
		// connected: true
		// port: 1
		// rumble: false

		for (var i = 0; i < 4; i++) {
			if (gamepads[i].connected) {
				let sticks = {
					left: {
						x: gamepads[i].axes.mainStickHorizontal,
						y: -gamepads[i].axes.mainStickVertical
					},
					right: {
						x: gamepads[i].axes.cStickHorizontal,
						y: -gamepads[i].axes.cStickVertical
					}
				};
				let triggers = {
					left: gamepads[i].axes.triggerL,
					right: gamepads[i].axes.triggerR
				};
				for (var lbl in gamepads[i].buttons) {
					gamepads[i].buttons[lbl.replace(/(button|pad)/, '').toLowerCase()] =
						gamepads[i].buttons[lbl];
					delete gamepads[i].buttons[lbl];
				}
				cui.parse(gamepads[i].buttons, sticks, triggers, 'nintendo');
				return;
			}
		}

		return;
	})

	function exitExample(options, err) {
		if (options.cleanup) gca.stopAdapter(adapter);
		if (err) er(err.stack);
		if (options.exit) process.exit();
	}

	process.on('SIGINT', exitExample.bind(null, {
		exit: true,
		cleanup: true
	}));
};
