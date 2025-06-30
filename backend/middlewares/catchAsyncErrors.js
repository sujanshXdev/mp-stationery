/**
 * Middleware to catch asynchronous errors in controller functions.
 * @param {Function} controllerFunction - The asynchronous controller function.
 * @returns {Function} - A function that handles errors in the controller function.
 */
export default (controllerFunction) => (req, res, next) =>
  Promise.resolve(controllerFunction(req, res, next)).catch(next);
