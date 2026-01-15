export const logger = {
  info: (subsystem, message) => console.log(`[INFO] ${new Date().toISOString()}: [${subsystem}] ${message}`),
  error: (subsystem, message) => console.error(`[ERROR] ${new Date().toISOString()}: [${subsystem}] ${message}`),
  warn: (subsystem, message) => console.warn(`[WARN] ${new Date().toISOString()}: [${subsystem}] ${message}`)
};