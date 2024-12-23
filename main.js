import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const gridWidth = 100
const gridHeight = 100
// spring constant
const k = 0.1
// friction constant
// const kf = 0
// gravity constant
// const g = 0
const dt = 0.1

// const mode = 'euler'
const mode = 'rk4'

class Ball {
  constructor(position) {
    this.position = position
    this.material = new THREE.MeshBasicMaterial({ color: 0x0000FF });
    this.geometry = new THREE.SphereGeometry(1);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.copy(position)
    // this.position aliases this.mesh.position
    this.position = this.mesh.position
    scene.add(this.mesh)
    this.velocity = new THREE.Vector3(0,0,0)
    this.mass = 1
    this.t = 0
  }

  // Vector3[] -> void
  // physics-based update
  update() {
    const that = this
    function derivatives(t, {position, velocity}) {
      return {
        position: velocity,
        velocity: new THREE.Vector3(0, -k*position.y/that.mass, 0),
      }
    }

    function rk4() {
      // 4th order runge kutta
      const {position: k1p, velocity: k1v} = derivatives(that.t, {position: that.position, velocity: that.velocity})
      const {position: k2p, velocity: k2v} = derivatives(that.t + dt/2, {position: that.position.clone().add(k1p.clone().multiplyScalar(dt/2)), velocity: that.velocity.clone().add(k1v.clone().multiplyScalar(dt/2))})
      const {position: k3p, velocity: k3v} = derivatives(that.t + dt/2, {position: that.position.clone().add(k2p.clone().multiplyScalar(dt/2)), velocity: that.velocity.clone().add(k2v.clone().multiplyScalar(dt/2))})
      const {position: k4p, velocity: k4v} = derivatives(that.t + dt, {position: that.position.clone().add(k3p.clone().multiplyScalar(dt)), velocity: that.velocity.clone().add(k3v.clone().multiplyScalar(dt))})

      function vectorSum(vecs) {
        const sum = new THREE.Vector3()
        for (const vec of vecs) {
          sum.add(vec)
        }
        return sum
      }

      that.position.add(vectorSum([k1p,k2p,k2p,k3p,k3p,k4p]).multiplyScalar(dt / 6))
      that.velocity.add(vectorSum([k1v,k2v,k2v,k3v,k3v,k4v]).multiplyScalar(dt / 6))
      that.t += dt
    }

    function euler() {
      const {position: dpdt, velocity: dvdt} = derivatives(that.t, {position: that.position, velocity: that.velocity})
      that.position.add(dpdt.clone().multiplyScalar(dt))
      that.velocity.add(dvdt.clone().multiplyScalar(dt))
      that.t += dt
    }

    rk4()
  }

  remove() {
    scene.remove(this.mesh)
  }
}

function yToColor(y) {
  // return new THREE.Color(0xFF0000).lerp(new THREE.Color(0x0000FF), clamp(mapInterval(y, -1, 1, 0, 1), 0, 1))
  return new THREE.Color(0x000000).lerp(new THREE.Color(0xFFFFFF), Math.abs(y/2))
}

function mapInterval(x, oldMin, oldMax, newMin, newMax) {
  const oldProgress = (x - oldMin) / (oldMax - oldMin)
  return newMin + oldProgress * (newMax - newMin)
}

function clamp(x, min, max) {
  if (x < min) {
    return min
  } else if (x > max) {
    return max
  } else {
    return x
  }
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const color = 0xFFFFFF;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(-10, 10, 0)
camera.lookAt(new THREE.Vector3(0,0,0))
controls.update()

const ball = new Ball(new THREE.Vector3(0,5,0))
const grid = new THREE.GridHelper(100, 10);
scene.add(grid);


function animate() {
    renderer.render(scene, camera);
    ball.update()
    controls.update()
}