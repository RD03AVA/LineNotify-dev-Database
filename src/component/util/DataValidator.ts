// --------------------------------------------------------
// 不同數據類型的類型守衛
// --------------------------------------------------------
export const isBoolean = (bool: unknown): bool is boolean => typeof bool === 'boolean';

export const isNumber = (num: unknown): num is number =>
  typeof num === 'number' && !isNaN(num);

export const isString = (str: unknown): str is string => typeof str === 'string';

export const isArray = (arr: unknown): arr is unknown[] => Array.isArray(arr);

export const isPlainObject = (obj: unknown): obj is Record<string, unknown> =>
  obj !== null && typeof obj === 'object' && obj.constructor === Object;

export const isEmptyObject = (obj: unknown): boolean =>
  isPlainObject(obj) && Object.keys(obj).length === 0;

// --------------------------------------------------------
// 特定類型數組的類型守衛
// --------------------------------------------------------
export const isArrayOfType = <T>(
  arr: unknown,
  typeGuard: (item: unknown) => item is T,
): arr is T[] => isArray(arr) && arr.length > 0 && arr.every(typeGuard);

export const isArrayOfObjects = (arr: unknown): arr is Record<string, unknown>[] =>
  isArrayOfType(arr, isPlainObject);

export const isArrayOfArrays = (arr: unknown): arr is unknown[][] =>
  isArrayOfType(arr, isArray);

export const isArrayOfNumbers = (arr: unknown): arr is number[] =>
  isArrayOfType(arr, isNumber);

export const isArrayOfBooleans = (arr: unknown): arr is boolean[] =>
  isArrayOfType(arr, isBoolean);

export const isArrayOfStrings = (arr: unknown): arr is string[] =>
  isArrayOfType(arr, isString);

// --------------------------------------------------------
// 特定字段類型的驗證函數
// --------------------------------------------------------
const PHONE_REGEX = /^09[0-9]{8}$/;

export const validatePhone = (phone: string | undefined): boolean =>
  phone ? PHONE_REGEX.test(phone) : true;

// --------------------------------------------------------
// 請求格式的驗證函數
// --------------------------------------------------------
export const validateRequestFormat = (request: unknown): void => {
  if (!isPlainObject(request)) {
    throw new Error('Invalid request format: Request should be a non-null object');
  }

  if (!Object.values(request).every(isArrayOfObjects)) {
    throw new Error(
      'Invalid request format: Each table should have an array of objects',
    );
  }
};
