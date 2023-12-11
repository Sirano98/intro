import Experience from "../Experience";

export default class Background {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.sizes = this.experience.sizes

        this.setBackgroundImage()
    }

    setBackgroundImage() {
        this.backgroundImage = this.resources.items.background.image
        this.scene.background = this.resources.items.background
        this.setBackgroundImageSize()
    }

    setBackgroundImageSize() {
        if (this.scene.background) {

            let factor = (this.backgroundImage.width / this.backgroundImage.height) / (this.sizes.width / this.sizes.height);

            this.scene.background.offset.x = factor > 1 ? (1 - 1 / factor) / 2 : 0;
            this.scene.background.offset.y = factor > 1 ? 0 : (1 - factor) / 2;

            this.scene.background.repeat.x = factor > 1 ? 1 / factor : 1;
            this.scene.background.repeat.y = factor > 1 ? 1 : factor;
        }
    }
}