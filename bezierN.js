
function bezierN() {

  const colors = [ 'cyan', 'green', 'yellow', 'pink', 'orange', 'lime', 'indigo' ]

  let points = [
    new Point(500,500),
    new Point(750,250)
  ]

  const add = new Button(window.innerWidth / 2, 32, 'Add a control point', () => {
    points.push(new Point(window.innerWidth/2, window.innerHeight/2))    
  })

  const reset = new Button(window.innerWidth / 2, 80, 'Reset', () => {
    points = [
      new Point(500,500),
      new Point(750,250)
    ]
  })

  return {

    objects: () => [ add, reset, ...points ],

    draw: function(ctx, time) {

      // draw our buttons
      add.draw(ctx)
      reset.draw(ctx)

      // draw our points and join them
      for (let point of points) {
        drawControlPoint(ctx, point)
      }
      for (let i=0; i<points.length-1; i++) {
        joinControlPoints(ctx, points[i], points[i+1])
      }

      // now lerp
      let toDraw = []
      for (let t = 0; t <= time; t += ANIMATION_STEP) {
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
        drawPoint(ctx, toLerp[0], { color: 'red', radius: 2 })
      }

      // draw intermediate points
      if (showIntermediate && !isLastFrame(time)) {
        for (let i=0; i<toDraw.length; i++) {
          let color = colors[i % colors.length]
          for (let j=0; j<toDraw[i].length; j++) {
            drawControlPoint(ctx, toDraw[i][j], { color: toDraw[i].length == 1 ? 'red' : color })
            if (j < toDraw[i].length - 1) {
              joinPoints(ctx, toDraw[i][j], toDraw[i][j+1], { color: color })
            }
          }
        }
      }

    }

  }

}
