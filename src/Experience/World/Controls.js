import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Experience from "../Experience";

export default class Controls {
    constructor() {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.planet = this.experience.world.planet.planet
        this.light = this.experience.world.environment.light
        this.monitor = this.experience.world.monitor.monitor
        this.galaxy = this.experience.world.galaxy.galaxy

        gsap.registerPlugin(ScrollTrigger)
        this.setScrollTrigger()
    }

    setScrollTrigger() {
        // Hero
        this.firstTimeLine = new gsap.timeline({
            defaults: {
                duration: 1,
                ease: "power1.out"
            }
        })
        this.firstTimeLine.
            to(this.planet.position, {
                x: () => {
                    return this.sizes.width * 0.0012
                },
                onComplete: () => {
                    document.querySelector('body').style.overflowY = "auto"
                }
            })
            .to(this.light.position, {
                x: () => {
                    return this.sizes.width * 0.0012 + 3
                },
            }, 0)
            .to(".header", {
                y: "0",
            }, 0)
            .to(".hero__header-separate", {
                y: "0",
            }, 0)

        // About
        this.aboutTimeLine = new gsap.timeline({
            scrollTrigger: {
                trigger: '.about',
                start: 'top 80%',
                end: 'bottom 80%',
                scrub: true,
                markers: false,
            }
        })
        this.aboutTimeLine.fromTo(
            '.about__wrapper',
            {
                x: "-70%",
                opacity: "0"
            },
            {
                x: "0",
                opacity: "1"
            })

        // Portfolio
        this.portfolioTimeLine = new gsap.timeline({
            scrollTrigger: {
                trigger: '.portfolio',
                start: '20% 60%',
                end: 'bottom bottom',
                scrub: true,
                markers: false
            }
        })

        this.portfolioTimeLine
            .fromTo(this.monitor.rotation,
                {
                    y: () => { return -Math.PI }
                },
                {
                    y: "0"
                }, 0)
            .fromTo(this.monitor.position,
                {
                    x: "2"
                },
                {
                    x: "0"
                },
                0
            )

        // Contacts
        this.contactsTimeLine = new gsap.timeline({
            scrollTrigger: {
                trigger: '.contacts__wrapper',
                start: '-60% 80%',
                end: 'bottom 90%',
                scrub: true
            }
        })

        this.contactsTimeLine
            .fromTo('.contacts__wrapper',
                {
                    x: "30%",
                    opacity: "0"
                },
                {
                    x: "0",
                    opacity: "1"
                }, 0)
            .fromTo(this.galaxy.position,
                {
                    y: "-8"
                },
                {
                    y: "-6.8"
                }, 0
            )
    }
}