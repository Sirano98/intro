import * as THREE from "three"
import Experience from "./Experience";

export default class Camera {
    constructor() {
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.time = this.experience.time;
        this.maxFOV = 83;
        this.minFOV = 35;
        this.totalFOVRange = this.maxFOV - this.minFOV;
        this.animationStep = this.experience.lerping.animationStep;
        this.cameraMoveStep = this.animationStep(0.06);
        this.cameraRotateStep = this.animationStep(0.1);
        this.parameters = {
            cameraPosition: new THREE.Vector3(0, 0, 6),
            cameraRotation: new THREE.Euler(0),
            cameraInitPosition: new THREE.Vector3(0.4, 0.65, 1.2),
            cameraInitRotaton: new THREE.Euler(0, 0, -0.61)
        }

        this.debug = this.experience.debug;
        if (this.debug.active) {
            this.debugFolder = this.debug.debugUI.addFolder("camera")
        }


        this.createPerspectiveCamera()
        this.resize()
    }

    createPerspectiveCamera() {
        this.camera = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 100);

        this.camera.position.set(...this.parameters.cameraInitPosition)

        this.cameraInitQuaternion = new THREE.Quaternion()
        this.cameraInitQuaternion.setFromEuler(this.parameters.cameraInitRotaton)
        this.camera.setRotationFromQuaternion(this.cameraInitQuaternion)

        this.cameraFinalQuaternion = new THREE.Quaternion()
        this.cameraFinalQuaternion.setFromEuler(this.parameters.cameraRotation)

        this.scene.add(this.camera)

        if (this.debug.active) {
            this.debugFolder.add(this.camera, "fov", 20, 100, 1).onChange(() => {
                this.camera.aspect = this.sizes.width / this.sizes.height
                this.camera.updateProjectionMatrix()
            })
        }
    }

    resize() {
        this.camera.aspect = this.sizes.width / this.sizes.height
        let currentFOVonRange = (this.sizes.currentScalePercent * this.totalFOVRange) / 100
        let currentFOV = this.maxFOV - currentFOVonRange
        this.camera.fov = currentFOV

        if (this.camera.aspect < 0.5) {
            this.camera.fov = this.maxFOV
        }

        this.camera.updateProjectionMatrix()
    }

    animateCamera() {
        let cameraMoveProgress = 0;

        // rotate camera
        if (this.experience.world?.planet?.earthRotationInDegrees > 285) {

            cameraMoveProgress = this.cameraMoveStep(this.time.delta)
            if (cameraMoveProgress === 1) {
                return
            }

            // rotate camera
            this.camera.quaternion
                .slerpQuaternions(this.cameraInitQuaternion, this.cameraFinalQuaternion, this.cameraRotateStep(this.time.delta))

            // move camera
            this.camera.position
                .lerpVectors(this.parameters.cameraInitPosition, this.parameters.cameraPosition, cameraMoveProgress)
        }
    }

    moveCamera() {
        this.camera.position.y = -window.scrollY / this.sizes.height * 4
    }
}