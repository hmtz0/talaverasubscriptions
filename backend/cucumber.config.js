export default {
  default: {
    requireModule: ['tsx'],
    require: ['tests/features/step_definitions/**/*.ts'],
    paths: ['tests/features/**/*.feature'],
    format: ['progress', 'html:cucumber-report.html'],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
  },
};
