
const HANDLE_SIZE = 3

let method = 'polynomial'
let showVelocity = true

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

// https://youtu.be/jvPPXbo87ds?t=433
function polynomial(p1, p2, p3, p4, maxtime, inctime, cb) {

  let v0 = new Vector(
    p1.x,
    p1.y
  )
  let v1 = new Vector(
    -3 * p1.x + 3 * p2.x,
    -3 * p1.y + 3 * p2.y,
  )
  let v2 = new Vector(
    3 * p1.x - 6 * p2.x + 3 * p3.x,
    3 * p1.y - 6 * p2.y + 3 * p3.y,
  )
  let v3 = new Vector(
    - p1.x + 3 * p2.x - 3 * p3.x + p4.x,
    - p1.y + 3 * p2.y - 3 * p3.y + p4.y,
  )
    
  for (let u=0; u <= maxtime; u += inctime) {

    let u2 = u * u
    let u3 = u2 * u
    let p = new Point(
      v0.x + u * v1.x + u2 * v2.x + u3 * v3.x, 
      v0.y + u * v1.y + u2 * v2.y + u3 * v3.y, 
    )

    cb(u, p)
  }

  return null

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
          'polynomial': 'Polynomial'
        },
        selected: method,
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

      // to calc velocity
      let ppoint = null
      let pvelocity = null
      if (showVelocity) {
        initVelocityQuadrant(ctx)
        initAccelerationQuadrant(ctx)
      }

      // draw our points and join them
      if (showControlPoints) {
        for (let i=0; i<points.length; i++) {
          points[i].draw(ctx, i==0, i==points.length-1, objectColor(i, points.length))
        }
      }

      // calc max distance
      // let maxdist = 0
      // for (let i=0; i<points.length-1; i++) {
      //   let p1 = points[i].p
      //   let p2 = points[i+1].p
      //   maxdist = Math.max(maxdist, distance(p1, p2))
      // }

      // calculation increment
      let inctime = CALCULATION_STEP//Math.max(CALCULATION_STEP, maxdist / 6e5)

      // lerp
      let su = segmentAndTime(time, points.length-1)
      for (let s=0; s <= su.s; s++) {
        if (s == points.length - 1) continue
        
        let p1 = points[s].p
        let p2 = points[s].endpoint2()
        let p3 = points[s+1].endpoint1()
        let p4 = points[s+1].p

        let color = objectColor(s, points.length)

        let cb = (u, p) => {

          // 1st draw it
          pColor = intermediateColor(u, s, points.length)
          drawCurvePoint(ctx, p, { color: pColor })

          // calc velocity
          if (showVelocity && ppoint != null) {

            // velocity
            let vx = (p.x - ppoint.x) / inctime
            let vy = (p.y - ppoint.y) / inctime
            let velocity = new Vector(vx, vy).scaled(1/1000) // not sure how to get right scaling here
            drawVelocity(ctx, velocity, { color: color })

            // calc acceleration
            if (pvelocity != null) {
              let ax = (velocity.x - pvelocity.x) / inctime
              let ay = (velocity.y - pvelocity.y) / inctime
              let acceleration = new Vector(ax, ay).scaled(1/5) // not sure how to get right scaling here
              drawAcceleration(ctx, acceleration, { color: color })
            }

            // save
            pvelocity = velocity
          }

          // save
          ppoint = p
        }

        let res = null
        let maxtime = (s==su.s ? su.u : 1)
        if (method == 'naive') res = lerp4(p1, p2, p3, p4, maxtime, inctime, cb)
        else if (method == 'optim') res = lerp4_optim(p1, p2, p3, p4, maxtime, inctime, cb)
        else if (method == 'polynomial') res = polynomial(p1, p2, p3, p4, maxtime, inctime, cb)

        // draw intermediate points for current segment
        if (res != null && s == su.s && showIntermediate && !isLastFrame(time)) {
          joinIntermediatePoints(ctx, p2, p3, { color: color })
          for (let i=0; i<2; i++) {
            for (let j=0; j<res[i].length; j++) {
              drawIntermediatePoint(ctx, res[i][j])
              if (j != res[i].length-1) {
                joinIntermediatePoints(ctx, res[i][j], res[i][j+1])
              }
            }
          }
        }
      }

    }

  }

}
