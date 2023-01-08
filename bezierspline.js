
const HANDLE_SIZE = 3

let method = 'naive'
let showVelocity = false

class ControlPoint {
  constructor(p, v1, v2, sym) {
    this.p = p
    this.v1 = v1
    this.v2 = v2
    this.sym = sym || false
  }
  endpoint1() {
    return this.v1.endpoint(this.p)
  }
  endpoint2() {
    return this.v2.endpoint(this.p)
  }
  drawHandle(ctx, p, color) {
    ctx.fillStyle = color
    ctx.fillRect(p.x-HANDLE_SIZE, p.y-HANDLE_SIZE, 2*HANDLE_SIZE+1, 2*HANDLE_SIZE+1)
  }
  draw(ctx, first, last, color) {
    drawControlPoint(ctx, this.p, { color: color, radius: this.sym ? 6 : 5, filled: true })
    if (!first) this.drawHandle(ctx, this.endpoint1(), color)
    if (!last) this.drawHandle(ctx, this.endpoint2(), color)
    if (!first) joinControlPoints(ctx, this.p, this.endpoint1(), { color: color })
    if (!last) joinControlPoints(ctx, this.p, this.endpoint2(), { color: color })
  }
  hittest(e) {
    this.active = null
    this.moved = false
    if (!e.shiftKey && this.p.hittest(e)) this.active = this.p
    else if (this.endpoint1().hittest(e)) this.active = this.v1
    else if (this.endpoint2().hittest(e)) this.active = this.v2
    return this.active
  }
  move(e) {
    if (this.active == this.p) {
      if (this.p.move(e)) {
        this.moved = true
      }
    } else {
      // is v1 or v2
      this.active.x = e.clientX - this.p.x
      this.active.y = e.clientY - this.p.y
      if (this.sym) {
        if (this.active == this.v1) {
          this.v2.x = -this.v1.x
          this.v2.y = -this.v1.y 
        } else {
          this.v1.x = -this.v2.x
          this.v1.y = -this.v2.y 
        }
      }
    }
  }
  click(e) {
    if (this.active == this.p && this.moved == false) {
      this.sym = !this.sym
      if (this.sym) {
        this.v2.x = -this.v1.x
        this.v2.y = -this.v1.y 
      }
    }
  }
}

function lerp4(p1, p2, p3, p4, maxtime, inctime, cb) {

  for (let u=0; u <= maxtime; u += inctime) {
    p5 = lerpPoints(p1, p2, u)
    p6 = lerpPoints(p2, p3, u)
    p7 = lerpPoints(p3, p4, u)
    p8 = lerpPoints(p5, p6, u)
    p9 = lerpPoints(p6, p7, u)
    p = lerpPoints(p8, p9, u)
    cb(u, p)
  }

  return [
    [ p5, p6, p7 ],
    [ p8, p9 ],
    p
  ]

}

function lerp4_optim(p1, p2, p3, p4, maxtime, inctime, cb) {

  let p5 = p1
  let p6 = p2
  let p7 = p3
  let v1 = new Vector(p2.x-p1.x, p2.y-p1.y).scaled(inctime)
  let v2 = new Vector(p3.x-p2.x, p3.y-p2.y).scaled(inctime)
  let v3 = new Vector(p4.x-p3.x, p4.y-p3.y).scaled(inctime)

  for (let u=0; u <= maxtime; u += inctime) {
    if (u != 0) {
      p5 = v1.endpoint(p5)
      p6 = v2.endpoint(p6)
      p7 = v3.endpoint(p7)
    }
    p8 = lerpPoints(p5, p6, u)
    p9 = lerpPoints(p6, p7, u)
    p = lerpPoints(p8, p9, u)
    cb(u, p)
  }

  return [
    [ p5, p6, p7 ],
    [ p8, p9 ],
    p
  ]

}

