import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  staticDirs: [
    {
      from: '../src/assets',
      to: 'assets',
    },
  ],
  typescript: {
    check: false,
  },
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@shared': require('path').resolve(
          __dirname,
          '../../../projects/shared'
        ),
      };
    }
    return config;
  },
};
export default config;
