
const ANIMATION_STEP = 0.001

let showIntermediate = true
let animationTime = window.localStorage.animationTime || 4000
let animationRepeat = true
let activeScene = null
let hitTest = null
let startTime = 0

function drawPoint(ctx, p, options) {
  ctx.fillStyle = options?.color || 'white'
  ctx.strokeStyle = options?.color || 'white'
  ctx.lineWidth = options?.width || 1
  ctx.beginPath()
  ctx.arc(p.x, p.y, options?.radius || 1, 0, Math.PI*2, true)
  if (options?.filled) ctx.fill()
  else ctx.stroke()
}

function drawControlPoint(ctx, p, options) {
  drawPoint(ctx, p, {
    color: options?.color || 'white',
    width: options?.width || 3,
    radius: options?.radius || 5,
    filled: options?.filled || false,
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

function segmentAndTime(time, count) {
  let globalTime = (time * animationTime) / (animationTime / count)
  let segment = Math.floor(globalTime)
  let localTime = globalTime - segment
  return { s: segment, u: localTime }
}

function isLastFrame(time) {
  return animationRepeat == false && time >= 1
}

function draw() {

  // init
  const canvas = document.getElementById('canvas');
  if (canvas.getContext == null) return
  const ctx = canvas.getContext('2d');

  // start
  const frameStart = performance.now()

  // clear
  ctx.fillStyle = 'rgb(0,0,0)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // time
  let time = performance.now() - startTime
  if (animationRepeat) {
    time = (time % animationTime) / animationTime
  } else {
    time = Math.min(1, time / animationTime)
  }

  // specific draw
  activeScene.draw(ctx, time)

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
  startTime = performance.now()
  activeScene = eval(`${scene}()`)
}

document.addEventListener('DOMContentLoaded', () => {

  // configure our canvas
  const canvas = document.getElementById('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // drag stuff
  canvas.onmousedown = (e) => {
    let objects = activeScene.objects
    if (objects == null) return
    if (typeof objects == 'function') objects = objects()
    for (let object of objects) {
      if (object.hittest?.(e)) {
        hitTest = object
        break
      }
    }
  }
  canvas.onmousemove = (e) => {
    hitTest?.move?.(e)
  }
  canvas.onmouseup = (e) => {
    hitTest?.click?.(e)
    hitTest = null
  }

  // intermediate
  let intermediate_check = document.querySelector('[name=intermediate]')
  intermediate_check.checked = showIntermediate
  intermediate_check.onchange = (_) => showIntermediate = intermediate_check.checked
  
  // animation repeat
  let repeat_check = document.querySelector('[name=repeat]')
  repeat_check.checked = animationRepeat
  repeat_check.onchange = (_) => animationRepeat = repeat_check.checked
  
  // animation speed
  let speed_range = document.querySelector('[name=speed]')
  speed_range.value = speed_range.max - animationTime
  speed_range.oninput = (_) => {
    animationTime = Math.max(100, speed_range.max - speed_range.value)
    window.localStorage.animationTime = animationTime
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
