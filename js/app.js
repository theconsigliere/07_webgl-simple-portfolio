import * as THREE from "three"
import fragment from "./shader/fragment.glsl"
import vertex from "./shader/vertex.glsl"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import gui from "lil-gui"
import gsap from "gsap"
import image from "../img/texture.jpg"

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene()
    this.container = options.dom
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
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
    this.setupResize()
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

  setupResize() {
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
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      wireframe: false,
      uniforms: {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector4() },
        uTexture: { value: new THREE.TextureLoader().load(image) },
        uProgress: { value: 1.0 },
        uFullscreen: { value: new THREE.Vector2(this.width, this.height) },
        uOriginal: { value: new THREE.Vector2(300, 300) },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    })

    this.geometry = new THREE.PlaneGeometry(300, 300, 100, 100)
    //  this.geometry = new THREE.SphereGeometry(0.5, 30, 30)

    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.scene.add(this.mesh)

    this.mesh.position.x = 300
    this.mesh.rotation.z = 0.5
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
    requestAnimationFrame(this.render.bind(this))
    this.renderer.render(this.scene, this.camera)
  }
}

new Sketch({
  dom: document.getElementById("container"),
})
