
const HITTEST_SENSITIVITY = 10

class Point {
  
  constructor(arg1, arg2) {
    if (arg1 instanceof Point) {
      this.x = arg1.x
      this.y = arg1.y
    } else {
      this.x = arg1
      this.y = arg2
    }
  }

  clone() {
    return new Point(this.x, this.y)
  }

  hittest(hit) {
    let d = this.distance(hit)
    return d < HITTEST_SENSITIVITY
  }

  distance(other) {
    return new Vector(this, other).norm()
  }
  
  set(other) {
    if (other.x != this.x || other.y != this.y) {
      this.x = other.x
      this.y = other.y
      return true
    } else {
      return false
    }
  }

  movedby(vector) {
    return new Point(
      this.x + vector.x,
      this.y + vector.y
    )
  }

}

class Vector extends Point {

  constructor(arg1, arg2) {
    if (arg1 instanceof Point && arg2 instanceof Point) {
      super(arg2.x - arg1.x, arg2.y - arg1.y)
    } else if (arg1 instanceof Point || arg1 instanceof Vector) {
      super(arg1)
    } else {
      super(arg1, arg2)
    }
  }

  clone() {
    return new Vector(this.x, this.y)
  }

  set(other) {
    this.x = other.x
    this.y = other.y
  }

  norm() {
    return Math.sqrt(this.x*this.x + this.y*this.y)
  }

  scale(s) {
    this.x *= s
    this.y *= s
    return this
  }

  add(other) {
    this.x += other.x
    this.y += other.y
    return this
  }
  
  scaled(scale) {
    return new Vector(this.x * scale, this.y * scale)
  }
  
  normalized() {
    let n = this.norm()
    if (n < 1e-6) n = 1
    return this.scaled(1/n)
  }

  opposite() {
    return new Vector(-this.x, -this.y)
  }

  normal() {
    return new Vector(-this.y, this.x)
  }

  dot(other) {
    return this.x * other.x + this.y + other.y
  }

  angle() {
    return Math.atan2(this.y, this.x)
  }
}

class Rect {
  constructor(x, y, w, h) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }

  topleft() {
    return new Point(this.x, this.y)
  }
  
  bottomright() {
    return new Point(this.x + this.w, this.y + this.h)
  }

  contains(p) {
    return p.x >= this.x && p.x <= (this.x + this.w) && p.y >= this.y && p.y <= (this.y + this.h)
  }

}