function bezierspline() {

  let points = [
    new ControlPoint(
      new Point(500, 300),
      new Vector(0, 0),
      new Vector(-250, 75)
    ),
    new ControlPoint(
      new Point(550, 650),
      new Vector(-200, -50),
      new Vector(200, 50),
    ),
    new ControlPoint(
      new Point(900, 200),
      new Vector(-150, 0),
      new Vector(150, 0),
    ),
    new ControlPoint(
      new Point(1200, 550),
      new Vector(-300, 150),
      new Vector(200, 200)
    ),
  ]

  let ptime = null
  let ppoint = null
  let velocities = []

  return {

    controls: [
      {
        type: 'button',
        label: 'Add a control point',
        callback: () => points.push(new ControlPoint(
          new Point(window.innerWidth/2, window.innerHeight/2),
          new Vector(-100, -100),
          new Vector(100, 100)
        ))
      },
      {
        type: 'select',
        label: 'Calculation Method',
        options: {
          'naive': 'Naive Lerp',
          'optim': 'Optimized Lerp',
          'matrix': 'Matrix'
        },
        callback: (m) => method = m
      },
      {
        type: 'checkbox',
        label: 'Show velocity',
        value: showVelocity,
        callback: (b) => showVelocity = b
      },
    ],
    
    objects: () => points,

    draw: function(ctx, time) {

      // reset
      if (ptime != null && time < ptime) {
        velocities = []
        ppoint = null
        ptime = null
      }

      // analysis boxes
      if (showVelocity) {
        initVelocityQuadrant(ctx)
      }

      // draw our points and join them
      if (showControlPoints) {
        for (let i=0; i<points.length; i++) {
          points[i].draw(ctx, i==0, i==points.length-1, objectColor(i, points.length))
        }
      }

      // calc max distance
      let maxdist = 0
      for (let i=0; i<points.length-1; i++) {
        let p1 = points[i].p
        let p2 = points[i+1].p
        maxdist = Math.max(maxdist, distance(p1, p2))
      }

      // calculation increment
      let inc = Math.max(CALCULATION_STEP, maxdist / 6e5)

      // lerp
      let su = segmentAndTime(time, points.length-1)
      for (let s=0; s <= su.s; s++) {
        if (s == points.length - 1) continue
        
        let p1 = points[s].p
        let p2 = points[s].endpoint2()
        let p3 = points[s+1].endpoint1()
        let p4 = points[s+1].p
        let color = objectColor(s, points.length)

        let res = null
        if (method == 'naive') {
          res = lerp4(p1, p2, p3, p4, (s==su.s ? su.u : 1), inc, (u, p) => {
            pColor = intermediateColor(u, s, points.length)
            drawCurvePoint(ctx, p, { color: pColor })
          })
        } else if (method == 'optim') {
          res = lerp4_optim(p1, p2, p3, p4, (s==su.s ? su.u : 1), inc, (u, p) => {
            pColor = intermediateColor(u, s, points.length)
            drawCurvePoint(ctx, p, { color: pColor })
          })
        }

        // draw intermediate points
        if (s == su.s && showIntermediate && !isLastFrame(time)) {
          joinIntermediatePoints(ctx, p2, p3, { color: color })
          joinIntermediatePoints(ctx, res[0][0], res[0][1], { color: 'cyan' })
          joinIntermediatePoints(ctx, res[0][1], res[0][2], { color: 'cyan' })
          joinIntermediatePoints(ctx, res[1][0], res[1][1], { color: 'green' })
          drawIntermediatePoint(ctx, res[0][0], { color: 'cyan' })
          drawIntermediatePoint(ctx, res[0][1], { color: 'cyan' })
          drawIntermediatePoint(ctx, res[0][2], { color: 'cyan' })
          drawIntermediatePoint(ctx, res[1][0], { color: 'green' })
          drawIntermediatePoint(ctx, res[1][1], { color: 'green' })
          drawIntermediatePoint(ctx, p, { color: pColor })
        }

      }

      // calc velocity
      let save = false
      if (ppoint != null && ptime != null) {
        
        if (time - ptime > 0.001) {
          
          // calc
          let vx = (p.x - ppoint.x) / (time - ptime)
          let vy = (p.y - ppoint.y) / (time - ptime)
          let velocity = new Vector(vx, vy)

          // save
          velocities.push({
            time: time,
            point: p,
            velocity: velocity,
            color: objectColor(su.s, points.length)
          })

          // save
          save = true
        
        }

      }

      // save
      if (save || ptime == null) {
        ppoint = p
        ptime = time
      }

      // draw
      if (showVelocity) {

        // draw current
        if (velocities.length) {
          let velocity = velocities[velocities.length-1]
          let normed = velocity.velocity.normalized().scaled(50)
          joinIntermediatePoints(ctx, p, normed.endpoint(p), { color: 'white', width: 5 })
        }

        // now draw all
        let maxnorm = 0
        for (let v of velocities) {
          maxnorm = Math.max(maxnorm, v.velocity.norm())
        }
        for (let v of velocities) {
          drawVelocity(ctx, v.velocity.scaled(1/maxnorm), { color: v.color })
        }

      }

    }

  }

}
