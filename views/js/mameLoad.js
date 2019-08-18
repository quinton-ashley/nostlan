let stopAnimation;

class Script {
	constructor() {}

	async start() {
		stopAnimation = false;

		await delay(1000);

		let canvas = document.querySelector('canvas');
		let c = canvas.getContext('2d');

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		window.addEventListener('resize', () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		});

		let HorizontalArray = [];

		function Horizontal(y) {
			this.y = y;
			this.dy = 0.5;
			this.opacity = 0;

			this.draw = () => {
				c.beginPath();
				c.lineWidth = 3;
				c.strokeStyle = `rgba(255, 0, 255, ${this.opacity})`;
				c.moveTo(0, this.y);
				c.lineTo(canvas.width, this.y);
				c.stroke();
			}

			this.update = () => {
				if (this.y >= canvas.height) {
					HorizontalArray.splice(HorizontalArray.indexOf(this), 1);
				}

				this.opacity += 0.008;

				this.dy += 0.05;
				this.y += this.dy;
				this.draw();
			}
		}

		let grad = c.createLinearGradient(0, canvas.height, 0, 0);
		grad.addColorStop("0", "rgba(255, 0, 255, 0.7)");
		grad.addColorStop("0.55", "rgba(255, 0, 255, 0)");
		grad.addColorStop("1.0", "rgba(255, 0, 255, 0)");
		let VerticalArray = [];

		function Vertical(x) {
			this.x = x;

			this.draw = () => {
				c.beginPath();
				c.lineWidth = 3;
				c.strokeStyle = grad;
				c.moveTo(canvas.width / 2, 200);
				c.lineTo(this.x, canvas.height);
				c.stroke();
			}

			this.update = () => {
				this.draw();
			}
		}

		let interval = (canvas.width / 10);
		let cross = 0 - interval * 8;
		for (let i = 0; i < 27; i++) {
			VerticalArray.push(new Vertical(cross));
			cross += interval;
		}

		setInterval(() => {
			HorizontalArray.push(new Horizontal(canvas.height / 2));
		}, 300);

		////////////////////////////////

		var THREE = require('three');
		var vertexHeight = 15000;
		var planeDefinition = 100;
		var planeSize = 1245000;
		var totalObjects = 50000;
		var frame = 60;

		var container = document.createElement('div');
		document.body.appendChild(container);

		var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 400000)
		camera.position.z = 50000;
		camera.position.y = 15000;
		camera.lookAt(new THREE.Vector3(0, 15900, 0));

		var scene = new THREE.Scene();
		scene.fog = new THREE.Fog(0x23233f, 1, 300000);

		var uniforms = {
			time: {
				type: "f",
				value: 0.0
			},
			topColor: {
				type: "c",
				value: new THREE.Color(0x000000)
			},
			bottomColor: {
				type: "c",
				value: new THREE.Color(0xffffff)
			},
			offset: {
				type: "f",
				value: 33
			},
			exponent: {
				type: "f",
				value: 0.6
			},
			fogColor: {
				type: "c",
				value: scene.fog.color
			},
			fogNear: {
				type: "f",
				value: scene.fog.near
			},
			fogFar: {
				type: "f",
				value: scene.fog.far
			}
		};

		var material = new THREE.ShaderMaterial({
			uniforms: uniforms,
			vertexShader: `
		// Uniforms
		uniform float time;
		varying vec3 vNormal;

		void main(void) {
		   vec3 v = position;
		   vNormal = normal;
		   v.z += sin(2.0 * position.x + (time)) * 925.5;

		   gl_Position = projectionMatrix *
		                modelViewMatrix *
		                vec4(v, 0.9);
		}
		`,
			fragmentShader: `
		varying vec3 vNormal;
		uniform float time;

		void main(void) {
		    vec3 light = vec3(0.3, .9, .1);

		    light = normalize(light);

		    float dProd = max(0.2, dot(vNormal, light));

		    gl_FragColor = vec4(0, // R
		                      24, // G
		                      15, // B
		                      0.1);  // A
		}
		`,
			wireframe: true,
			fog: true
		});

		var plane = new THREE.Mesh(new THREE.PlaneGeometry(planeSize, planeSize, planeDefinition, planeDefinition), material);
		plane.rotation.x -= Math.PI * .50;

		scene.add(plane);

		var geometry = new THREE.Geometry();

		for (let i = 0; i < totalObjects; i++) {
			var vertex = new THREE.Vector3();
			vertex.x = Math.random() * planeSize - (planeSize * .5);
			vertex.y = (Math.random() * 100000) + 10000;
			vertex.z = Math.random() * planeSize - (planeSize * .5);
			geometry.vertices.push(vertex);
		}

		var material = new THREE.PointsMaterial({
			size: 400
		});
		var particles = new THREE.Points(geometry, material);

		scene.add(particles);

		var renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);

		function render() {
			if (!stopAnimation) {
				requestAnimationFrame(render);
			} else {
				scene.remove.apply(scene, scene.children);
				$('div canvas').parent().remove();
			}
			// log('animation active');
			c.clearRect(0, 0, canvas.width, canvas.height);

			for (let i = 0; i < HorizontalArray.length; i++) {
				HorizontalArray[i].update();
			}
			for (let i = 0; i < VerticalArray.length; i++) {
				VerticalArray[i].update();
			}
			////////////////////
			camera.position.z -= 150;
			uniforms.time.value = frame;
			frame += .03;
			//  dateVerts();
			renderer.render(scene, camera);
		}
		render();
	}

	stop() {
		stopAnimation = true;
	}
}

module.exports = new Script();
