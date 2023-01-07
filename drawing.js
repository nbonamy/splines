
function drawPoint(ctx, p, options) {
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
    ...{ width: 3, radius: 2 },
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
  joinControlPoints(ctx, p1, p2, {
    ...{ width: 0.5 },
    ...options
  })
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
