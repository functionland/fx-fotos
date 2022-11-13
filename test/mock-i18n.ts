jest.mock('i18n-js', () => ({
  t: key => `${key}.test`,
}))
