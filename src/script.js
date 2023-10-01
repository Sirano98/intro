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

/**
 * Debug
*/
const gui = new dat.GUI()

let parameters = {
    earthRotationSpeed: new THREE.Vector3(0.003, 1, 1),
    waterColor: '#0055ff',
    textRotation: new THREE.Vector3(),
    lightPosition: new THREE.Vector3(3, 0.5, 2.5)
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
earthFolder.add(parameters.earthRotationSpeed, 'x', 0, 0.009, 0.0001).name("Rotation speed")
earthFolder.add(earthMaterial, 'metalness', 0, 1, 0.1).name("metalness")
earthFolder.add(earthMaterial, 'roughness', 0, 1, 0.1).name("roughness")

const earth = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    earthMaterial
)

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

const waterFolder = gui.addFolder("Water")
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

const textFolder = gui.addFolder("Text")
textFolder.add(parameters.textRotation, 'z', 0, 360, 0.1).name("rotate z")
textFolder.add(parameters, 'envMapIntensity', 0, 10, 0.001).onChange(updateMaterials)

/**
 * Lights
 */
const light = new THREE.SpotLight('#fffff', 4, 10);

const helper = new THREE.SpotLightHelper(light, 1);
scene.add(helper);

const folder = gui.addFolder("Light")
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
camera.position.z = 6
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


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Light
    light.position.set(
        parameters.lightPosition.x,
        parameters.lightPosition.y,
        parameters.lightPosition.z)

    // Earth
    earth.rotation.y -= parameters.earthRotationSpeed.x

    // Clouds
    clouds.rotation.y -= parameters.earthRotationSpeed.x / 2

    // Text
    if (text) {
        text.rotation.z = parameters.textRotation.z * (Math.PI / 180)
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()