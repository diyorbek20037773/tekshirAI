// Lightweight console logger for lesson3d module
export function createLogger(module) {
  const pre = `[${module}]`
  return {
    info:  (...a) => console.log(pre, ...a),
    warn:  (...a) => console.warn(pre, ...a),
    error: (...a) => console.error(pre, ...a),
    debug: (...a) => console.debug(pre, ...a),
  }
}
