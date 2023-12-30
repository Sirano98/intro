import * as THREE from "three"
import Experience from "../Experience";

export default class InteractiveText {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.resource = this.resources.items.interactiveText
        this.time = this.experience.time
        this.sizes = this.experience.sizes
        this.animationStep = this.experience.lerping.animationStep
        this.raycast = this.experience.raycast
        this.intersects = null
        this.textRotation = this.animationStep(0.6)
        this.textMoving = this.animationStep(0.6)
        this.parameters = {
            textInitRotation: new THREE.Vector3(Math.PI / 2, 0, 0),
            textFinalRotation: new THREE.Vector3(Math.PI / 2, 0, Math.PI * 2),
            textInitPosition: new THREE.Vector3(0, -2, 1),
            textFinalPosition: new THREE.Vector3(0, -0.9, 1),
            currentRotation: new THREE.Vector3(0)
        }

        this.debug = this.experience.debug;
        if (this.debug.active) {
            this.debugFolder = this.debug.debugUI.addFolder("welcome")
        }

        this.setModel()
        window.addEventListener('mousemove', this.raycast.onMove.bind(this.raycast))
        window.addEventListener('click', () => { this.onTextClick() })
    }

    setModel() {
        this.interactiveText = this.resource.scene.children[0]
        this.scene.add(this.interactiveText)
        this.interactiveText.position.set(...this.parameters.textInitPosition)
        // this.interactiveText.rotation.set(...this.parameters.textFinalRotation)

        // this.textInitQuaternion = new THREE.Quaternion()
        // this.textInitQuaternion.setFromEuler(this.parameters.textInitRotation)

        // this.textFinalQuaternion = new THREE.Quaternion()
        // this.textFinalQuaternion.setFromEuler(this.parameters.textFinalRotation)

        if (this.debug.active) {
            this.debugFolder.add(this.interactiveText.position, "x", -2, 2, 0.001)
            this.debugFolder.add(this.interactiveText.position, "y", -3, 2, 0.001)
            this.debugFolder.add(this.interactiveText.position, "z", -2, 2, 0.001)

            this.debugFolder.add(this.parameters.textFinalRotation, "x", -6, 6, 0.001)
            this.debugFolder.add(this.parameters.textFinalRotation, "y", -6, 6, 0.001)
            this.debugFolder.add(this.parameters.textFinalRotation, "z", -6, 6, 0.001)
        }
    }

    easeInCubic(step) {
        return -(Math.cos(Math.PI * step) - 1) / 2;
    }

    onTextClick() {
        window.location = "https://recruitment.casino/";
    }

    update() {
        this.interactiveText.position
            .lerpVectors(this.parameters.textInitPosition, this.parameters.textFinalPosition, this.textMoving(this.time.delta))

        this.parameters.currentRotation
            .lerpVectors(this.parameters.textInitRotation, this.parameters.textFinalRotation, this.textRotation(this.time.delta, this.easeInCubic))

        this.interactiveText.rotation.set(...this.parameters.currentRotation)

        this.intersects = this.raycast.raycast(this.interactiveText)
    }
}