const MEGABYTE_DECIMAL_CONSTANT = 1000
const MEGABYTE_BINARY_CONSTANT = 1024

const convertByteToCapacityUnit = (bytes: number, isBinary?: boolean) => {
  const constant = isBinary
    ? MEGABYTE_BINARY_CONSTANT
    : MEGABYTE_DECIMAL_CONSTANT
  const tera = bytes / (constant * constant * constant * constant)
  if (tera >= 1) return tera.toFixed(2) + ' TB'
  const giga = bytes / (constant * constant * constant)
  if (giga >= 1) return giga.toFixed(2) + ' GB'
  const mega = bytes / (constant * constant)
  if (mega >= 1) return mega.toFixed(2) + ' MB'
  const kilo = bytes / constant
  return kilo.toFixed(2) + ' KB'
}
export { convertByteToCapacityUnit }
