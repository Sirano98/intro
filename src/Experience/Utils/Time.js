import { EventEmitter } from "events";

export default class Time extends EventEmitter {
    constructor() {
        super()

        this.start = Date.now();
        this.current = this.start;
        this.delta = 0.016;

        window.requestAnimationFrame(() => this.update());
    }

    update() {
        const currentTime = Date.now();
        this.delta = (currentTime - this.current) / 1000;
        this.current = currentTime;

        this.emit("update");
        window.requestAnimationFrame(() => this.update());
    }
}