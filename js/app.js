import * as THREE from "three"
import fragment from "./shader/fragment.glsl"
import vertex from "./shader/vertex.glsl"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import gui from "lil-gui"
import gsap from "gsap"
import image from "../img/texture-2.jpg"
import Lenis from "@studio-freight/lenis"

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

    this.scroll = new Lenis({
      orientation: "horizontal",
    })

    const cameraPosition = 600
    this.camera.position.z = cameraPosition

    // GET PERFECT ANGLE FOR PERSPECTIVE CAMERA SO WE CAN SET PIXEL SIZES IN GEOMETRY

    // 1. this calculates the angle of the camera Math.atan((window.innerHeight /2) / cameraPosition))
    // 2. convert it to degrees from radians * 180 / Math.PI
    // 3. multiply by 2 to get the full angle

    this.camera.fov =
      2 * ((Math.atan(this.height / 2 / cameraPosition) * 180) / Math.PI)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.time = 0

    this.isPlaying = true
    this.addObjects()
    this.settings()
    this.resize()
    this.render()
    this.setup()
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

  setup() {
    window.addEventListener("resize", this.resize.bind(this))
  }

  resize() {
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.renderer.setSize(this.width, this.height)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
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

    this.timeline = gsap
      .timeline()
      .to(
        this.material.uniforms.uCorners.value,
        {
          x: 1,
          duration: 1,
        },
        0.1
      )
      .to(
        this.material.uniforms.uCorners.value,
        {
          y: 1,
          duration: 1,
        },
        0.2
      )
      .to(
        this.material.uniforms.uCorners.value,
        {
          z: 1,
          duration: 1,
        },
        0.3
      )
      .to(
        this.material.uniforms.uCorners.value,
        {
          w: 1,
          duration: 1,
        },
        0.4
      )

    this.geometry = new THREE.PlaneGeometry(1, 1, 100, 100)
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.scale.set(300, 300, 1)
    // this.scene.add(this.mesh)

    this.mesh.position.x = 0

    // loop over images and create a mesh for each returning key information
    this.images = [...document.querySelectorAll(".js-image")]
    this.materials = []

    this.imageStore = this.images.map((img) => {
      let bounds = img.getBoundingClientRect()
      let material = this.material.clone()
      this.materials.push(material)

      let texture = this.textureLoader.load(img.src, function (texture) {
        texture.needsUpdate = true
      })

      material.uniforms.uTexture.value = texture

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

  render() {
    if (!this.isPlaying) return
    this.time += 0.05
    this.material.uniforms.time.value = this.time
    this.material.uniforms.uProgress.value = this.settingsParams.progress

    // set timeline based on progress
    this.timeline.progress(this.settingsParams.progress)

    requestAnimationFrame(this.render.bind(this))
    this.renderer.render(this.scene, this.camera)
  }
}

new Sketch({
  dom: document.getElementById("container"),
})
