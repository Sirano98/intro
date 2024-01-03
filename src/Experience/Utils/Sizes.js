import { EventEmitter } from "events";

export default class Sizes extends EventEmitter {
    constructor() {
        super();
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspect = this.width / this.height;
        this.pixelRatio = Math.min(window.devicePixelRatio, 2);
        this.minSize = 320 / 1500;
        this.scaleFactor = Math.max(Math.min(this.width / 1500, 1), this.minSize);

        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.aspectRatio = this.width / this.height;
            this.scaleFactor = Math.max(Math.min(this.width / 1500, 1), this.minSize);
            this.setScalePercent()
            this.emit("resize");
        })

        this.setScalePercent()
    }

    setScalePercent() {
        this.totalScaleRange = 1 - this.minSize;
        let scaleFactorOnRange = 1 - this.scaleFactor
        this.currentScalePercent = 100 - ((scaleFactorOnRange * 100) / this.totalScaleRange)
    }
}