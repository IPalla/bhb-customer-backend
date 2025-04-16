export const serializeWithBigInt = (obj: any): string => {
  return JSON.stringify(obj, (key, value) =>
    typeof value === "bigint" ? value.toString() : value,
  );
};

export const removeUndefinedProperties = (obj: any): void => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === undefined) {
      delete obj[key];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      removeUndefinedProperties(obj[key]);
      // Check if object is empty (no keys) after removing undefined properties
      if (Object.keys(obj[key]).length === 0) {
        delete obj[key];
      }
    }
  });
};
