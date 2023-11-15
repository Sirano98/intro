import * as THREE from 'three'
import * as dat from 'lil-gui'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import Stats from 'three/examples/jsm/libs/stats.module'

THREE.ColorManagement.enabled = false

/**
 * Loaders
 */
let isStared = false
let loadingInterval
let currentPercentages = 0
let nextPercent = 0

const increaseCounter = () => {
    if (currentPercentages < nextPercent) {
        currentPercentages++
        percentages.textContent = `${currentPercentages} %`
    }
}

const loadingManager = new THREE.LoadingManager();

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    nextPercent = Math.round((itemsLoaded / itemsTotal) * 100)
    loadingInterval = setInterval(increaseCounter, 100)
}

loadingManager.onLoad = () => {
    clearInterval(loadingInterval)
    percentages.classList.add('hide')
    startBtn.classList.add('visible_btn')
}

const textureLoader = new THREE.TextureLoader(loadingManager)
const modelLoader = new GLTFLoader(loadingManager)
const rgbeLoader = new RGBELoader(loadingManager)

/**
 * Textures
 */
const colorTexture = textureLoader.load('/textures/earth_color_map.jpg')
const displacementTexture = textureLoader.load('/textures/topography_5k.png')
const specularTexture = textureLoader.load('/textures/earth_specular_map.png')
const cloudsTexture = textureLoader.load('/textures/earth_clouds.jpg')

const environmentTexture = rgbeLoader.load('/textures/environment/sky.hdr', (envTexture) => {
    envTexture.mapping = THREE.EquirectangularReflectionMapping
    return envTexture
})

const setBackgroundSize = (scene, backgroundImageWidth, backgroundImageHeight) => {
    if (scene.background) {

        let factor = (backgroundImageWidth / backgroundImageHeight) / (sizes.width / sizes.height);

        scene.background.offset.x = factor > 1 ? (1 - 1 / factor) / 2 : 0;
        scene.background.offset.y = factor > 1 ? 0 : (1 - factor) / 2;

        scene.background.repeat.x = factor > 1 ? 1 / factor : 1;
        scene.background.repeat.y = factor > 1 ? 1 : factor;
    }
}

const backgroundURL = "/textures/background.jpg"
const backgroundImage = new Image();
backgroundImage.src = backgroundURL;
backgroundImage.onload = function () {
    scene.background = new THREE.TextureLoader().load(backgroundURL);
    setBackgroundSize(scene, backgroundImage.width, backgroundImage.height);
}

/**
 * Update materials
*/

const updateMaterials = (envTexture) => {
    text.traverse((child) => {
        if (child.isMesh && child.material.isMeshStandardMaterial) {

            if (envTexture.isTexture) {
                child.material.envMap = envTexture
            }
            child.material.envMapIntensity = parameters.envMapIntensity
        }
    })
}

/**
 * Debug
*/
const gui = new dat.GUI()

let parameters = {
    earthRotationSpeed: 0.15,
    earhInitialRotation: 230,
    waterColor: '#0055ff',
    textInitRotation: new THREE.Euler(1.62, 0.9, -0.3),
    textFinalRotation: new THREE.Euler(1.58, 0, 3.15),
    textInitPosition: new THREE.Vector3(0),
    textFinalPosition: new THREE.Vector3(-0.05, -0.05, 6),
    lightPosition: new THREE.Vector3(3, 0.5, 2.5),
    lightInitPosition: new THREE.Vector3(3, 2.6, -2.3),
    cameraPosition: new THREE.Vector3(0, 0, 6),
    cameraRotation: new THREE.Euler(0),
    cameraInitPosition: new THREE.Vector3(0.4, 0.65, 1.2),
    cameraInitRotaton: new THREE.Euler(0, 0, -0.61),
    envMapIntensity: 1.3,
    cameraRotationDebug: 0,
    cameraPositionDebug: 0,
    textRotationDebug: 0,
    rotationDebug: new THREE.Vector3(0)
}

const stats = new Stats()
document.body.appendChild(stats.dom)

/**
 * Base
*/
// Canvas
const canvas = document.querySelector('canvas.webgl')
const overlay = document.querySelector('.overlay')
const percentages = document.querySelector('.percentages')
const startBtn = document.querySelector('.start_btn')

/**
 * Start animation
 */

const startAnimation = (e) => {
    if (e.type === 'click' || e.key === 'Enter') {
        overlay.classList.add('ended')
        isStared = true
        canvas.requestFullscreen()
        screen.orientation.lock("landscape")
    }
}
startBtn.addEventListener('click', startAnimation)
document.addEventListener('keydown', startAnimation)

// Scene
const scene = new THREE.Scene()

/**
 * Earth
 */

const earthMaterial = new THREE.MeshStandardMaterial({
    map: colorTexture,
    bumpMap: displacementTexture,
    bumpScale: 0.2,
    metalness: 0.5,
    roughness: 1,
    metalnessMap: specularTexture,
    roughnessMap: specularTexture,
    transparent: true,
    alphaMap: specularTexture
})

