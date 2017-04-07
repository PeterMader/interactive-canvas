const InteractiveCanvas = class {

  constructor (canvas) {
    if (!(canvas instanceof HTMLCanvasElement)) {
      return
    }

    this.canvas = canvas
    this.ctx = canvas.getContext('2d')

    this.shouldRender = true
    this.alwaysRender = false

    this.zoomFactor = 2
    this.minScale = -1
    this.maxScale = -1

    this.scale = 1
    this.translationX = 0
    this.translationY = 0

    this.renderCount = 0

    this._mouseDown = false
    this._positions = []

    this.loop = new Loop(this._tick.bind(this), true)
    this.addEventListeners()
  }

  _tick (deltaTime) {
    if (this.shouldRender) {
      this.shouldRender = false
      this.onRender(deltaTime)
      this.renderCount += 1
    }
    if (this.alwaysRender) {
      this.shouldRender = true
    }
  }

  getRenderCount () {
    return this.renderCount
  }

  getZoomFactor () {
    return this.zoomFactor
  }

  setZoomFactor (factor) {
    if (typeof factor === 'number') {
      this.zoomFactor = factor
    }
    return this
  }

  getScale () {
    return this.scale
  }

  setScale (scale) {
    if (typeof scale === 'number') {
      this.scale = scale
    }
    return this
  }

  scale (scale) {
    if (typeof scale === 'number') {
      this.scale *= scale
    }
    return this
  }

  getTranslationX () {
    return this.translationX
  }

  getTranslationY () {
    return this.translationY
  }

  setTranslationX (translation) {
    if (typeof translation === 'number') {
      this.translationX = translation
    }
    return this
  }

  setTranslationY (translation) {
    if (typeof translation === 'number') {
      this.translationY = translation
    }
    return this
  }

  translateX (translation) {
    if (typeof translation === 'number') {
      this.translationX += translation
    }
    return this
  }

  translateY (translation) {
    if (typeof translation === 'number') {
      this.translationY += translation
    }
    return this
  }

  getMinScale () {
    return this.minScale
  }

  setMinScale (minScale) {
    if (typeof minScale === 'number') {
      this.minScale = minScale
    }
    return this
  }

  getMaxScale () {
    return this.maxScale
  }

  setMinScale (maxScale) {
    if (typeof maxScale === 'number') {
      this.maxScale = maxScale
    }
    return this
  }

  getAlwaysRender () {
    return this.alwaysRender
  }

  setAlwaysRender (alwaysRender) {
    this.alwaysRender = !!alwaysRender
    return this
  }

  scaleToPosition (scale, x, y) {
    const {minScale, maxScale} = this

    const oldScale = this.scale

    this.scale *= scale
    if (minScale > 0 && this.scale < minScale) {
      this.scale = minScale
    }
    if (maxScale > 0 && this.scale > maxScale) {
      this.scale = maxScale
    }

    this.translationX = x - this.scale * (x - this.translationX) / oldScale
    this.translationY = y - this.scale * (y - this.translationY) / oldScale
  }

  onMouseWheel (e) {
    const {canvas, zoomFactor} = this
    const factor = e.deltaY > 0 ? (1 / zoomFactor) : zoomFactor
    const x = e.clientX - canvas.offsetLeft - this.canvas.width / 2
    const y = e.clientY - canvas.offsetTop - this.canvas.height / 2

    this.scaleToPosition(factor, x, y)
    this.shouldRender = true
  }

  onMouseDown (e) {
    this._mouseDown = true
    this._positions = [{
      x: e.clientX,
      y: e.clientY
    }]
  }

  onMouseMove (e) {
    if (this._mouseDown) {
      this.translationX += e.clientX - this._positions[0].x
      this.translationY += e.clientY - this._positions[0].y
      this._positions[0].x = e.clientX
      this._positions[0].y = e.clientY
      this.shouldRender = true
    }
  }

  onMouseUp (e) {
    this._mouseDown = false
    this._positions = []
  }

  onTouchStart (e) {
    const {targetTouches} = e
    this._mouseDown = true
    if (targetTouches.length === 1) {
      this._positions = [{
        x: targetTouches[0].clientX,
        y: targetTouches[1].clientY
      }]
    } else {
      let index
      for (index in targetTouches) {
        this._positions.push({
          x: targetTouches[index].clientX,
          y: targetTouches[index].clientY
        })
      }
    }
  }

  onTouchMove (e) {
    if (this._mouseDown) {
      if (this._positions.length === 1) {
        // translate
        this.translationX += this._positions[0].x + e.clientX
        this.translationY += this._positions[0].y + e.clientY
        this._positions[0].x = e.clientX
        this._positions[0].y = e.clientY
      } else {
        // scale
        let [[x1, y1], [x2, y2]] = this._positions
        let deltaX = x2 - x1
        let deltaY = y2 - y1
        const oldDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        let index
        for (index in targetTouches) {
          this._positions[index].x = targetTouches[index].clientX
          this._positions[index].y = targetTouches[index].clientY
        }

        [[x1, y1], [x2, y2]] = this._positions
        deltaX = x2 - x1
        deltaY = y2 - y1
        const newDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

        this.scaleToPosition(newDistance / oldDistance, x1 + deltaX / 2, y1 + deltaY / 2)
      }
      this.shouldRender = true
    }
  }

  onTouchEnd (e) {
    const {targetTouches} = e
    if (targetTouches.length === 0) {
      this._mouseDown = false
      this._positions = []
    } else {
      let index
      for (index in targetTouches) {
        this._positions.push({
          x: targetTouches[index].clientX,
          y: targetTouches[index].clientY
        })
      }
    }
  }

  onRender (deltaTime) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  addEventListeners () {
    const {canvas} = this
    const options = {
      passive: true
    }

    canvas.addEventListener('wheel', this.onMouseWheel.bind(this), options)
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this), options)
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this), options)
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this), options)
    canvas.addEventListener('mouseout', this.onMouseUp.bind(this), options)
    canvas.addEventListener('touchstart', this.onTouchStart.bind(this), options)
    canvas.addEventListener('touchmove', this.onTouchMove.bind(this), options)
    canvas.addEventListener('touchend', this.onTouchEnd.bind(this), options)
    canvas.addEventListener('touchcancel', this.onTouchEnd.bind(this), options)
  }

  getTransformedX (x) {
    return x * this.scale + this.translationX + this.canvas.width / 2
  }

  getTransformedY (y) {
    return y * this.scale + this.translationY + this.canvas.height / 2
  }

  getTransformedLength (length) {
    return length * this.scale
  }

  getTransformedPosition (x, y) {
    return [x * this.scale + this.translationX + this.canvas.width / 2, y * this.scale + this.translationY + this.canvas.height / 2]
  }

}
