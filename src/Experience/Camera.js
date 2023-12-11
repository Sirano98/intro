import * as THREE from "three"
import Experience from "./Experience";

export default class Camera {
    constructor() {
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.time = this.experience.time;
        this.animationStep = this.experience.lerping.animationStep;
        this.cameraMoveStep = this.animationStep(0.06);
        this.cameraRotateStep = this.animationStep(0.1);
        this.parameters = {
            cameraPosition: new THREE.Vector3(0, 0, 6),
            cameraRotation: new THREE.Euler(0),
            cameraInitPosition: new THREE.Vector3(0.4, 0.65, 1.2),
            cameraInitRotaton: new THREE.Euler(0, 0, -0.61)
        }

        this.createPerspectiveCamera()
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
    }

    resize() {
        this.camera.aspect = this.sizes.width / this.sizes.height
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