const earthFolder = gui.addFolder("Earth").close()
earthFolder.add(earthMaterial, 'bumpScale', 0.1, 1, 0.1).name("Displacement shadow")
earthFolder.add(parameters, 'earthRotationSpeed', 0, 1, 0.0001).name("Rotation speed")
earthFolder.add(earthMaterial, 'metalness', 0, 1, 0.1).name("metalness")
earthFolder.add(earthMaterial, 'roughness', 0, 1, 0.1).name("roughness")

const earth = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    earthMaterial
)

earth.rotation.y = parameters.earhInitialRotation * (Math.PI / 180)

scene.add(earth)

/**
 * Water
 */

const waterMaterial = new THREE.MeshStandardMaterial({
    color: '#0055ff',
    metalness: 0.16,
    roughness: 0.37
})

let water = new THREE.Mesh(
    new THREE.SphereGeometry(0.996, 32, 32),
    waterMaterial
)

const waterFolder = gui.addFolder("Water").close()
waterFolder.addColor(parameters, 'waterColor').name("Water color").onChange((color) => {
    waterMaterial.color.set(color)
})
waterFolder.add(waterMaterial, 'metalness', 0, 1, 0.01)
waterFolder.add(waterMaterial, 'roughness', 0, 1, 0.01)

scene.add(water)

/**
 * Clouds
 */

const cloudsMaterial = new THREE.MeshStandardMaterial({
    map: cloudsTexture,
    transparent: true,
    alphaMap: cloudsTexture
})

const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(1.03, 32, 32),
    cloudsMaterial
)

scene.add(clouds)

/**
 * Atmosphere
 */
const atmosphereMaterial = new THREE.ShaderMaterial()

const atmoshereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    atmosphereMaterial
)

/**
 * Text
 */
let text

modelLoader.load(
    'models/text_for_intro.glb',
    (glb) => {
        text = glb.scene.children[0]
        updateMaterials(environmentTexture)
        scene.add(text)

        text.setRotationFromEuler(parameters.textInitRotation)
    }
)

// const textFolder = gui.addFolder("Text").close()
// textFolder.add(parameters.textInitRotation, 'x', 0, 360, 0.1).name("rotate x")
// textFolder.add(parameters.textInitRotation, 'y', 0, 360, 0.1).name("rotate y")
// textFolder.add(parameters.textRotation, 'z', 0, 360, 0.1).name("rotate z")
// textFolder.add(parameters.textPosition, 'x', -1, 0, 0.01).name("move x")
// textFolder.add(parameters.textPosition, 'y', -1, 0, 0.01).name("move y")
// textFolder.add(parameters.textPosition, 'z', 0, 7, 0.1).name("move z")
// textFolder.add(parameters, 'envMapIntensity', 0, 10, 0.001).onChange(updateMaterials)

/**
 * Lights
 */
const light = new THREE.SpotLight('#fffff', 4, 10);

light.position.set(...parameters.lightInitPosition)

// const helper = new THREE.SpotLightHelper(light, 1);
// scene.add(helper);

const folder = gui.addFolder("Light").close()
folder.add(parameters.lightPosition, "x", -10, 10, 0.1).name('move x')
folder.add(parameters.lightPosition, "y", -10, 10, 0.1).name('move y')
folder.add(parameters.lightPosition, "z", -10, 10, 0.1).name('move z')
folder.add(light, "intensity", 0, 10, 0.1)
folder.addColor(light, 'color').name("Light color")

scene.add(light)

