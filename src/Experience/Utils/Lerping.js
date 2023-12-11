export default class Lerping {
    constructor() { }

    animationStep(speed) {
        /*
        Creating a closure for instantiating animations with different speed.
        Timer increments by deltaTime the step variable calculates easing
        function for smoother transition.
        Easing fanction taken from https://easings.net/
        */

        let timer = 0
        let step = 0

        return (deltaTime, easingFunction) => {

            timer += speed * deltaTime
            timer = timer < 1 ? timer : 1

            return easingFunction ? easingFunction(timer) : -(Math.cos(Math.PI * timer) - 1) / 2
        }
    }
}