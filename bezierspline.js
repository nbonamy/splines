
const HANDLE_SIZE = 3

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
    drawControlPoint(ctx, this.p, { color: color, filled: this.sym })
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
      true
    ),
    new ControlPoint(
      new Point(900, 200),
      new Vector(-150, 0),
      new Vector(150, 0),
      true
    ),
    new ControlPoint(
      new Point(1200, 550),
      new Vector(-300, 150),
      new Vector(0, 0)
    ),
  ]

  const add = new Button(window.innerWidth / 2, 32, 'Add a control point', () => {
    points.push(new ControlPoint(
      new Point(window.innerWidth/2, window.innerHeight/2),
      new Vector(-100, -100),
      new Vector(100, 100)
    ))
  })

  const reset = new Button(window.innerWidth / 2, 80, 'Reset', () => {
    window.location.reload()
  })

  return {

    objects: () => [ add, reset, ...points ],

    draw: function(ctx, time) {

      // draw our buttons
      add.draw(ctx)
      reset.draw(ctx)

      // draw our points and join them
      for (let i=0; i<points.length; i++) {
        points[i].draw(ctx, i==0, i==points.length-1, objectColor(i, points.length))
      }

      // lerp
      let su = segmentAndTime(time, points.length-1)
      for (let s=0; s <= su.s; s++) {
        if (s == points.length - 1) continue
        
        let p1 = points[s].p
        let p2 = points[s].endpoint2()
        let p3 = points[s+1].endpoint1()
        let p4 = points[s+1].p
        let color = objectColor(s, points.length)
        
        for (let u=0; u <= (s==su.s ? su.u : 1); u += ANIMATION_STEP / (points.length-1)) {
          p5 = lerpPoints(p1, p2, u)
          p6 = lerpPoints(p2, p3, u)
          p7 = lerpPoints(p3, p4, u)
          p8 = lerpPoints(p5, p6, u)
          p9 = lerpPoints(p6, p7, u)
          p = lerpPoints(p8, p9, u)
          pColor = intermediateColor(u, s, points.length)
          drawCurvePoint(ctx, p, { color: pColor })
        }

        // draw intermediate points
        if (s == su.s && showIntermediate && !isLastFrame(time)) {
          joinIntermediatePoints(ctx, p2, p3, { color: color })
          joinIntermediatePoints(ctx, p5, p6, { color: 'cyan' })
          joinIntermediatePoints(ctx, p6, p7, { color: 'cyan' })
          joinIntermediatePoints(ctx, p8, p9, { color: 'green' })
          drawIntermediatePoint(ctx, p5, { color: 'cyan' })
          drawIntermediatePoint(ctx, p6, { color: 'cyan' })
          drawIntermediatePoint(ctx, p7, { color: 'cyan' })
          drawIntermediatePoint(ctx, p8, { color: 'green' })
          drawIntermediatePoint(ctx, p9, { color: 'green' })
          drawIntermediatePoint(ctx, p, { color: pColor })
        }

      }

    }

  }

}
