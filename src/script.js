import * as THREE from 'three'
import * as dat from 'lil-gui'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

THREE.ColorManagement.enabled = false

/**
 * Loaders
 */

const textureLoader = new THREE.TextureLoader()
const modelLoader = new GLTFLoader()

/**
 * Textures
 */
const colorTexture = textureLoader.load('/textures/earth_color_map.jpg')
const displacementTexture = textureLoader.load('/textures/topography_5k.png')
const specularTexture = textureLoader.load('/textures/earth_specular_map.png')
const cloudsTexture = textureLoader.load('/textures/earth_clouds.jpg')

/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
    materialColor: '#ffeded'
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

const earthRotationSpeed = new THREE.Vector3(0.003, 1, 1)

const earthFolder = gui.addFolder("Earth")
earthFolder.add(earthMaterial, 'bumpScale', 0.1, 1, 0.1).name("Displacement shadow")
earthFolder.add(earthRotationSpeed, 'x', 0, 0.009, 0.0001).name("Rotation speed")
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
    color: '#387aff',
    metalness: 0.16,
    roughness: 0.37
})

let waterParams = {
    color: '#387aff'
}

let water = new THREE.Mesh(
    new THREE.SphereGeometry(0.99, 32, 32),
    waterMaterial
)

const waterFolder = gui.addFolder("Water")
waterFolder.addColor(waterParams, 'color').name("Water color").onChange((color) => {
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
 * Lights
 */
const light = new THREE.DirectionalLight('#fffff', 2)
let lightPosition = new THREE.Vector3(3, 0.5, 2.5)

const helper = new THREE.DirectionalLightHelper(light, 1);
scene.add(helper);

const folder = gui.addFolder("Light")
folder.add(lightPosition, "x", 0, 5, 0.1)
folder.add(lightPosition, "y", 0, 5, 0.1)
folder.add(lightPosition, "z", 0, 5, 0.1)

scene.add(light)

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
    canvas: canvas
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
    let { x, y, z } = lightPosition
    light.position.x = x
    light.position.y = y
    light.position.z = z

    // Earth
    earth.rotation.y -= earthRotationSpeed.x

    // Clouds
    clouds.rotation.y -= earthRotationSpeed.x / 2

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()