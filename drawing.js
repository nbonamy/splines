
const ANALYSIS_BOX_SIZE = 200

function drawPoint(ctx, p, options) {
  if (ctx.disabled) return
  options = {
    ...{ color: 'white', width: 1, radius: 1, filled: false, },
    ...options
  }
  ctx.fillStyle = options.color
  ctx.strokeStyle = options.color
  ctx.lineWidth = options.width
  ctx.beginPath()
  ctx.arc(p.x, p.y, options.radius, 0, Math.PI*2, true)
  if (options.filled) ctx.fill()
  else ctx.stroke()
}

function drawCurvePoint(ctx, p, options) {
  drawPoint(ctx, p, {
    ...{ width: 1.5, radius: 1.5 },
    ...options
  })
}

function drawControlPoint(ctx, p, options) {
  drawPoint(ctx, p, {
    ...{ width: 3, radius: 5 },
    ...options
  })
}

function drawIntermediatePoint(ctx, p, options) {
  drawControlPoint(ctx, p, {
    ...{ radius: 2 },
    ...options
  })
}

function joinPoints(ctx, p1, p2, options) {
  if (ctx.disabled) return
  options = {
    ...{ color: 'white', width: 1 },
    ...options
  }
  ctx.strokeStyle = options.color
  ctx.lineWidth = options.width
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.stroke()
}

function joinControlPoints(ctx, p1, p2, options) {
  joinPoints(ctx, p1, p2, {
    ...{ color: '#444' },
    ...options
  })
}

function joinIntermediatePoints(ctx, p1, p2, options) {
  joinPoints(ctx, p1, p2, {
    ...{ width: 0.5 },
    ...options
  })
}

function drawText(ctx, text, x, y, options) {
  options = {
    ...{ color: 'white', font: '12pt sans-serif', },
    ...options
  }
  ctx.font = options.font
  ctx.fillStyle = options.color
  ctx.fillText(text, x, y)
}

function drawRect(ctx, p, options) {
  if (ctx.disabled) return
  options = {
    ...{ color: 'white', size: 3 },
    ...options
  }
  ctx.fillStyle = options.color
  ctx.fillRect(p.x-options.size, p.y-options.size, 2*options.size+1, 2*options.size+1)

}

function objectColor(index, count) {
  let hue = Math.round(360 * index / (count))
  return `hsl(${hue}, 100%, 50%)`
}

function intermediateColor(t, index, count) {
  let hue1 = Math.round(360 * index / (count))
  let hue2 = Math.round(360 * (index+1) / (count))
  let hue = (1-t) * hue1 + t * hue2
  return `hsl(${hue}, 100%, 50%)`
}

function initAnalysisBox(ctx, left, top) {
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 1
  ctx.strokeRect(left, top, ANALYSIS_BOX_SIZE, ANALYSIS_BOX_SIZE)
  ctx.beginPath()
  ctx.moveTo(left + ANALYSIS_BOX_SIZE / 2, top)
  ctx.lineTo(left + ANALYSIS_BOX_SIZE / 2, top + ANALYSIS_BOX_SIZE)
  ctx.moveTo(left, top + ANALYSIS_BOX_SIZE / 2)
  ctx.lineTo(left + ANALYSIS_BOX_SIZE, top + ANALYSIS_BOX_SIZE / 2)
  ctx.stroke()
}

function getVelocityQuadrantRect() {
  return new Rect(
    window.innerWidth - ANALYSIS_BOX_SIZE - 16,
    16, ANALYSIS_BOX_SIZE, ANALYSIS_BOX_SIZE
  )
}

function initVelocityQuadrant(ctx) {
  if (ctx.disabled) return
  let rect = getVelocityQuadrantRect()
  initAnalysisBox(ctx, rect.x, rect.y)
  drawText(ctx, 'Velocity', rect.x, rect.y + rect.h + 20)
}

function drawVelocity(ctx, v, options) {
  if (ctx.disabled) return
  let rect = getVelocityQuadrantRect()
  let x = rect.x + rect.w/2 + v.x * rect.w/2
  let y = rect.y + rect.h/2 + v.y * rect.h/2
  if (rect.contains(new Point(x, y))) {
    drawCurvePoint(ctx, new Point(x, y), {
      ...{ width: 1, radius: 1, filled: true },
      ...options
    })
  }
}

function getAccelerationQuadrantRect() {
  return new Rect(
    window.innerWidth - ANALYSIS_BOX_SIZE - 16,
    16 + ANALYSIS_BOX_SIZE + 20 + 16,
    ANALYSIS_BOX_SIZE, ANALYSIS_BOX_SIZE
  )
}

function initAccelerationQuadrant(ctx) {
  if (ctx.disabled) return
  let rect = getAccelerationQuadrantRect()
  initAnalysisBox(ctx, rect.x, rect.y)
  drawText(ctx, 'Acceleration', rect.x, rect.y + rect.h + 20)
}

function drawAcceleration(ctx, v, options) {
  if (ctx.disabled) return
  let rect = getAccelerationQuadrantRect()
  let x = rect.x + rect.w/2 + v.x * rect.w/2
  let y = rect.y + rect.h/2 + v.y * rect.h/2
  if (rect.contains(new Point(x, y))) {
    drawCurvePoint(ctx, new Point(x, y), {
      ...{ width: 1, radius: 1, filled: true },
      ...options
    })
  }
}

function drawVelocityVector(ctx, p, v, options) {
  if (ctx.disabled) return

  // default
  options = {
    ...{ color: 'white', width: 5, size: 7.5 },
    ...options
  }

  // set
  ctx.fillStyle = options.color
  ctx.strokeStyle = options.color
  ctx.lineWidth = options.width
  ctx.save()

  // now draw line
  ctx.beginPath()
  ctx.translate(p.x, p.y)
  ctx.rotate(v.angle())
  ctx.moveTo(0, 0)
  ctx.lineTo(v.norm(), 0)
  ctx.stroke()

  // and arrow tip
  ctx.translate(v.norm(), 0)
  ctx.moveTo(0, options.size)
  ctx.lineTo(options.size, 0)
  ctx.lineTo(0, -options.size)
  ctx.fill()

  // done
  ctx.restore()

}