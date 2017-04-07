const MyCanvas = class extends InteractiveCanvas {

  constructor () {
    super(document.getElementById('canvas'))
  }

  onRender (deltaTime) {
    super.onRender(deltaTime)

    const theta = this.getRenderCount() * .01
    const sin = Math.sin(theta)
    const cos = Math.cos(theta)

    const {ctx} = this

    // calculate the coordinates of the blue square
    const x = this.getTransformedX(100)
    const y = this.getTransformedY(150)
    const size = this.getTransformedLength(40)

    ctx.fillStyle = 'blue'
    // draw a blue square
    ctx.fillRect(x, y, size, size)

    ctx.fillStyle = 'red'
    // draw a red triangle. One of the vertices is moving periodically horizontally
    ctx.beginPath()
    ctx.moveTo.apply(ctx, this.getTransformedPosition(30 * sin, 0))
    ctx.lineTo.apply(ctx, this.getTransformedPosition(0, 100))
    ctx.lineTo.apply(ctx, this.getTransformedPosition(100, 50))
    ctx.fill()

    ctx.fillStyle = 'green'
    // draw a green rectangle with fixed size (10x10) orbiting the center (0, 0)
    ctx.fillRect(this.getTransformedX(100 * cos), this.getTransformedY(100 * sin), 10, 10)
  }

  togglePause () {
    this.setAlwaysRender(!this.getAlwaysRender())
  }

}

document.addEventListener('DOMContentLoaded', () => {

  const canvas = new MyCanvas()
  canvas.setZoomFactor(1.2).setAlwaysRender(true)

  document.addEventListener('keyup', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      canvas.togglePause()
    }
  })

  Array.from(document.querySelectorAll('.key')).forEach((key) => {
    key.addEventListener('click', canvas.togglePause.bind(canvas))
  })

})
