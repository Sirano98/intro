import * as dat from 'lil-gui'

export default class Debug {
    constructor() {
        this.active = false

        if (this.active) {
            this.debugUI = new dat.GUI()
        }
    }
}