
class TimeManager {

  constructor(totalTime, points, mode) {

    if (mode == null || mode == 'linear') {

      this.segmentTimes = []
      for (let i=0; i<points.length-1; i++) {
        this.segmentTimes[i] = totalTime / (points.length-1)
      }

    } else if (mode == 'proportional') {

      // calc distance
      let distances = []
      let totalDistance = 0
      for (let i=0; i<points.length-1; i++) {
        let p = points[i]
        let d = p.distance(points[i+1])
        totalDistance += d
        distances[i] = d
      }

      // now allocate time proportionally
      this.segmentTimes = []
      for (let i=0; i<points.length-1; i++) {
        this.segmentTimes[i] = totalTime * distances[i] / totalDistance
      }

    }

  }

  getSegmentIndexAndLocalTime(globalTime) {
    for (let s=0; s<this.segmentTimes.length; s++) {
      let segmentTime = this.segmentTimes[s]
      if (globalTime <= segmentTime) {
        return { s: s, u: globalTime / segmentTime }
      } else {
        globalTime -= segmentTime
      }
    }
    return { s: this.segmentTimes.length, u: 1 }

  }

}