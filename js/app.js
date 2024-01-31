import * as THREE from "three"
import fragment from "./shader/fragment.glsl"
import vertex from "./shader/vertex.glsl"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import gui from "lil-gui"
import gsap from "gsap"
import image from "../img/texture-2.jpg"
import Lenis from "@studio-freight/lenis"
import barba from "@barba/core"

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene()
    this.container = options.dom
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.textureLoader = new THREE.TextureLoader()
    this.sliderGroup = new THREE.Group()
    this.scrollContainer = document.querySelector(".js-scroll-container")
    // this.renderer.setSize(this.width, this.height)
    // this.renderer.setClearColor(0xeeeeee, 1)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    this.container.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(
      80,
      window.innerWidth / window.innerHeight,
      10,
      1000
    )
    this.materials = []

    this.scroll = new Lenis({
      orientation: !document.body.classList.contains("b-inside")
        ? "horizontal"
        : "vertical",
      // wrapper: this.scrollContainer,
    })

    this.cameraPosition = 600
    this.camera.position.z = this.cameraPosition

    this.cameraUpdate()

    //this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.time = 0

    this.isPlaying = true
    this.addObjects()
    //  this.settings()
    this.resize()
    this.render()
    this.barba()
    this.setup()
  }
  barba() {
    let that = this
    barba.init({
      transitions: [
        {
          name: "from-home-transition",
          from: {
            namespace: ["home"],
          },
          leave(data) {
            //disable sscroll
            that.scroll.destroy()

            return gsap.to(data.current.container, {
              opacity: 0,
              duration: 0.5,
              onComplete: function () {
                that.container.style.opacity = 0
              },
            })
          },
          enter(data) {
            that.scroll = new Lenis({
              orientation: "vertical",
            })

            return gsap.from(data.next.container, {
              opacity: 0,
            })
          },
        },
        {
          name: "from-inside-transition",
          from: {
            namespace: ["inside"],
          },
          leave(data) {
            //disable sscroll
            that.scroll.destroy()

            return gsap
              .timeline()
              .to(".curtain", {
                duration: 0.3,
                y: 0,
              })
              .to(data.current.container, {
                opacity: 0,
                duration: 0.5,
              })
          },
          enter(data) {
            that.scroll = new Lenis({
              orientation: "horizontal",
            })

            that.addObjects()
            that.resize()

            return gsap
              .timeline()
              .to(".curtain", {
                duration: 0.3,
                y: "-100%",
              })
              .from(data.next.container, {
                opacity: 0,
                onStart: function () {
                  that.container.style.opacity = 1
                },
              })
          },
        },
      ],
    })
  }

  settings() {
    this.settingsParams = {
      progress: 0,
    }
    this.gui = new gui()
    this.gui.add(this.settingsParams, "progress", 0, 1, 0.01)
    // add wireframe to lil gui
    this.gui.add(this.material, "wireframe")
  }

  cameraUpdate() {
    // GET PERFECT ANGLE FOR PERSPECTIVE CAMERA SO WE CAN SET PIXEL SIZES IN GEOMETRY

    // 1. this calculates the angle of the camera Math.atan((window.innerHeight /2) / cameraPosition))
    // 2. convert it to degrees from radians * 180 / Math.PI
    // 3. multiply by 2 to get the full angle

    this.camera.fov =
      2 * ((Math.atan(this.height / 2 / this.cameraPosition) * 180) / Math.PI)
  }

  setup() {
    window.addEventListener("resize", this.resize.bind(this))
  }

  resize() {
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.renderer.setSize(this.width, this.height)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
    this.cameraUpdate()

    // updaet what the shader thinks the screen size is
    this.materials.forEach((m) => {
      m.uniforms.uFullscreen.value.x = this.width
      m.uniforms.uFullscreen.value.y = this.height
    })

    // update the image store
    this.imageStore.forEach((o) => {
      let bounds = o.img.getBoundingClientRect()
      o.width = bounds.width
      o.height = bounds.height
      o.top = bounds.top
      o.left = bounds.left + this.scroll.animatedScroll

      o.mesh.scale.set(bounds.width, bounds.height, 1)

      o.mesh.material.uniforms.uOriginal.value.x = bounds.width
      o.mesh.material.uniforms.uOriginal.value.y = bounds.height

      o.mesh.material.uniforms.uTextureSize.value.x = bounds.width
      o.mesh.material.uniforms.uTextureSize.value.y = bounds.height
    })
  }

  addObjects() {
    this.material = new THREE.ShaderMaterial({
      wireframe: false,
      uniforms: {
        time: { value: 1.0 },
        uProgress: { value: 0.0 },
        uTexture: { value: null },
        uTextureSize: { value: new THREE.Vector2(100, 100) },
        uCorners: { value: new THREE.Vector4(0, 0, 0, 0) },
        uOriginal: { value: new THREE.Vector2(300, 300) },
        uFullscreen: { value: new THREE.Vector2(this.width, this.height) },
      },
      side: THREE.DoubleSide,
      vertexShader: vertex,
      fragmentShader: fragment,
    })

    this.geometry = new THREE.PlaneGeometry(1, 1, 100, 100)
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.scale.set(300, 300, 1)
    // this.scene.add(this.mesh)

    this.mesh.position.x = 0

    // loop over images and create a mesh for each returning key information
    this.images = [...document.querySelectorAll(".js-image")]

    this.imageStore = this.images.map((img) => {
      let bounds = img.getBoundingClientRect()
      let material = this.material.clone()
      this.materials.push(material)

      let texture = this.textureLoader.load(img.src, function (texture) {
        texture.needsUpdate = true
      })

      material.uniforms.uTexture.value = texture

      img.addEventListener("mouseover", () => {
        this.timeline = gsap
          .timeline()
          .to(
            material.uniforms.uCorners.value,
            {
              x: 1,
              duration: 0.4,
            },
            0.1
          )
          .to(
            material.uniforms.uCorners.value,
            {
              y: 1,
              duration: 0.4,
            },
            0.2
          )
          .to(
            material.uniforms.uCorners.value,
            {
              z: 1,
              duration: 0.4,
            },
            0.3
          )
          .to(
            material.uniforms.uCorners.value,
            {
              w: 1,
              duration: 0.4,
            },
            0.4
          )
      })

      img.addEventListener("mouseout", () => {
        this.timeline = gsap
          .timeline()
          .to(
            material.uniforms.uCorners.value,
            {
              x: 0,
              duration: 0.4,
            },
            0.1
          )
          .to(
            material.uniforms.uCorners.value,
            {
              y: 0,
              duration: 0.4,
            },
            0.2
          )
          .to(
            material.uniforms.uCorners.value,
            {
              z: 0,
              duration: 0.4,
            },
            0.3
          )
          .to(
            material.uniforms.uCorners.value,
            {
              w: 0,
              duration: 0.4,
            },
            0.4
          )
      })

      let mesh = new THREE.Mesh(this.geometry, material)
      this.scene.add(mesh)
      mesh.scale.set(bounds.width, bounds.height, 1)

      return {
        img: img,
        mesh: mesh,
        width: bounds.width,
        height: bounds.height,
        top: bounds.top,
        left: bounds.left,
      }
    })
    // this.mesh.rotation.z = 0.5
  }

  stop() {
    this.isPlaying = false
  }

  play() {
    if (!this.isPlaying) {
      this.render()
      this.isPlaying = true
    }
  }

  setPosition() {
    // console.log(this.scroll.animatedScroll)
    // co-ordinate WEBGL + HTML Worlds
    this.imageStore.forEach((o) => {
      // move lenis scroll position to the left
      // get the HTML element position from the left
      // then as webgl stats in center not top left corner like html, subtract half the width screen
      // then like transclate(-50) in css subtract half the width of the element
      o.mesh.position.x =
        -this.scroll.animatedScroll + o.left - this.width / 2 + o.width / 2
      // -o.top because webgl is inverted
      // then as webgl stats in center not top left corner like html, subtract half the height screen
      // then like transclate(-50) in css subtract half the height of the element
      o.mesh.position.y = -o.top + this.height / 2 - o.height / 2
    })
  }

  render() {
    if (!this.isPlaying) return
    // console.log(this.time)
    this.scroll.raf(this.time * 300)
    this.time += 0.05

    this.material.uniforms.time.value = this.time
    //  this.material.uniforms.uProgress.value = this.settingsParams.progress

    this.setPosition()
    // set timeline based on progress
    // this.timeline.progress(this.settingsParams.progress)

    requestAnimationFrame(this.render.bind(this))
    this.renderer.render(this.scene, this.camera)
  }
}

new Sketch({
  dom: document.getElementById("container"),
})
