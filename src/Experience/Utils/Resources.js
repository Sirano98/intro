import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EventEmitter } from "events";

export default class Resources extends EventEmitter {
    constructor(sources) {
        super()

        this.sources = sources;

        this.items = {};
        this.loadingManager = new THREE.LoadingManager();
        this.currentPercentages = 0;
        this.nextPercent = 0
        this.percentages = document.querySelector('.percentages')
        this.overlay = document.querySelector('.overlay')
        this.startBtn = document.querySelector('.start_btn')
        this.loadingInterval;

        this.startBtn.addEventListener('click', this.startAnimation)

        this.setLoaders();
        this.startLoading();
    }

    startAnimation = (e) => {
        if (e.type === 'click' || e.key === 'Enter') {
            this.overlay.classList.add('ended')
            this.isStared = true
            this.emit("loaded")
        }
    }

    increaseCounter = () => {
        if (this.currentPercentages < this.nextPercent) {
            this.currentPercentages++
            this.percentages.textContent = `${this.currentPercentages} %`
        }
    }

    setLoaders() {
        this.loaders = {};
        this.loaders.gltfLoader = new GLTFLoader(this.loadingManager);
        this.loaders.textureLoader = new THREE.TextureLoader(this.loadingManager);
        this.loaders.rgbeLoader = new RGBELoader(this.loadingManager);

        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            this.nextPercent = Math.round((itemsLoaded / itemsTotal) * 100)
            this.loadingInterval = setInterval(this.increaseCounter, 100)
        }

        this.loadingManager.onLoad = () => {
            clearInterval(this.loadingInterval)
            this.percentages.classList.add('hide')
            this.startBtn.classList.add('visible_btn')

            document.querySelector('body').style.overflowY = "auto"
            window.scrollTo(0, 0)
            document.querySelector('body').style.overflowY = "hidden"
        }
    }

    startLoading() {
        for (const source of this.sources) {
            if (source.type === "glbModel") {

                this.loaders.gltfLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    })

            } else if (source.type === "texture") {

                this.loaders.textureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )

            } else if (source.type === "textureHDR") {

                this.loaders.rgbeLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )

            }
        }
    }

    sourceLoaded(source, file) {
        this.items[source.name] = file;
    }
}