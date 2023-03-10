
const CALCULATION_STEP = 0.001
const PERF_HISTORY_SIZE = 50

let animationTime = window.localStorage.animationTime || 4000
let animationRepeat = true
let showControlPoints = true
let showIntermediate = true
let drawingDisabled = false
let activeScene = null
let perfHistory = []
let hitTest = null
let startTime = 0

function lerpPoints(p1, p2, t) {
  return new Point(
    (1-t) * p1.x + t * p2.x,
    (1-t) * p1.y + t * p2.y
  )
}

function isLastFrame(time) {
  return animationRepeat == false && time >= 1
}

function draw() {

  // init
  const canvas = document.getElementById('canvas');
  if (canvas.getContext == null) return
  const ctx = canvas.getContext('2d', { alpha: false });

  // disable
  ctx.disabled = drawingDisabled

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
    time = 1
  }

  // specific draw
  activeScene.draw(ctx, time)

  // calc fps
  let frameEnd = performance.now()
  let frameDuration = frameEnd - frameStart
  
  // add to history
  perfHistory.push(frameDuration)
  if (perfHistory.length > PERF_HISTORY_SIZE) {
    perfHistory.shift()
  }

  // calc average duration
  let totalDuration = perfHistory.reduce((acc, h) => acc + h, 0)
  let avgDuration = (totalDuration / perfHistory.length).toFixed(drawingDisabled ? 1 : 0)

  // write fps
  drawText(ctx, `Frame: ${avgDuration} ms`, 10, window.innerHeight - 20)

  // iterate
  requestAnimationFrame(draw)

}

function change_scene(scene) {

  // switch
  window.localStorage.scene = scene
  startTime = performance.now()
  activeScene = eval(`${scene}()`)

  // add controls
  let controls = document.getElementById('controls')
  document.querySelectorAll('#controls .scene').forEach((el) => el.remove())
  if (activeScene.controls) {
    for (let control of activeScene.controls) {

      let widget = null
      if (control.type == 'button') {
        widget = document.createElement('button')
        widget.innerHTML = control.label
        widget.onclick = control.callback
      } else if (control.type == 'checkbox') {
        widget = document.createElement('input')
        widget.type = 'checkbox'
        widget.checked = control.value
        widget.onchange = (e) => control.callback(e.target.checked)
      } else if (control.type == 'select') {
        widget = document.createElement('select')
        widget.onchange = (e) => control.callback(e.target.value)
        for (let key in control.options) {
          let opt = document.createElement('option')
          opt.value = key
          opt.innerHTML = control.options[key]
          opt.selected = (key == control.selected)
          widget.appendChild(opt)
        }
      }

      if (widget != null) {
        let div = document.createElement('div')
        div.classList.add('scene')
        let label = document.createElement('label')
        label.innerHTML = control.label
        div.appendChild(label)
        div.appendChild(widget)
        controls.appendChild(div)
      }

    }
  }

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
      if (object.hittest?.(new Point(e.clientX, e.clientY), e)) {
        hitTest = object
        break
      }
    }
  }
  canvas.onmousemove = (e) => {
    hitTest?.set?.(new Point(e.clientX, e.clientY))
  }
  canvas.onmouseup = (e) => {
    hitTest?.click?.(e)
    hitTest = null
  }

  // animation speed
  let speed_range = document.querySelector('[name=speed]')
  speed_range.value = speed_range.max - animationTime
  speed_range.oninput = (_) => {
    animationTime = Math.max(100, speed_range.max - speed_range.value)
    window.localStorage.animationTime = animationTime
  }

  // animation repeat
  let repeat_check = document.querySelector('[name=repeat]')
  repeat_check.checked = animationRepeat
  repeat_check.onchange = (_) => animationRepeat = repeat_check.checked
  
  // control point
  let control_check = document.querySelector('[name=control]')
  control_check.checked = showControlPoints
  control_check.onchange = (_) => showControlPoints = control_check.checked
  
  // intermediate
  let intermediate_check = document.querySelector('[name=intermediate]')
  intermediate_check.checked = showIntermediate
  intermediate_check.onchange = (_) => showIntermediate = intermediate_check.checked
  
  // quiet
  let quiet_check = document.querySelector('[name=quiet]')
  quiet_check.checked = drawingDisabled
  quiet_check.onchange = (_) => drawingDisabled = quiet_check.checked
  
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
