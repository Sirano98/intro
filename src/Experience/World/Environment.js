import * as THREE from "three";
import Experience from "../Experience";

export default class Environment {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.planet = this.experience.world.planet.planet
        this.animationStep = this.experience.lerping.animationStep;
        this.parameters = {
            lightPosition: new THREE.Vector3(3, 0.5, 2.5),
            lightInitPosition: new THREE.Vector3(3, 2.6, -2.3),
            intensity: 1.3
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
        this.light = new THREE.SpotLight('#ffffff', 4, 10)
        this.light.position.set(...this.parameters.lightInitPosition)

        this.ambientlight = new THREE.AmbientLight(0x404040, 2)

        this.scene.add(this.light, this.ambientlight)

        this.lightForInterText = new THREE.SpotLight('#ffffff', 2, 2.8, 1.5)
        this.lightForInterText.target.position.set(0.46, 0, 0)
        this.lightForInterText.position.set(-1.9, 0.066, 1.837)
        this.scene.add(this.lightForInterText, this.lightForInterText.target)
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

                let intensity = 1.3

                text.name === "InteractiveText" ? intensity = 0 : intensity
                child.material.envMapIntensity = intensity
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