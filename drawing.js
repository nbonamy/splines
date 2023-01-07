
function drawPoint(ctx, p, options) {
  ctx.fillStyle = options?.color || 'white'
  ctx.strokeStyle = options?.color || 'white'
  ctx.lineWidth = options?.width || 1
  ctx.beginPath()
  ctx.arc(p.x, p.y, options?.radius || 1, 0, Math.PI*2, true)
  if (options?.filled) ctx.fill()
  else ctx.stroke()
}

function drawCurvePoint(ctx, p, options) {
  drawPoint(ctx, p, {
    color: options?.color || 'white',
    width: options?.width || 3,
    radius: options?.radius || 2,
    filled: options?.filled || false,
  })
}

function drawControlPoint(ctx, p, options) {
  drawPoint(ctx, p, {
    color: options?.color || 'white',
    width: options?.width || 3,
    radius: options?.radius || 5,
    filled: options?.filled || false,
  })
}

function drawIntermediatePoint(ctx, p, options) {
  drawControlPoint(ctx, p, {
    color: options?.color,
    radius: options?.radius || 2,
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

function joinIntermediatePoints(ctx, p1, p2, options) {
  joinControlPoints(ctx, p1, p2, {
    color: options?.color,
    width: options?.width || 0.5
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
