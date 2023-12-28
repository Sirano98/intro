import Experience from "../Experience";
import Background from "./Background";
import Environment from "./Environment";
import Planet from "./Planet";
import Text from "./Text";

export default class World {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.isLoaded = false;
        this.intro = true;

        this.resources.on('loaded', () => {
            this.background = new Background()
            this.planet = new Planet()
            this.text = new Text()

            this.text.on("introFinished", () => {
                this.intro = false
            })

            this.environment = new Environment()
            this.environment.updateMaterials(this.text.text)
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

            if (this.intro) {
                // this.text.textAnimation();
                this.text.update()
                this.environment.animateLight();
            }
        }
    }
}