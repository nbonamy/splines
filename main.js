
const PT_RADIUS = 5
const HITTEST_SENSITIVITY = 10
const ANIMATION_STEP = 0.001
let ANIMATION_TIME = window.localStorage.animationTime || 4000
let ANIMATION_REPEAT = true

class Point {
  constructor(x,y) {
    this.x = x
    this.y = y
  }
}

let hitTest = {
  objects: null,
  active: null
}

let START_TIME = performance.now()

function drawPoint(ctx, p, options) {
  ctx.strokeStyle = options?.color || 'white'
  ctx.lineWidth = options?.width || 1
  ctx.beginPath()
  ctx.arc(p.x, p.y, options?.radius || 1, 0, Math.PI*2, true)
  ctx.stroke()
}

function drawControlPoint(ctx, p, options) {
  drawPoint(ctx, p, {
    color: options?.color || 'white',
    width: options?.width || 3,
    radius: options?.radius || 5
  })
}

function joinPoints(ctx, p1, p2, options) {
  ctx.strokeStyle = options?.color || 'white'
  ctx.lineWidth = options?.width || 1
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.stroke()
}

function joinControlPoints(ctx, p1, p2, options) {
  joinPoints(ctx, p1, p2, {
    color: options?.color || '#444',
    width: options?.width
  })
}

function lerpPoints(p1, p2, t) {
  let x = (1-t) * p1.x + t * p2.x
  let y = (1-t) * p1.y + t * p2.y
  return new Point(x, y)
}

function dist(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

function isLastFrame(time) {
  return ANIMATION_REPEAT == false && time >= 1
}

function draw() {

  // init
  const canvas = document.getElementById('canvas');
  if (!canvas.getContext) return
  const ctx = canvas.getContext('2d');

  // start
  const frameStart = performance.now()

  // clear
  ctx.fillStyle = 'rgb(0,0,0)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // time
  let time = performance.now() - START_TIME
  if (ANIMATION_REPEAT) {
    time = (time % ANIMATION_TIME) / ANIMATION_TIME
  } else {
    time = Math.min(1, time / ANIMATION_TIME)
  }

  // specific draw
  do_draw(ctx, time)

  // calc fps
  const frameEnd = performance.now()
  const frameDuration = frameEnd - frameStart
  const fps = Math.round(1000 / frameDuration)

  // write fps
  ctx.fillStyle = 'white'
  ctx.font = '12pt sans-serif'
  ctx.fillText(`FPS: ${frameDuration} ms`, 10, window.innerHeight - 20)

  // iterate
  requestAnimationFrame(draw)

}

function change_scene(scene) {
  window.localStorage.scene = scene
  START_TIME = performance.now()
  let scene_desc = eval(`${scene}()`)
  hitTest.objects = scene_desc.objects
  do_draw = scene_desc.draw
}

document.addEventListener('DOMContentLoaded', () => {

  // configure our canvas
  const canvas = document.getElementById('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // drag stuff
  canvas.onmousedown = (e) => {
    if (hitTest.objects == null) return
    for (let object of hitTest.objects) {
      if (object instanceof Point) {
        let d = dist(new Point(e.clientX, e.clientY), object)
        if (d < HITTEST_SENSITIVITY) {
          hitTest.active = object
          break
        }
      }
    }
  }
  canvas.onmousemove = (e) => {
    if (hitTest.active == null) return
    if (hitTest.active instanceof Point) {
      hitTest.active.x = e.clientX
      hitTest.active.y = e.clientY
    }
  }
  canvas.onmouseup = (e) => {
    hitTest.active = null
  }

  // animation repeat
  let repeat_check = document.querySelector('[name=repeat]')
  repeat_check.checked = ANIMATION_REPEAT
  repeat_check.onchange = (_) => ANIMATION_REPEAT = repeat_check.checked
  
  // animation speed
  let speed_range = document.querySelector('[name=speed]')
  speed_range.value = speed_range.max - ANIMATION_TIME
  speed_range.oninput = (_) => {
    ANIMATION_TIME = Math.max(100, speed_range.max - speed_range.value)
    window.localStorage.animationTime = ANIMATION_TIME
  }

  // scene
  let scene_select = document.querySelector('[name=scene]')
  scene_select.onchange = (_) => change_scene(scene_select.value)

  // select default scene
  if (window.localStorage.scene != null) {
    scene_select.value = window.localStorage.scene
  }
  change_scene(scene_select.value)
  
  // now draw
  draw()
})
