
class ControlPoint {
  constructor(p, v1, v2) {
    this.p = p
    this.v1 = v1
    this.v2 = v2
    this.sym = false
  }
  endpoint1() {
    return this.v1.endpoint(this.p)
  }
  endpoint2() {
    return this.v2.endpoint(this.p)
  }
  draw(ctx, first, last, color) {
    drawControlPoint(ctx, this.p, { color: color, filled: this.sym })
    if (!first) drawControlPoint(ctx, this.endpoint1(), { color: color, radius: 3 })
    if (!last) drawControlPoint(ctx, this.endpoint2(), { color: color, radius: 3 })
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

  const colors = [ 'blue', 'rgb(170, 255, 0)', 'red', 'yellow', 'pink' ]

  let points = [
    new ControlPoint(
      new Point(200, 200),
      new Vector(0, 0),
      new Vector(0, 100)
    ),
    new ControlPoint(
      new Point(500, 500),
      new Vector(0, -100),
      new Vector(50, 100)
    ),
    new ControlPoint(
      new Point(800, 300),
      new Vector(-100, -100),
      new Vector(0, 30)
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
        points[i].draw(ctx, i==0, i==points.length-1, colors[i%colors.length])

      }

      // lerp
      let su = segmentAndTime(time, points.length-1)
      for (let s=0; s <= su.s; s++) {
        if (s == points.length - 1) continue
        let p1 = points[s].p
        let p2 = points[s].endpoint2()
        let p3 = points[s+1].endpoint1()
        let p4 = points[s+1].p
        for (let u=0; u <= (s==su.s ? su.u : 1); u += ANIMATION_STEP) {
          p5 = lerpPoints(p1, p2, u)
          p6 = lerpPoints(p2, p3, u)
          p7 = lerpPoints(p3, p4, u)
          p8 = lerpPoints(p5, p6, u)
          p9 = lerpPoints(p6, p7, u)
          p = lerpPoints(p8, p9, u)
          drawPoint(ctx, p, { color: colors[s%colors.length] })
        }

        // draw intermediate points
        if (s == su.s && showIntermediate && !isLastFrame(time)) {
          joinPoints(ctx, p2, p3, { color: colors[s%colors.length], width: 0.5 })
          joinPoints(ctx, p5, p6, { color: 'cyan', width: 0.5 })
          joinPoints(ctx, p6, p7, { color: 'cyan', width: 0.5 })
          joinPoints(ctx, p8, p9, { color: 'green', width: 0.5 })
          drawControlPoint(ctx, p5, { color: 'cyan', radius: 2 })
          drawControlPoint(ctx, p6, { color: 'cyan', radius: 2 })
          drawControlPoint(ctx, p7, { color: 'cyan', radius: 2 })
          drawControlPoint(ctx, p8, { color: 'green', radius: 2 })
          drawControlPoint(ctx, p9, { color: 'green', radius: 2 })
          drawControlPoint(ctx, p, { color: colors[s%colors.length] })
        }

      }

    }

  }

}
