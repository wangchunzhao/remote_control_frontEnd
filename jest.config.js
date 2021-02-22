module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    // '**/*.{js,vue}',
    '**/src/**',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/public/**',
    '!**/src/api/**',
    '!**/src/assets/**',
    '!**/src/views/alarm/**',
    '!**/src/views/analysis/**',
    '!**/src/views/asset/**',
    '!**/src/views/backgroundConfig/**',
    '!**/src/views/energy/**',
    '!**/src/views/keep/**',
    '!**/src/views/layout/**',
    '!**/src/views/maintenanceManage/**',
    '!**/src/views/map/**',
    '!**/src/views/monitor/**',
    '!**/src/views/others/**',
    '!**/src/views/permission/**',
    '!**/src/views/personnelManage/**',
    '!**/src/views/plan/**',
    '!**/src/views/projectManage/**',
    '!**/src/views/redirect/**',
    '!**/src/views/repair/**',
    '!**/src/views/role/**',
    '!**/src/views/ScrollBar/**',
    '!**/src/views/statisticsAnalysis/**',
    '!**/src/views/terminalManage/**',
    '!**/src/views/user/**'
  ],
  moduleFileExtensions: ['js', 'jsx', 'json', 'vue'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub'
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/public/'
    // '/src/views/alarm',
    // '/src/views/analysis',
    // '/src/views/asset',
    // '/src/views/backgroundConfig',
    // '/src/views/energy',
    // '/src/views/keep',
    // '/src/views/layout',
    // '/src/views/maintenanceManage',
    // '/src/views/map',
    // '/src/views/monitor',
    // '/src/views/others',
    // '/src/views/permission',
    // '/src/views/personnelManage',
    // '/src/views/plan',
    // '/src/views/projectManage',
    // '/src/views/redirect',
    // '/src/views/repair',
    // '/src/views/role',
    // '/src/views/ScrollBar',
    // '/src/views/statisticsAnalysis',
    // '/src/views/terminalManage',
    // '/src/views/user '
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  snapshotSerializers: ['jest-serializer-vue'],
  testMatch: [
    '**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'
  ],
  testURL: 'http://localhost/',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ]
}
