import * as THREE from 'three'
import * as dat from 'lil-gui'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

THREE.ColorManagement.enabled = false

/**
 * Loaders
 */

const textureLoader = new THREE.TextureLoader()
const modelLoader = new GLTFLoader()
const rgbeLoader = new RGBELoader()

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

textureLoader.load('/textures/background.jpg', (texture) => {
    scene.background = texture
})

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

const degreesToRadians = (vector) => {
    const vectorWithadians = new THREE.Vector3
    vectorWithadians.x = vector.x * (Math.PI / 180)
    vectorWithadians.y = vector.y * (Math.PI / 180)
    vectorWithadians.z = vector.z * (Math.PI / 180)

    return vectorWithadians
}

/**
 * Debug
*/
const gui = new dat.GUI()

let parameters = {
    earthRotationSpeed: 0.003,
    earhInitialRotation: 230,
    waterColor: '#0055ff',
    textRotation: new THREE.Vector3(90, 0, 180),
    textInitRotation: new THREE.Vector3(77, 32.6, 0),
    textPosition: new THREE.Vector3(-0.05, -0.05, 6),
    lightPosition: new THREE.Vector3(3, 0.5, 2.5),
    lightInitPosition: new THREE.Vector3(3, 2.6, -2.3),
    cameraPosition: new THREE.Vector3(0, 0, 6),
    cameraRotation: new THREE.Vector3(),
    cameraInitPosition: new THREE.Vector3(0.4, 0.65, 1.2),
    cameraInitRotaton: new THREE.Vector3(0, 0, -35)
}

/**
 * Base
*/
// Canvas
const canvas = document.querySelector('canvas.webgl')

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

const earthFolder = gui.addFolder("Earth")
earthFolder.add(earthMaterial, 'bumpScale', 0.1, 1, 0.1).name("Displacement shadow")
earthFolder.add(parameters, 'earthRotationSpeed', 0, 0.009, 0.0001).name("Rotation speed")
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
    new THREE.SphereGeometry(0.99, 32, 32),
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
 * Text
 */
let text

modelLoader.load(
    'models/text_for_intro.glb',
    (glb) => {
        text = glb.scene.children[0]
        text.rotation.z = 0

        updateMaterials(environmentTexture)
        scene.add(text)
    }
)

parameters.envMapIntensity = 1.3

let textInitEuler = new THREE.Euler(...degreesToRadians(parameters.textInitRotation))
let textInitQuaternion = new THREE.Quaternion();
textInitQuaternion.setFromEuler(textInitEuler)

// const textFolder = gui.addFolder("Text")
// textFolder.add(parameters.textInitRotation, 'x', 0, 360, 0.1).name("rotate x")
// textFolder.add(parameters.textInitRotation, 'y', 0, 360, 0.1).name("rotate y")
// textFolder.add(parameters.textInitRotation, 'z', 0, 360, 0.1).name("rotate z")
// textFolder.add(parameters.textPosition, 'x', -1, 0, 0.01).name("move x")
// textFolder.add(parameters.textPosition, 'y', -1, 0, 0.01).name("move y")
// textFolder.add(parameters.textPosition, 'z', 0, 7, 0.1).name("move z")
// textFolder.add(parameters, 'envMapIntensity', 0, 10, 0.001).onChange(updateMaterials)

/**
 * Lights
 */
const light = new THREE.SpotLight('#fffff', 4, 10);

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
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(...parameters.cameraInitPosition)
let initialEuler = new THREE.Euler(...degreesToRadians(parameters.cameraInitRotaton));
let initialquaternion = new THREE.Quaternion();
initialquaternion.setFromEuler(initialEuler);

let targetEuler = new THREE.Euler(...degreesToRadians(parameters.cameraRotation));
let targetQuaternion = new THREE.Quaternion().setFromEuler(targetEuler)

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

const controls = new OrbitControls(camera, canvas)

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

let earthRotation = 0

light.position.set(...parameters.lightInitPosition)
const animateCamera = () => {
    let easing = 0.001
    camera.position.z >= 2.3 ? easing = 0.01 : easing

    earthRotation = earth.rotation.y * 180 / Math.PI

    if (earthRotation > 285) {
        camera.position.lerp(parameters.cameraPosition, easing)
        camera.quaternion.slerp(targetQuaternion, easing)


        light.position.lerp(parameters.lightPosition, 0.01)
        return
    }

    camera.rotation.setFromQuaternion(initialquaternion)
}

let animVector = new THREE.Vector3(77, 32.6, 180)
let textTargetEuler = new THREE.Euler(...degreesToRadians(animVector))
let textTargetQuaternion = new THREE.Quaternion();
textTargetQuaternion.setFromEuler(textTargetEuler)

let textFinalQuaternion = new THREE.Quaternion();
textFinalQuaternion.setFromEuler(new THREE.Euler(...degreesToRadians(new THREE.Vector3(90, 0, 180))))

let eulerFromQuat = new THREE.Euler()
let degFromEuler

const textAnimation = () => {
    if (text) {
        eulerFromQuat.setFromQuaternion(text.quaternion)
        degFromEuler = eulerFromQuat.z * 180 / Math.PI

        if (earthRotation > 270 && degFromEuler < 120) {
            text.quaternion.slerp(textTargetQuaternion, 0.004)
            return
        }

        if (degFromEuler > 120 && degFromEuler < 177) {
            text.quaternion.slerp(textFinalQuaternion, 0.01)
            return
        }

        if (degFromEuler > 177) {
            text.quaternion.slerp(textFinalQuaternion, 0.1)
            text.position.lerp(parameters.textPosition, 0.01)
            return
        }

        text.rotation.setFromQuaternion(textInitQuaternion)
    }
}

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Light
    // light.position.set(...parameters.lightPosition)

    // Camera
    animateCamera()

    // Earth
    earth.rotation.y += parameters.earthRotationSpeed

    // Clouds
    clouds.rotation.y += parameters.earthRotationSpeed / 2

    // Text
    textAnimation()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()