
function bezier4() {

  const P1 = new Point(500,500)
  const P2 = new Point(750,250)
  const P3 = new Point(1000,400)
  const P4 = new Point(875, 600)

  return {

    objects: [ P1, P2, P3, P4 ],

    draw: function(ctx, time) {

      // draw our point
      drawControlPoint(ctx, P1)
      drawControlPoint(ctx, P2)
      drawControlPoint(ctx, P3)
      drawControlPoint(ctx, P4)
      joinControlPoints(ctx, P1, P2)
      joinControlPoints(ctx, P2, P3)
      joinControlPoints(ctx, P3, P4)

      // now lerp
      for (let t = 0; t <= time; t += ANIMATION_STEP) {
        p3 = lerpPoints(P1, P2, t)
        p4 = lerpPoints(P2, P3, t)
        p5 = lerpPoints(P3, P4, t)
        p6 = lerpPoints(p3, p4, t)
        p7 = lerpPoints(p4, p5, t)
        p = lerpPoints(p6, p7, t)
        drawPoint(ctx, p, { color: 'red', radius: 2 })
      }

      // draw intermediate points
      if (!isLastFrame(time)) {
        joinPoints(ctx, p3, p4, { color: 'cyan' })
        joinPoints(ctx, p4, p5, { color: 'cyan' })
        joinPoints(ctx, p6, p7, { color: 'green' })
        drawControlPoint(ctx, p3, { color: 'cyan' })
        drawControlPoint(ctx, p4, { color: 'cyan' })
        drawControlPoint(ctx, p5, { color: 'cyan' })
        drawControlPoint(ctx, p6, { color: 'cyan' })
        drawControlPoint(ctx, p7, { color: 'green' })
        drawControlPoint(ctx, p, { color: 'red' })
      }

    }

  }

}
