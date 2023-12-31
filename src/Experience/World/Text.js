import * as THREE from "three"
import { EventEmitter } from "events"
import Experience from "../Experience"

export default class Text extends EventEmitter {
    constructor() {
        super()
        this.experience = new Experience()
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.resource = this.resources.items.textModel;
        this.time = this.experience.time;
        this.animationStep = this.experience.lerping.animationStep;
        this.parameters = {
            textInitRotation: new THREE.Euler(1.62, 0.9, -0.3),
            textFinalRotation: new THREE.Euler(1.58, 0, 3.15),
            textInitPosition: new THREE.Vector3(0),
            textFinalPosition: new THREE.Vector3(-0.05, -0.05, 6),
            animationTime: 0
        }

        this.debug = this.experience.debug;
        if (this.debug.active) {
            this.debugFolder = this.debug.debugUI.addFolder("text")
        }

        this.setModel();
        this.setAnimation()
    }

    setModel() {
        this.text = this.resource.scene.children[0];
        this.scene.add(this.text)

        if (this.debug.active) {
            // this.debugFolder.add(this.parameters.textInitRotation, "x", -6, 6, 0.001)
            // this.debugFolder.add(this.parameters.textInitRotation, "y", -6, 6, 0.001)
            // this.debugFolder.add(this.parameters.textInitRotation, "z", -6, 6, 0.001)
            this.debugFolder.add(this.parameters, "animationTime", 0, 5, 0.001)
        }
    }

    setAnimation() {
        this.animation = {}
        this.animation.mixer = new THREE.AnimationMixer(this.text)
        this.animation.action = this.animation.mixer.clipAction(this.resource.animations[0])
        this.animation.action.play()

        this.animation.mixer.setTime(this.parameters.animationTime)
        this.animation.duration = this.resource.animations[0].duration
    }

    update() {
        if (this.text && this.experience.world?.planet?.earthRotationInDegrees > 265) {

            let animTime = this.animation.mixer.time + this.time.delta * 0.5

            if (animTime < this.animation.duration) {
                this.animation.mixer.setTime(animTime)
                return
            }
            this.emit("introFinished")
        }
    }
}