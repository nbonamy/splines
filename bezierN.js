
function bezierN() {

  let points = [
    new Point(500,500),
    new Point(750,250)
  ]

  return {

    controls: [
      {
        type: 'button',
        label: 'Add a control point',
        callback: () => points.push(new Point(window.innerWidth/2, window.innerHeight/2))
      },
      {
        type: 'button',
        label: 'Reset',
        callback: () => points = [ new Point(500,500), new Point(750,250) ]
      },
    ],
    
    objects: () => points,

    draw: function(ctx, time) {

      // draw our points and join them
      if (showControlPoints) {
        for (let point of points) {
          drawControlPoint(ctx, point)
        }
        for (let i=0; i<points.length-1; i++) {
          joinControlPoints(ctx, points[i], points[i+1])
        }
      }

      // now lerp
      let toDraw = []
      for (let t = 0; t <= time; t += CALCULATION_STEP) {
        toDraw = []
        let toLerp = points
        while (toLerp.length > 1) {
          let newPoints = []
          for (let i=0; i<toLerp.length-1; i++) {
            newPoints.push(lerpPoints(toLerp[i], toLerp[i+1], t))
          }
          toLerp = newPoints
          toDraw.push(newPoints)
        }
        drawCurvePoint(ctx, toLerp[0])
      }

      // draw intermediate points
      if (showIntermediate && !isLastFrame(time)) {
        for (let i=0; i<toDraw.length; i++) {
          let color = objectColor(i, toDraw.length)
          for (let j=0; j<toDraw[i].length; j++) {
            drawIntermediatePoint(ctx, toDraw[i][j], { color: toDraw[i].length == 1 ? null : color })
            if (j < toDraw[i].length - 1) {
              joinIntermediatePoints(ctx, toDraw[i][j], toDraw[i][j+1], { color: color })
            }
          }
        }
      }

    }

  }

}
