
const HITTEST_SENSITIVITY = 10
const BUTTON_PADDING = 8
const BUTTON_HEIGHT = 18
const BUTTON_FONT = '12pt sans-serif'

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

class Button_Deprecated {
  constructor(x,y, title, cb, options) {
    this.x = x
    this.y = y
    this.title = title
    this.font = options?.font || BUTTON_FONT
    this.cb = cb
  }

  rect(ctx) {
    ctx.font = this.font
    let size = ctx.measureText(this.title)
    size.height = BUTTON_HEIGHT
    this.rc = {
      left: this.x - size.width / 2 - BUTTON_PADDING,
      top: this.y - size.height / 2 - BUTTON_PADDING,
      right: this.x + size.width / 2 + BUTTON_PADDING,
      bottom: this.y + size.height / 2 + BUTTON_PADDING,
      width: size.width + BUTTON_PADDING * 2,
      height: size.height + BUTTON_PADDING * 2
    }
    return this.rc
  }

  hittest(e) {
    let rc = this.rc
    return e.clientX >= rc.left && e.clientX <= rc.right && e.clientY >= rc.top && e.clientY <= rc.bottom
  }

  click(e) {
    if (this.hittest(e)) {
      this.cb()
    }
  }
  
  draw(ctx, options) {

    // frame
    let rect = this.rect(ctx)
    ctx.strokeStyle = options?.color || 'white'
    ctx.lineWidth = options?.width || 1
    ctx.strokeRect(rect.left, rect.top, rect.width, rect.height)
  
    // text
    ctx.font = this.font
    ctx.fillStyle = options?.color || 'white'
    ctx.fillText(this.title, rect.left + BUTTON_PADDING, rect.top + rect.height / 2 + BUTTON_PADDING/2)
  }

}

