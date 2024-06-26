//import * as THREE from './modules/three.module.js';


main();

var controls = new function () {
    this.rotationSpeedCube = 0.02;
    this.rotationSpeedSphere = 0.03;
};

var gui = new dat.GUI();
gui.add(controls, 'rotationSpeedCube', 0, 0.5);
gui.add(controls, 'rotationSpeedSphere', 0, 0.5);

var stats = initStats();

function main() {
    // create context
    const canvas = document.querySelector("#c");
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    const gl = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });

    // create camera
    const angleOfView = 55;
    const aspectRatio = canvas.clientWidth / canvas.clientHeight;
    const nearPlane = 0.1;
    const farPlane = 100;
    const camera = new THREE.PerspectiveCamera(
        angleOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );
    camera.position.set(0, 8, 30);

    var trackballControls = initTrackballControls(camera, gl);

    // create the scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0.3, 0.5, 0.8);
    const fog = new THREE.Fog("grey", 1, 90);
    scene.fog = fog;

    // GEOMETRY
    const cubeSize = 4;
    const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    const sphereRadius = 3;
    const sphereWidthSegments = 32;
    const sphereHeightSegments = 16;
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, sphereWidthSegments, sphereHeightSegments);

    const planeWidth = 256;
    const planeHeight = 128;
    const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

    // MATERIALS
    const textureLoader = new THREE.TextureLoader();

    const cubeMaterial = new THREE.MeshPhongMaterial({
        color: 'pink'
    });

    const sphereNormalMap = textureLoader.load('textures/sphere_normal.png');
    sphereNormalMap.wrapS = THREE.RepeatWrapping;
    sphereNormalMap.wrapT = THREE.RepeatWrapping;
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 'tan',
        normalMap: sphereNormalMap
    });

    const planeTextureMap = textureLoader.load('textures/pebbles.jpg');
    planeTextureMap.wrapS = THREE.RepeatWrapping;
    planeTextureMap.wrapT = THREE.RepeatWrapping;
    planeTextureMap.repeat.set(16, 16);
    planeTextureMap.minFilter = THREE.NearestFilter;
    planeTextureMap.anisotropy = gl.getMaxAnisotropy();
    const planeNorm = textureLoader.load('textures/pebbles_normal.png');
    planeNorm.wrapS = THREE.RepeatWrapping;
    planeNorm.wrapT = THREE.RepeatWrapping;
    planeNorm.minFilter = THREE.NearestFilter;
    planeNorm.repeat.set(16, 16);
    const planeMaterial = new THREE.MeshStandardMaterial({
        map: planeTextureMap,
        side: THREE.DoubleSide,
        normalMap: planeNorm
    });

    // MESHES
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(cubeSize + 1, cubeSize + 1, 0);
    scene.add(cube);

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
    scene.add(sphere);

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    //scene.add(plane);

    //LIGHTS
    const color = 0xffffff;
    const intensity = .7;
    const light = new THREE.DirectionalLight(color, intensity);
    light.target = plane;
    light.position.set(0, 30, 30);
    scene.add(light);
    scene.add(light.target);

    const ambientColor = 0xffffff;
    const ambientIntensity = 0.2;
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
    scene.add(ambientLight);

    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-10, 20, -5);
    spotLight.castShadow = true;
    scene.add(spotLight);

    var texture = textureLoader.load('textures/stone.jpg');
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;

          var loader = new THREE.OBJLoader();
        
          loader.load('objects/teapot.obj',
                function(mesh) {
                      var material = new THREE.MeshPhongMaterial({map:texture});
               
                      mesh.children.forEach(function(child) {
                      child.material = material;
                      child.castShadow = true;
                      });

                     mesh.position.set(-15, 2, 0);
                     mesh.rotation.set(-Math.PI / 2, 0, 0);
                     mesh.scale.set(0.005, 0.005, 0.005);
                
                    scene.add(mesh);
               },
               function ( xhr ) {
                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
               },
              function ( error ) {
                    console.log(error);
                   console.log( 'An error happened' );
              }
        );

    var clock = new THREE.Clock();
    // DRAW
    function draw(time) {
        time *= 0.001;

        if (resizeGLToDisplaySize(gl)) {
            const canvas = gl.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        cube.rotation.x += controls.rotationSpeedCube;
        cube.rotation.y += controls.rotationSpeedCube;
        cube.rotation.z += controls.rotationSpeedCube;

        sphere.rotation.x += controls.rotationSpeedSphere;
        sphere.rotation.y += controls.rotationSpeedSphere;
        sphere.rotation.z += controls.rotationSpeedSphere;

        light.position.x = 20 * Math.cos(time);
        light.position.y = 20 * Math.sin(time);
        stats.update();
        gl.render(scene, camera);
        requestAnimationFrame(draw);

        trackballControls.update(clock.getDelta());
    }

    requestAnimationFrame(draw);
}

// UPDATE RESIZE
function resizeGLToDisplaySize(gl) {
    const canvas = gl.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width != width || canvas.height != height;
    if (needResize) {
        gl.setSize(width, height, false);
    }
    return needResize;
}
