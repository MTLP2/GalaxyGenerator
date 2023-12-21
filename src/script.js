import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { generateUUID } from 'three/src/math/MathUtils'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//Galaxy 

const parameter = {
    count : 100000,
    sizes : 0.01,
    radius : 5,
    branch : 3,
    spin: 1,
    randomnes : 0.1,
    randomnespower : 3,
    insidecolor : '#ff6030' ,
    outsidecolor: '#1b3984'

}

let geometry = null
let material = null
let point = null

const galaxygenerator = ()=>{

    if(point !== null){
        geometry.dispose()
        material.dispose()
        scene.remove(point)
    }

    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameter.count*3)
    const colors = new Float32Array(parameter.count*3)

    const insideColor = new THREE.Color(parameter.insidecolor)
    const outsidecolor = new THREE.Color(parameter.outsidecolor)

    for (let i = 0; i < parameter.count; i++) {

        const i3 = i * 3
        const radius = Math.random() * parameter.radius
        const spinAngle = radius * parameter.spin
        const branchesAngles = (i % parameter.branch) / parameter.branch * Math.PI * 2 


        const randomX = Math.pow(Math.random(), parameter.randomnespower) * (Math.random() < 0.5 ? 1 : -1) * parameter.randomnes *radius
        const randomY = Math.pow(Math.random(), parameter.randomnespower) * (Math.random() < 0.5 ? 1 : -1)* parameter.randomnes *radius
        const randomZ = Math.pow(Math.random(), parameter.randomnespower) * (Math.random() < 0.5 ? 1 : -1)* parameter.randomnes *radius

        positions[i3] = Math.cos(branchesAngles + spinAngle)  * radius + randomX
        positions[i3+1] = randomY
        positions[i3+2] = Math.sin(branchesAngles + spinAngle) * radius + randomZ

        //colors

        const mixedcolor = insideColor.clone()
        mixedcolor.lerp(outsidecolor, radius / parameter.radius )

        colors[i3] = mixedcolor.r
        colors[i3 +1] = mixedcolor.g
        colors[i3+ 2] = mixedcolor.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))


    material = new THREE.PointsMaterial({
        size: parameter.sizes,
        sizeAttenuation: true, 
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    point = new THREE.Points(geometry, material)
    scene.add(point)

}

galaxygenerator()

gui.add(parameter, 'count').min(0).max(1000000).step(1).onFinishChange(galaxygenerator)
gui.add(parameter, 'sizes').min(0.001).max(0.1).step(0.001).onFinishChange(galaxygenerator)
gui.add(parameter, 'radius').min(1).max(10).step(1).onFinishChange(galaxygenerator)
gui.add(parameter, 'branch').min(1).max(5).step(1).onFinishChange(galaxygenerator)
gui.add(parameter, 'spin').min(-5).max(5).step(0.01).onFinishChange(galaxygenerator)
gui.add(parameter, 'randomnes').min(-1).max(2).step(0.01).onFinishChange(galaxygenerator)
gui.add(parameter, 'randomnespower').min(1).max(10).step(0.001).onFinishChange(galaxygenerator)
gui.addColor(parameter, 'insidecolor').onFinishChange(galaxygenerator)
gui.addColor(parameter, 'outsidecolor').onFinishChange(galaxygenerator)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()