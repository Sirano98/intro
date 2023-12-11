import * as THREE from "three"
import Experience from "../Experience";

export default class Monitor {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.resource = this.resources.items.monitorModel
        this.monitor = new THREE.Group()
        this.parameters = {
            monitorPosition: new THREE.Vector3(0, -6.5, 3)
        }

        this.debug = this.experience.debug;
        if (this.debug.active) {
            this.debugFolder = this.debug.debugUI.addFolder("monitor")
        }

        this.setModel()
    }

    setModel() {
        const partsOfMonitor = [...this.resource.scene.children]

        for (let part of partsOfMonitor) {

            if (part.name === "monitor") {
                part.material = new THREE.MeshBasicMaterial({
                    map: this.resources.items.screen
                })
            }

            this.monitor.add(part)
        }

        if (this.debug.active) {
            this.debugFolder.add(this.monitor.position, "x", -1, 1, 0.001)
            this.debugFolder.add(this.monitor.position, "y", -8, -4, 0.01)
            this.debugFolder.add(this.monitor.position, "z", 0, 4, 0.001)

            this.debugFolder.add(this.monitor.rotation, "x", 0, 3.14, 0.001).name("rotationX")
            this.debugFolder.add(this.monitor.rotation, "y", 0, 3.14, 0.001).name("rotationY")
            this.debugFolder.add(this.monitor.rotation, "z", 0, 3.14, 0.001).name("rotationZ")
        }

        this.monitor.position.set(...this.parameters.monitorPosition)
        this.monitor.rotation.y = -Math.PI

        this.scene.add(this.monitor)
    }
}