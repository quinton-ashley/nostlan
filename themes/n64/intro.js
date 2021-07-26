// ------------------------------------------------------
// Scene
// ------------------------------------------------------

const scene = new THREE.Scene();

// ------------------------------------------------------
// Camera
// ------------------------------------------------------

let fieldOfView = 75,
	aspectRatio = window.innerWidth / window.innerHeight,
	near = 0.1,
	far = 400;

const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, near, far);
camera.position.z = 150;
scene.rotation.x = .45;

// ------------------------------------------------------
// Mesh
// ------------------------------------------------------

const red = new THREE.Color().set(0xfe2015),
	blue = new THREE.Color().set(0x011da9),
	yellow = new THREE.Color().set(0xffc001),
	green = new THREE.Color().set(0x069330),
	cubeWidth = 20,
	cubeHeight = 75,
	transversalCubeHeight = 83,
	cubeDepth = 20;

function makeCube(w, h, d, colors) {
	const geometry = new THREE.BoxGeometry(w, h, d).toNonIndexed();

	// vertexColors must be true so vertex colors can be used in the shader

	const material = new THREE.MeshBasicMaterial({
		vertexColors: true
	});

	// generate color data for each vertex

	const positionAttribute = geometry.getAttribute('position');

	const vertexHues = [];

	for (let i = 0, j = 0; i < positionAttribute.count; j++, i += 3) {
		const color = colors[Math.floor(j / 2)];

		// define the same color for each vertex of a triangle
		vertexHues.push(color.r, color.g, color.b);
		vertexHues.push(color.r, color.g, color.b);
		vertexHues.push(color.r, color.g, color.b);

	}

	// define the new attribute
	geometry.setAttribute('color', new THREE.Float32BufferAttribute(vertexHues, 3));

	return [geometry, material];
}

// cube color scheme 1
// ---------
const [cubeGeo1, cubeMaterial1] = makeCube(cubeWidth, cubeHeight, cubeDepth, [
	blue, blue, yellow, yellow, green, green
]);

// cube color scheme 2
// ---------
const [cubeGeo2, cubeMaterial2] = makeCube(cubeWidth - .1, transversalCubeHeight, cubeDepth - .1, [
	red, blue, yellow, yellow, green, green
]);

// cube color scheme 3
// ---------
const [cubeGeo3, cubeMaterial3] = makeCube(cubeWidth - .1, transversalCubeHeight, cubeDepth - .1, [
	blue, blue, yellow, yellow, red, green
]);

// All mesh
// ---------
const nintendoCube1 = new THREE.Mesh(cubeGeo1, cubeMaterial1);
const nintendoCube2 = new THREE.Mesh(cubeGeo1, cubeMaterial1);
const nintendoCube3 = new THREE.Mesh(cubeGeo1, cubeMaterial1);
const nintendoCube4 = new THREE.Mesh(cubeGeo1, cubeMaterial1);
const nintendoCube5 = new THREE.Mesh(cubeGeo2, cubeMaterial2);
const nintendoCube6 = new THREE.Mesh(cubeGeo2, cubeMaterial2);
const nintendoCube7 = new THREE.Mesh(cubeGeo3, cubeMaterial3);
const nintendoCube8 = new THREE.Mesh(cubeGeo3, cubeMaterial3);

// ------------------------------------------------------
// Add to scense
// ------------------------------------------------------

scene.add(
	nintendoCube1,
	nintendoCube2,
	nintendoCube3,
	nintendoCube4,
	nintendoCube5,
	nintendoCube6,
	nintendoCube7,
	nintendoCube8
);

// ------------------------------------------------------
// render
// ------------------------------------------------------

const renderer = new THREE.WebGLRenderer({
	antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const render = () => {

	// ------------------------------------------------------
	// position
	// ------------------------------------------------------

	nintendoCube1.position.set(-30, 0, 30);
	nintendoCube2.position.set(30, 0, 30);
	nintendoCube3.position.set(-30, 0, -30);
	nintendoCube4.position.set(30, 0, -30);

	nintendoCube5.position.set(0, 0, 30);
	nintendoCube5.rotation.z = 0.73;

	nintendoCube6.position.set(0, 0, -30);
	nintendoCube6.rotation.z = 2.41;

	nintendoCube7.position.set(-30, 0, 0);
	nintendoCube7.rotation.x = 2.41;

	nintendoCube8.position.set(30, 0, 0);
	nintendoCube8.rotation.x = 0.73;

	// ------------------------------------------------------
	// animation
	// ------------------------------------------------------

	requestAnimationFrame(render);
	scene.rotation.y += 0.008;

	renderer.render(scene, camera);

};

render();
