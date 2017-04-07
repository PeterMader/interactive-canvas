const Loop = class {

  constructor (initialCallbackFunction, immediateStart) {
    this.callbackFunction = this.defaultCallbackFunction
    this.frame = -1
    this.frameCount = 0
    this.runTime = 0
    this.timeOfLastFrame = 0
    this.running = false

    this.boundWrapperFunction = this.tick.bind(this)

    this.setCallbackFunction(initialCallbackFunction)
    if (immediateStart) {
      this.start()
    }
  }

  getFramesPerSecond () {
    return this.runTime / this.frameCount
  }

  getFrameCount () {
    return this.frameCount
  }

  getRunTime () {
    return this.runTime
  }

  isRunning () {
    return this.running
  }

  setCallbackFunction (callbackFunction) {
    if (typeof callbackFunction === 'function') {
      this.callbackFunction = callbackFunction
    }
    return this
  }

  tick () {
    const now = Date.now()
    const deltaTime = now - this.timeOfLastFrame
    this.runTime += deltaTime
    this.callbackFunction(deltaTime)
    this.frameCount += 1
    this.frame = window.requestAnimationFrame(this.boundWrapperFunction)
  }

  defaultCallbackFunction (deltaTime) {}

  start () {
    this.startTime = this.timeOfLastFrame = Date.now()
    this.frame = window.requestAnimationFrame(this.boundWrapperFunction)
    this.running = true
  }

  pause () {
    window.cancelAnimationFrame(this.frame)
    this.frame = 0
    this.running = false
  }

}
