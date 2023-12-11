import * as THREE from 'three'
import Sizes from './Utils/Sizes';
import Camera from './Camera';
import Renderer from './Renderer';
import Time from './Utils/Time';
import World from './World/World';
import Resources from './Utils/Resources';
import Debug from './Utils/Debug';
import Lerping from './Utils/Lerping';

import sources from './Utils/sources';

THREE.ColorManagement.enabled = false

export default class Experience {
    static instance
    constructor(canvas) {

        if (Experience.instance) {
            return Experience.instance
        }

        Experience.instance = this;

        this.canvas = canvas;
        this.debug = new Debug();
        this.lerping = new Lerping()
        this.scene = new THREE.Scene();
        this.time = new Time();
        this.sizes = new Sizes();
        this.camera = new Camera();
        this.resources = new Resources(sources)
        this.renderer = new Renderer();
        this.world = new World();

        this.sizes.on("resize", () => {
            this.resize()
        });

        this.time.on("update", () => {
            this.update()
        });
    }

    resize() {
        this.world.resize()
        this.camera.resize()
        this.renderer.resize()
    }

    update() {
        this.world.update()
        if (this.world.intro) {
            this.camera.animateCamera()
        } else {
            this.camera.moveCamera()
        }
        this.renderer.update()
    }
}