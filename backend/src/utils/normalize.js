export function emptyToNull(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return value;
}

export function pickDefined(source, allowedFields) {
  return allowedFields.reduce((result, field) => {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      result[field] = emptyToNull(source[field]);
    }

    return result;
  }, {});
}
