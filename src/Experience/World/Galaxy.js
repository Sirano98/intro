import * as THREE from "three";
import Experience from "../Experience";
import GUI from "lil-gui";

export default class Galaxy {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.galaxy = null
        this.parameters = {
            count: 100000,
            size: 0.01,
            radius: 2,
            branches: 5,
            spin: 2,
            randomness: 0.2,
            randomnessPower: 3,
            insideColor: '#2e35ff',
            outsideColor: '#ff0000'
        }

        this.debug = this.experience.debug;
        if (this.debug.active) {
            this.debugFolder = this.debug.debugUI.addFolder("galaxy")
        }

        this.setGalaxy()
        this.setDebug()
    }

    setGalaxy() {
        // Destroy old galaxy
        if (this.galaxy !== null) {
            this.geometry.dispose()
            this.material.dispose()
            this.scene.remove(this.galaxy)
        }

        /**
         * Geometry
         */
        this.geometry = new THREE.BufferGeometry()

        const positions = new Float32Array(this.parameters.count * 3)
        const colors = new Float32Array(this.parameters.count * 3)

        const colorInside = new THREE.Color(this.parameters.insideColor)
        const colorOutside = new THREE.Color(this.parameters.outsideColor)

        for (let i = 0; i < this.parameters.count; i++) {
            // Position
            const i3 = i * 3

            const radius = Math.random() * this.parameters.radius

            const spinAngle = radius * this.parameters.spin
            const branchAngle = (i % this.parameters.branches) / this.parameters.branches * Math.PI * 2

            const randomX = Math.pow(Math.random(), this.parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * this.parameters.randomness * radius
            const randomY = Math.pow(Math.random(), this.parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * this.parameters.randomness * radius
            const randomZ = Math.pow(Math.random(), this.parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * this.parameters.randomness * radius

            positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
            positions[i3 + 1] = randomY
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

            // Color
            const mixedColor = colorInside.clone()
            mixedColor.lerp(colorOutside, radius / this.parameters.radius)

            colors[i3] = mixedColor.r
            colors[i3 + 1] = mixedColor.g
            colors[i3 + 2] = mixedColor.b
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

        /**
         * Material
         */
        this.material = new THREE.PointsMaterial({
            size: this.parameters.size,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        })

        /**
         * Points
         */
        this.galaxy = new THREE.Points(this.geometry, this.material)
        this.scene.add(this.galaxy)

        this.galaxy.position.set(0, -4.7, 2.8)
        this.galaxy.rotation.set(0.4, 0, 0)
    }

    setDebug() {
        if (this.debug.active) {

            this.debugFolder.add(this.galaxy.rotation, "x", 0, 5, 0.001)
            this.debugFolder.add(this.galaxy.rotation, "y", 0, 5, 0.001)
            this.debugFolder.add(this.galaxy.rotation, "z", 0, 5, 0.001)

            this.debugFolder.add(this.galaxy.position, "x", -1, 1, 0.001).name('moveX')
            this.debugFolder.add(this.galaxy.position, "y", -8, -4, 0.001).name('moveY')
            this.debugFolder.add(this.galaxy.position, "z", -2, 4, 0.001).name('moveZ')

            this.debugFolder.add(this.parameters, 'radius', 1, 6, 0.1).onFinishChange(() => this.setGalaxy())
            this.debugFolder.add(this.parameters, 'spin', -5, 5, 0.1).onFinishChange(() => this.setGalaxy())
            this.debugFolder.add(this.parameters, 'randomness', 0, 2, 0.001).onFinishChange(() => this.setGalaxy())
            this.debugFolder.add(this.parameters, 'randomnessPower', 1, 5, 0.01).onFinishChange(() => this.setGalaxy())

            // this.debugFolder.addColor(this.parameters, 'insideColor').onFinishChange(() => this.setGalaxy())
            // this.debugFolder.addColor(this.parameters, 'outsideColor').onFinishChange(() => this.setGalaxy())
        }
    }

    animateGalaxy() {
        this.galaxy.rotation.y += 0.1 * this.time.delta;
    }
}