import { setCompodocJson } from "@storybook/addon-docs/angular";
import type { Preview } from '@storybook/angular';
import docJson from "../documentation.json";
setCompodocJson(docJson);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    // Mock chrome API for extension stories
    mockAddonConfigs: {
      globalMockData: [
        {
          url: 'chrome://extension-api',
          method: 'GET',
          status: 200,
          response: {},
        },
      ],
    },
  },
  decorators: [
    (story) => {
      // Mock chrome API for extension development
      if (typeof window !== 'undefined') {
        (window as any).chrome = {
          storage: {
            local: {
              get: () => Promise.resolve({}),
              set: () => Promise.resolve(),
            },
          },
          runtime: {
            sendMessage: () => Promise.resolve(),
            openOptionsPage: () => Promise.resolve(),
          },
          tabs: {
            create: () => Promise.resolve(),
          },
        };
      }
      return story();
    },
  ],
};

export default preview;
