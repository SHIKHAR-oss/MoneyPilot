import mongoose from 'mongoose';

/**
 * Validates if a string is a valid 24-character hexadecimal MongoDB ObjectId
 * @param {string} id - The ID to test
 * @returns {boolean}
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validates if a value is a finite, safe number
 * @param {*} val - Value to check
 * @returns {boolean}
 */
export const isSafeNumber = (val) => {
  if (val === null || val === undefined || val === '') return false;
  const num = Number(val);
  return !isNaN(num) && isFinite(num) && Math.abs(num) <= Number.MAX_SAFE_INTEGER;
};

/**
 * Validates if a value is a non-negative finite number
 * @param {*} val - Value to check
 * @returns {boolean}
 */
export const isNonNegativeNumber = (val) => {
  return isSafeNumber(val) && Number(val) >= 0;
};

/**
 * Validates if a value is a strictly positive finite number (> 0)
 * @param {*} val - Value to check
 * @returns {boolean}
 */
export const isPositiveNumber = (val) => {
  return isSafeNumber(val) && Number(val) > 0;
};

export default {
  isValidObjectId,
  isSafeNumber,
  isNonNegativeNumber,
  isPositiveNumber
};