const ambientlight = new THREE.AmbientLight(0x404040, 2)
scene.add(ambientlight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    setBackgroundSize(scene, backgroundImage.width, backgroundImage.height);
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(...parameters.cameraInitPosition)

//Set camera rotation to init position with quaternion 
let cameraInitQuaternion = new THREE.Quaternion()
cameraInitQuaternion.setFromEuler(parameters.cameraInitRotaton)
camera.setRotationFromQuaternion(cameraInitQuaternion)

// Create quaternion with final camera rotation
let cameraFinalQuaternion = new THREE.Quaternion()
cameraFinalQuaternion.setFromEuler(parameters.cameraRotation)

const cameraFolder = gui.addFolder('Camera').close()
cameraFolder.add(parameters.cameraPosition, 'x', -2, 2, 0.001).name('move x')
cameraFolder.add(parameters.cameraPosition, 'y', -2, 2, 0.001).name('move y')
cameraFolder.add(parameters.cameraPosition, 'z', 0, 6, 0.001).name('move z')
// cameraFolder.add(parameters.cameraRotation, 'x', -360, 0, 0.001).name('rotate x')
// cameraFolder.add(parameters.cameraRotation, 'y', -360, 0, 0.001).name('rotate y')
// cameraFolder.add(parameters.cameraRotation, 'z', -360, 0, 0.001).name('rotate z')
scene.add(camera)

/**
 * Controls
 */

// const controls = new OrbitControls(camera, canvas)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap = true


/**
 * Animate
*/
let earthRotationInDegrees = 0

const animationStep = (speed) => {
    /*
    Creating a closure for instantiating animations with different speed.
    Timer increments by deltaTime the step variable calculates easing 
    function for smoother transition.
    Easing fanction taken from https://easings.net/
    */

    let timer = 0
    let step = 0

    return (deltaTime, easingFunction) => {
        timer += speed * (deltaTime / 1000)
        timer = timer < 1 ? timer : 1

        return easingFunction ? easingFunction(timer) : -(Math.cos(Math.PI * timer) - 1) / 2
    }
}

const easeOutQuint = (step) => {
    return 1 - Math.pow(1 - step, 3)
}

/* Creating counters for animations where the argument is the speed of the animation.*/
const cameraMoveStep = animationStep(0.06)
const lightRotateStep = animationStep(0.1)
const cameraRotateStep = animationStep(0.1)
const textRotationFirstPart = animationStep(0.06)
const textRotationSecondPart = animationStep(0.06)
const textMoveStep = animationStep(0.2)

// cameraFolder.add(parameters, 'cameraRotationDebug', 0, 1, 0.001).name("cameraRotation")
// cameraFolder.add(parameters, 'cameraPositionDebug', 0, 1, 0.001).name("cameraPosition")
// cameraFolder.add(parameters, 'textRotationDebug', 0, 1, 0.001).name("textRotation")

const animateCamera = (deltaTime) => {

    /*Converting radians to degrees */
    earthRotationInDegrees = earth.rotation.y * 180 / Math.PI

    // // rotate camera
    // camera.quaternion.slerpQuaternions(cameraInitQuaternion, cameraFinalQuaternion, 1)
    // camera.position.lerpVectors(parameters.cameraInitPosition, parameters.cameraPosition, parameters.cameraPositionDebug)
    if (earthRotationInDegrees > 285) {

        // rotate camera
        camera.quaternion
            .slerpQuaternions(cameraInitQuaternion, cameraFinalQuaternion, cameraRotateStep(deltaTime))

        // move camera
        camera.position
            .lerpVectors(parameters.cameraInitPosition, parameters.cameraPosition, cameraMoveStep(deltaTime))

        // move light
        light.position
            .lerpVectors(parameters.lightInitPosition, parameters.lightPosition, lightRotateStep(deltaTime))
    }
}

// cameraFolder.add(parameters.rotationDebug, 'x', 0, 5, 0.001).name("textRotationX")
// cameraFolder.add(parameters.rotationDebug, 'y', 0, 5, 0.001).name("textRotationY")
// cameraFolder.add(parameters.rotationDebug, 'z', -2, 10, 0.001).name("textRotationZ")

let textAnimatonProgress = 0

const eulerLerp = (initialEuler, targetEuler, deltaTime) => {

    /*
    The algorithm returns the interpolation between Euler angles, which means
    means that it returns an Euler angle that depends on the interpolation percentage, 
    which is between 0 and 1. Also in this case, we rotate the object along the z-axis 
    70% of the way and only then start rotating all the axes together. 
    */

    const firstPartAnimStep = textRotationFirstPart(deltaTime, easeOutQuint)
    textAnimatonProgress = firstPartAnimStep

    let x = initialEuler.x + (targetEuler.x - initialEuler.x) * 0
    let y = initialEuler.y + (targetEuler.y - initialEuler.y) * 0
    let z = initialEuler.z + (targetEuler.z - initialEuler.z) * firstPartAnimStep

    if (firstPartAnimStep >= 0.7) {
        x = initialEuler.x + (targetEuler.x - initialEuler.x) * textRotationSecondPart(deltaTime)
        y = initialEuler.y + (targetEuler.y - initialEuler.y) * textRotationSecondPart(deltaTime)
    }

    return new THREE.Euler(x, y, z)
}

const textAnimation = (deltaTime) => {

    const { textInitRotation, textFinalRotation, textInitPosition, textFinalPosition } = parameters

    if (text && earthRotationInDegrees > 285) {
        text.setRotationFromEuler(eulerLerp(textInitRotation, textFinalRotation, deltaTime))
        if (textAnimatonProgress === 1) {
            text.position.lerpVectors(textInitPosition, textFinalPosition, textMoveStep(deltaTime))
        }
    }
}

let time = Date.now()

const tick = () => {
    // Time
    const currentTime = Date.now()
    const deltaTime = (currentTime - time)
    time = currentTime

    if (isStared) {

        // Light
        // light.position.set(...parameters.lightPosition)

        // Camera
        animateCamera(deltaTime)

        // Earth
        earth.rotation.y += parameters.earthRotationSpeed * deltaTime / 1000

        // Clouds
        clouds.rotation.y += (parameters.earthRotationSpeed / 2) * deltaTime / 1000

        // Text
        textAnimation(deltaTime)

        // Render
        renderer.render(scene, camera)
    }


    // PFS statistic
    stats.update()

    // setTimeout(function () {

    //     requestAnimationFrame(tick);

    // }, 1000 / 40);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()