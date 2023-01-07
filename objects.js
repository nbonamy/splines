
const HITTEST_SENSITIVITY = 10
const BUTTON_PADDING = 8
const BUTTON_HEIGHT = 18
const BUTTON_FONT = '12pt sans-serif'

class Point {
  constructor(x,y) {
    this.x = x
    this.y = y
  }
  
  hittest(e) {
    let d = dist(new Point(e.clientX, e.clientY), this)
    return d < HITTEST_SENSITIVITY
  }
  
  move(e) {
    this.x = e.clientX
    this.y = e.clientY
  }

}

class Button {
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

  click() {
    this.cb()
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

