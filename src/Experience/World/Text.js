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
        this.time = this.experience.time
        this.animationStep = this.experience.lerping.animationStep;
        this.parameters = {
            textInitRotation: new THREE.Euler(1.62, 0.9, -0.3),
            textFinalRotation: new THREE.Euler(1.58, 0, 3.15),
            textInitPosition: new THREE.Vector3(0),
            textFinalPosition: new THREE.Vector3(-0.05, -0.05, 6),
            textAnimatonProgress: 0
        }
        this.textRotationFirstPart = this.animationStep(0.06)
        this.textRotationSecondPart = this.animationStep(0.06)
        this.textMoveStep = this.animationStep(0.3)

        this.setModel();
    }

    setModel() {
        this.text = this.resource.scene.children[0];
        this.text.setRotationFromEuler(this.parameters.textInitRotation)
        this.scene.add(this.text)
    }

    textAnimation() {

        const { textInitRotation, textFinalRotation, textInitPosition, textFinalPosition } = this.parameters

        if (this.text && this.experience.world?.planet?.earthRotationInDegrees > 285) {
            this.text.setRotationFromEuler(this.eulerLerp(textInitRotation, textFinalRotation, this.time.delta))

            if (this.parameters.textAnimatonProgress === 1) {
                let textMoveProgress = this.textMoveStep(this.time.delta)
                this.text.position.lerpVectors(textInitPosition, textFinalPosition, textMoveProgress)

                if (textMoveProgress === 1) {
                    this.emit("introFinished")
                }
            }
        }
    }

    eulerLerp(initialEuler, targetEuler) {

        /*
        The algorithm returns the interpolation between Euler angles, which means
        means that it returns an Euler angle that depends on the interpolation percentage,
        which is between 0 and 1. Also in this case, we rotate the object along the z-axis
        70% of the way and only then start rotating all the axes together.
        */

        const firstPartAnimStep = this.textRotationFirstPart(this.time.delta, this.easeOutQuint)
        this.parameters.textAnimatonProgress = firstPartAnimStep

        let x = initialEuler.x + (targetEuler.x - initialEuler.x) * 0
        let y = initialEuler.y + (targetEuler.y - initialEuler.y) * 0
        let z = initialEuler.z + (targetEuler.z - initialEuler.z) * firstPartAnimStep

        if (firstPartAnimStep >= 0.7) {
            x = initialEuler.x + (targetEuler.x - initialEuler.x) * this.textRotationSecondPart(this.time.delta)
            y = initialEuler.y + (targetEuler.y - initialEuler.y) * this.textRotationSecondPart(this.time.delta)
        }

        return new THREE.Euler(x, y, z)
    }

    easeOutQuint(step) {
        return 1 - Math.pow(1 - step, 3)
    }
}