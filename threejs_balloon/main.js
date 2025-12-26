import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

//setting scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.add(new THREE.AxesHelper(20000));

//camera
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth/window.innerHeight,
    1,
    200000
);
camera.position.set(20000, 20000, 20000);

//renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

//light
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xffffff, 0.6);
sun.position.set(1, 1, 1);
scene.add(sun);

//earth
const EARTH_RADIUS = 6371000;
const earth = new THREE/Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS, 64, 64),
    new THREE.MeshStandardMaterial({color: 0x2266cc})
);
scene.add(earth)

//balloon
const balloon = new THREE.Mesh(
    new THREE.SphereGeometry(300, 32, 32),
    new THREE.MeshStandardMaterial({color: 0xff0000})
);
balloon.position.set(
    p.x,
    p.y,
    EARTH_RADIUS + p.z
);
scene.add(balloon);

//tether
const tetherGeom = new THREE.BufferGeometry();
const tetherMat = new THREE.LineBasicMaterial({color: 0x555555});
const tether = new THREE.Line(tetherGeom, tetherMat);
tether.geometry.setFromPoints9[
    new THREE.Vector3(p.x, p.y, EARTH_RADIUS),
    new THREE.Vector3
]
scene.add(tether);

//trail
const trailGeom = new THREE.BufferGeometry();
const trailMat = new THREE.LineBasicMaterial({vertexColors: true});
const trail = new THREE.Line(trailGeom, trailMat);
scene.add(trail);

//colormap
function plasma(t) {
    t = Math.max(0, Math.min(1, t));
    return new THREE.Color(
        Math.min(1, 1.5*t),
        Math.max(0, 1.2*(t - 0.4)),
        Math.max(0, 1 - 1.3*t)
    );
}

//loading data
let data = [];
fetch("balloon_flight.json")
.then(res => res.json())
.then(json => {
    data = json;
    animate();
});

let i = 0;
const trailPositions = [];
const trailColors = [];

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    if (i < data.length) {
        const p = data[i];
        balloon.position.set(p.x, p.y, p.z);

        tether.geometry.setFromPoints([
            new THREE.Vector3(p.x, p.y, 0),
            new THREE.Vector3(p.x, p.y, p.z)
        ]);

        //color from radiation
        const radNorm = (p.radiation - 0.05)/0.4;
        const c = plasma(radNorm);
        balloon.material.color.copy(c);

        //trail
        trailPositions.push(p.x, p.y, p.z);
        trailColors.push(c.r, c.g, c.b);

        trailGeom.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(trailPositions, 3)
        );
        trailGeom.setAttribute(
            "color",
            new THREEFloat32BufferAttribute(trailColors, 3)
        )

        i += 2;
    }

    renderer.render(scene, camera);
}

//window resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

