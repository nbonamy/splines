
function bezier3() {

  const P1 = new Point(750,500)
  const P2 = new Point(1000,250)
  const P3 = new Point(1250,400)

  return {

    objects: [ P1, P2, P3 ],
    
    draw: function(ctx, time) {

      // draw our point
      drawControlPoint(ctx, P1)
      drawControlPoint(ctx, P2)
      drawControlPoint(ctx, P3)
      joinControlPoints(ctx, P1, P2)
      joinControlPoints(ctx, P2, P3)

      // now draw animated
      for (let t = 0; t <= time; t += ANIMATION_STEP) {
        p3 = lerpPoints(P1, P2, t)
        p4 = lerpPoints(P2, P3, t)
        p = lerpPoints(p3, p4, t)
        drawPoint(ctx, p, { color: 'red', radius: 2 })
      }
      if (!isLastFrame(time)) {
        joinPoints(ctx, p3, p4, { color: 'cyan' })
        drawControlPoint(ctx, p3, { color: 'cyan' })
        drawControlPoint(ctx, p4, { color: 'cyan' })
        drawControlPoint(ctx, p, { color: 'red' })
      }

    }

  }

}
