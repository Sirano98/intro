import { Group } from "three";
import Experience from "../Experience";
import Background from "./Background";
import Controls from "./Controls";
import Environment from "./Environment";
import Monitor from "./Monitor";
import Planet from "./Planet";
import Text from "./Text";
import Galaxy from "./Galaxy";

export default class World {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.isLoaded = false;
        this.intro = true;
        this.planetGroup = new Group()

        this.resources.on('loaded', () => {
            this.background = new Background()
            this.planet = new Planet()
            this.text = new Text()

            this.text.on("introFinished", () => {
                this.intro = false
                this.controls = new Controls()
            })
            this.monitor = new Monitor()
            this.galaxy = new Galaxy()
            this.environment = new Environment()
            this.environment.updateMaterials(this.text.text)
            this.environment.updateMaterials(this.monitor.monitor)
            this.isLoaded = true
        })

    }

    resize() {
        if (this.isLoaded) {
            this.background.setBackgroundImageSize()

            if (!this.intro) {
                this.planet.resize()
                this.environment.resize()
            }
        }
    }

    update() {
        if (this.isLoaded) {
            this.planet.update();
            this.galaxy.animateGalaxy()

            if (this.intro) {
                this.text.textAnimation();
                this.environment.animateLight();
            }
        }
    }
}