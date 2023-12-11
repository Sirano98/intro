import * as THREE from "three";
import Experience from "../Experience";

export default class Environment {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.planet = this.experience.world.planet.planet
        this.monitor = this.experience.world.monitor.monitor
        this.animationStep = this.experience.lerping.animationStep;
        this.parameters = {
            lightPosition: new THREE.Vector3(3, 0.5, 2.5),
            lightInitPosition: new THREE.Vector3(3, 2.6, -2.3)
        }
        this.lightRotateStep = this.animationStep(0.1)

        this.debug = this.experience.debug

        if (this.debug.active) {
            this.debugFolder = this.debug.debugUI.addFolder('light')
            this.debugSecondFolder = this.debug.debugUI.addFolder('LightForMonitor')
        }

        this.setLight()
        this.setEnvironmentMap()
    }

    setLight() {
        this.light = new THREE.SpotLight('#fffff', 4, 10)
        this.light.position.set(...this.parameters.lightInitPosition)

        this.ambientlight = new THREE.AmbientLight(0x404040, 2)

        this.scene.add(this.light, this.ambientlight)

        // Light for monitor
        this.lightForMonitor = new THREE.SpotLight('#fffff')
        this.lightForMonitor.intensity = 5
        this.lightForMonitor.distance = 15
        this.lightForMonitor.angle = 0.4
        this.lightForMonitor.target = this.monitor;
        this.lightForMonitor.position.set(0, -4, 7)

        // const helper = new THREE.SpotLightHelper(this.lightForMonitor, 1)

        this.scene.add(this.lightForMonitor)

        if (this.debug.active) {
            this.debugFolder.add(this.parameters.lightPosition, "x", -3, 6, 0.001)

            this.debugSecondFolder.add(this.lightForMonitor.position, "x", -4, 4, 0.001)
            this.debugSecondFolder.add(this.lightForMonitor.position, "y", -6, 0, 0.001)
            this.debugSecondFolder.add(this.lightForMonitor.position, "z", -4, 7, 0.001)
            this.debugSecondFolder.add(this.lightForMonitor, "angle", 0, 1, 0.001)
            this.debugSecondFolder.add(this.lightForMonitor, "distance", 5, 100, 1)
            this.debugSecondFolder.add(this.lightForMonitor, "intensity", 0, 500, 1)
        }
    }

    setEnvironmentMap() {
        this.environmentMap = this.resources.items.environmentMap
        this.environmentMap.mapping = THREE.EquirectangularReflectionMapping
    }

    updateMaterials(text) {
        text.traverse((child) => {
            if (child.isMesh && child.material.isMeshStandardMaterial) {

                if (this.environmentMap.isTexture) {
                    child.material.envMap = this.environmentMap
                }
                child.material.envMapIntensity = 1.3
            }
        })
    }

    animateLight() {
        if (this.experience.world?.planet?.earthRotationInDegrees > 285) {
            this.light.position
                .lerpVectors(this.parameters.lightInitPosition, this.parameters.lightPosition, this.lightRotateStep(this.time.delta))
        }
    }

    resize() {
        this.light.position.x = this.planet.position.x + 3
    }
}