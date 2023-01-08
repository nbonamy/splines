
const HANDLE_SIZE = 3

let method = window.localStorage.bezierSplineMethod||'polynomial'
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
  
  hittest(hit, e) {
    this.active = null
    this.moved = false
    if (!e.shiftKey && this.p.hittest(hit)) this.active = this.p
    else if (this.endpoint1().hittest(hit)) this.active = this.v1
    else if (this.endpoint2().hittest(hit)) this.active = this.v2
    return this.active
  }
  
  set(other) {
    if (this.active == this.p) {
      if (this.p.set(other)) {
        this.moved = true
      }
    } else {
      this.active.set(new Vector(this.p, other))
      if (this.sym) {
        if (this.active == this.v1) this.v2 = this.v1.opposite()
        else this.v1 = this.v2.opposite()
      }
    }
  }

  click(e) {
    if (this.active == this.p && this.moved == false) {
      this.sym = !this.sym
      if (this.sym) {
        this.v2 = this.v1.opposite()
      }
    }
  }
}

function lerp4(p1, p2, p3, p4, maxtime, inctime, yield) {

  for (let u=0; u <= maxtime; u += inctime) {
    p5 = lerpPoints(p1, p2, u)
    p6 = lerpPoints(p2, p3, u)
    p7 = lerpPoints(p3, p4, u)
    p8 = lerpPoints(p5, p6, u)
    p9 = lerpPoints(p6, p7, u)
    p = lerpPoints(p8, p9, u)
    yield(u, p)
  }

  return [
    [ p5, p6, p7 ],
    [ p8, p9 ],
  ]

}

function lerp4_optim(p1, p2, p3, p4, maxtime, inctime, yield) {

  let p5 = p1.clone()
  let p6 = p2.clone()
  let p7 = p3.clone()
  let v1 = new Vector(p1, p2).scaled(inctime)
  let v2 = new Vector(p2, p3).scaled(inctime)
  let v3 = new Vector(p3, p4).scaled(inctime)

  for (let u=0; u <= maxtime; u += inctime) {
    if (u != 0) {
      // move points with their vector
      p5 = v1.endpoint(p5)
      p6 = v2.endpoint(p6)
      p7 = v3.endpoint(p7)
    }
    p8 = lerpPoints(p5, p6, u)
    p9 = lerpPoints(p6, p7, u)
    p = lerpPoints(p8, p9, u)
    yield(u, p)
  }

  return [
    [ p5, p6, p7 ],
    [ p8, p9 ],
  ]

}

// https://youtu.be/jvPPXbo87ds?t=433
function polynomial(p1, p2, p3, p4, maxtime, inctime, yield) {

  let v0 = new Vector(p1)
  let v1 = new Vector(p1).scale(-3).add(new Vector(p2).scale(3))
  let v2 = new Vector(p1).scale(3).add(new Vector(p2).scale(-6)).add(new Vector(p3).scale(3))
  let v3 = new Vector(p1).scale(-1).add(new Vector(p2).scale(3)).add(new Vector(p3).scale(-3)).add(new Vector(p4))
    
  for (let u=0; u <= maxtime; u += inctime) {
    let u2 = u * u
    let u3 = u2 * u
    let p = v0.clone().add(v1.scaled(u)).add(v2.scaled(u2)).add(v3.scaled(u3))
    yield(u, p)
  }

  return null

}

function bezierspline() {

  let points = [
    new ControlPoint(
      new Point(500, 300),
      new Vector(250, 75),
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
        callback: (m) => {
          method = m
          window.localStorage.bezierSplineMethod = method
        }
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
      //   maxdist = Math.max(maxdist, p1.distance(p2))
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

        // the callback everytime a point will be calculated
        let cb = (u, p) => {

          // 1st draw it
          pColor = intermediateColor(u, s, points.length)
          drawCurvePoint(ctx, p, { color: pColor })

          // calc velocity
          if (showVelocity && ppoint != null) {

            // velocity
            let velocity = new Vector(ppoint, p).scaled(1/inctime)
            drawVelocity(ctx, velocity.scaled(1/1000), { color: color })  // not sure how to get right scaling here

            // calc acceleration
            if (pvelocity != null) {
              let acceleration = new Vector(pvelocity, velocity).scaled(1/inctime)
              drawAcceleration(ctx, acceleration.scaled(1/4000), { color: color }) // not sure how to get right scaling here
            }

            // save
            pvelocity = velocity
          }

          // save
          ppoint = p
        }

        // now calculate
        let res = null
        let maxtime = (s==su.s ? su.u : 1)
        if (method == 'naive') res = lerp4(p1, p2, p3, p4, maxtime, inctime, cb)
        else if (method == 'optim') res = lerp4_optim(p1, p2, p3, p4, maxtime, inctime, cb)
        else if (method == 'polynomial') res = polynomial(p1, p2, p3, p4, maxtime, inctime, cb)

        // draw intermediate points for current segment
        if (res != null && s == su.s && showIntermediate && !isLastFrame(time)) {
          joinIntermediatePoints(ctx, p2, p3, { color: color })
          for (let i=0; i<res.length; i++) {
            for (let j=0; j<res[i].length; j++) {
              drawIntermediatePoint(ctx, res[i][j])
              if (j != res[i].length-1) {
                joinIntermediatePoints(ctx, res[i][j], res[i][j+1])
              }
            }
          }
        }

        // show velocity
        if (showVelocity && ppoint != null && pvelocity != null && s == su.s) {
          let scaling = 50/1000 // not sure how to get right scaling here
          drawVelocityVector(ctx, ppoint, pvelocity.scaled(scaling))
          drawVelocityVector(ctx, ppoint, pvelocity.normal().scaled(scaling))
        }
      }

    }

  }

}
