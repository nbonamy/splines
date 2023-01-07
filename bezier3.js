
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

      // now lerp
      for (let t = 0; t <= time; t += CALCULATION_STEP) {
        p3 = lerpPoints(P1, P2, t)
        p4 = lerpPoints(P2, P3, t)
        p = lerpPoints(p3, p4, t)
        drawCurvePoint(ctx, p)
      }

      // draw intermediate points
      if (showIntermediate && !isLastFrame(time)) {
        joinIntermediatePoints(ctx, p3, p4, { color: objectColor(1, 3) })
        drawIntermediatePoint(ctx, p3, { color: objectColor(1, 3) })
        drawIntermediatePoint(ctx, p4, { color: objectColor(1, 3) })
        drawIntermediatePoint(ctx, p)
      }

    }

  }

}
