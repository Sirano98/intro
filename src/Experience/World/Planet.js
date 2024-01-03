import * as THREE from "three";
import Experience from "../Experience";
import vertexShader from '../../shaders/atmosphere/vertex.glsl'
import fragmentShader from '../../shaders/atmosphere/fragment.glsl'

export default class Planet {

    constructor() {

        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.time = this.experience.time;
        this.sizes = this.experience.sizes;
        this.planet = new THREE.Group();
        this.earthRotationInDegrees = 0;
        this.parameters = {
            earthRotationSpeed: 0.15,
            earhInitialRotation: 230,
            atmosphereSize: 1.1,
            planetInitPosition: new THREE.Vector3(0, 0, 0),
            planetFinalPosition: new THREE.Vector3(this.sizes.width * 0.0012, 0, 0)
        }

        this.debug = this.experience.debug;
        if (this.debug.active) {
            this.debugFolder = this.debug.debugUI.addFolder("planet")
        }

        this.setGeometry();
        this.setTextures();
        this.setMaterial();
        this.setMesh();
    }

    setGeometry() {
        // Earth
        this.earthGeometry = new THREE.SphereGeometry(1, 100, 100);

        // Water
        this.waterGeometry = new THREE.SphereGeometry(0.995, 100, 100);

        // Clouds
        this.cloudsGeometry = new THREE.SphereGeometry(1.03, 32, 32);

        // Atmosphere
        this.atmosphereGeometry = new THREE.SphereGeometry(1.1, 32, 32);
    }

    setTextures() {
        this.textures = {};

        this.textures.earthColor = this.resources.items.earthColorTexture;
        this.textures.displacement = this.resources.items.earthTopographyTexture;
        this.textures.specular = this.resources.items.earthSpecularTexture;
        this.textures.cloudsColor = this.resources.items.cloudsTexture;
    }

    setMaterial() {
        // Earth
        this.earthMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.earthColor,
            bumpMap: this.textures.displacement,
            bumpScale: 0.2,
            metalness: 0.5,
            roughness: 1,
            metalnessMap: this.textures.specular,
            roughnessMap: this.textures.specular,
            transparent: true,
            alphaMap: this.textures.specular
        })

        // Water
        this.waterMaterial = new THREE.MeshStandardMaterial({
            color: '#0055ff',
            metalness: 0.25,
            roughness: 0.57
        })

        // Clouds
        this.cloudsMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.cloudsColor,
            transparent: true,
            alphaMap: this.textures.cloudsColor,
            depthWrite: false
        })

        // Atmosphere
        this.atmosphereMaterial = new THREE.ShaderMaterial({
            transparent: true,
            vertexShader,
            fragmentShader,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            uniforms: {
                uAtmosphereIntensity: { value: 0.3 },
                uAtmosphereOpacity: { value: 1.0 },
                uAtmosphereColor: { value: new THREE.Color('#0091ff') }
            }
        })
    }

    setMesh() {
        this.earth = new THREE.Mesh(this.earthGeometry, this.earthMaterial);
        this.water = new THREE.Mesh(this.waterGeometry, this.waterMaterial);
        this.clouds = new THREE.Mesh(this.cloudsGeometry, this.cloudsMaterial);
        this.atmosphere = new THREE.Mesh(this.atmosphereGeometry, this.atmosphereMaterial)

        this.earth.rotation.y = this.parameters.earhInitialRotation * (Math.PI / 180)
        this.atmosphere.scale.set(this.parameters.atmosphereSize, this.parameters.atmosphereSize, this.parameters.atmosphereSize)

        this.planet.add(this.earth, this.water, this.atmosphere, this.clouds)
        this.scene.add(this.planet)

        if (this.debug.active) {
            this.debugFolder.add(this.planet.position, "x", 0, 5, 0.001)
        }
    }

    resize() {
        // this.planet.scale.set(this.sizes.scaleFactor, this.sizes.scaleFactor, this.sizes.scaleFactor)
    }

    update() {
        this.earth.rotation.y += 0.15 * this.time.delta;
        this.clouds.rotation.y += (0.15 * this.time.delta) / 2;
        this.earthRotationInDegrees = this.earth.rotation.y * 180 / Math.PI;
    }
}