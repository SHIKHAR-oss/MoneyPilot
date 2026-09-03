/**
 * Deterministic Mathematical Helpers
 * Guards against division-by-zero, floating-point drift, NaN, and Infinity
 */

/**
 * Rounds a number to a specific decimal precision safely
 * @param {number|string} num
 * @param {number} decimals
 * @returns {number}
 */
export const round = (num, decimals = 2) => {
  const parsed = Number(num);
  if (isNaN(parsed) || !isFinite(parsed)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((parsed + Number.EPSILON) * factor) / factor;
};

/**
 * Safely divides two numbers with a fallback if denominator is 0, NaN, or non-finite
 * @param {number} numerator
 * @param {number} denominator
 * @param {number} fallback
 * @returns {number}
 */
export const safeDivide = (numerator, denominator, fallback = 0) => {
  const num = Number(numerator);
  const den = Number(denominator);

  if (isNaN(num) || isNaN(den) || !isFinite(num) || !isFinite(den) || den === 0) {
    return fallback;
  }
  return num / den;
};

/**
 * Clamps a number between a minimum and maximum boundary
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const clamp = (val, min, max) => {
  const parsed = Number(val);
  if (isNaN(parsed) || !isFinite(parsed)) return min;
  return Math.min(Math.max(parsed, min), max);
};

/**
 * Validates and sanitizes a numeric value
 * @param {*} val
 * @param {number} fallback
 * @returns {number}
 */
export const sanitizeNumber = (val, fallback = 0) => {
  const parsed = Number(val);
  if (isNaN(parsed) || !isFinite(parsed)) return fallback;
  return parsed;
};

export default {
  round,
  safeDivide,
  clamp,
  sanitizeNumber
};
