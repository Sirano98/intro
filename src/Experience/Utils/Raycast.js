import * as THREE from "three"
import Experience from "../Experience";

export default class Raycast {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()
    }

    onMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
    }

    raycast(model) {
        this.raycaster.setFromCamera(this.mouse, this.camera.camera)
        const intersects = this.raycaster.intersectObject(model)
        return intersects
    }
}