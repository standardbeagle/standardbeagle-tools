// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Standard Beagle Tools - Claude Code Plugins & MCP Servers',
  tagline: 'Supercharge Claude Code with browser debugging, code intelligence, and workflow automation plugins',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // Production URL for GitHub Pages
  url: 'https://standardbeagle.github.io',
  baseUrl: '/standardbeagle-tools/',

  // GitHub pages deployment config
  organizationName: 'standardbeagle',
  projectName: 'standardbeagle-tools',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // SEO and metadata
  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'description',
        content: 'Discover powerful Claude Code plugins for browser debugging, semantic code search, workflow automation, and MCP server management. Install in seconds, boost productivity immediately.',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'keywords',
        content: 'Claude Code, Claude AI, MCP, Model Context Protocol, plugins, browser debugging, code intelligence, workflow automation, developer tools',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:type',
        content: 'website',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:title',
        content: 'Standard Beagle Tools - Claude Code Plugins & MCP Servers',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:description',
        content: 'Supercharge Claude Code with browser debugging, code intelligence, and workflow automation plugins',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
    },
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/standardbeagle/standardbeagle-tools/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-XXXXXXXXXX', // Replace with your Google Analytics ID
          anonymizeIP: true,
        },
      }),
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-ideal-image',
      {
        quality: 90,
        max: 1030,
        min: 640,
        steps: 2,
        disableInDev: true,
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.png',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      metadata: [
        {name: 'description', content: 'Discover powerful Claude Code plugins for browser debugging, semantic code search, workflow automation, and MCP server management.'},
        {property: 'og:description', content: 'Supercharge Claude Code with browser debugging, code intelligence, and workflow automation plugins'},
      ],
      algolia: {
        // Replace with your Algolia config if needed
        appId: 'YOUR_APP_ID',
        apiKey: 'YOUR_API_KEY',
        indexName: 'standardbeagle-tools',
      },
      navbar: {
        title: 'Standard Beagle Tools',
        logo: {
          alt: 'Standard Beagle Tools Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'pluginsSidebar',
            position: 'left',
            label: 'Plugins',
          },
          {
            type: 'docSidebar',
            sidebarId: 'mcpSidebar',
            position: 'left',
            label: 'MCP Servers',
          },
          {
            to: '/docs/getting-started',
            label: 'Getting Started',
            position: 'left',
          },
          {
            href: 'https://github.com/standardbeagle/standardbeagle-tools',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Plugins',
            items: [
              {
                label: 'agnt - Browser Superpowers',
                to: '/docs/plugins/agnt',
              },
              {
                label: 'lci - Code Intelligence',
                to: '/docs/plugins/lci',
              },
              {
                label: 'tools - Combined Toolkit',
                to: '/docs/plugins/tools',
              },
            ],
          },
          {
            title: 'MCP Servers',
            items: [
              {
                label: '@standardbeagle/agnt',
                href: 'https://www.npmjs.com/package/@standardbeagle/agnt',
              },
              {
                label: '@standardbeagle/lci',
                href: 'https://www.npmjs.com/package/@standardbeagle/lci',
              },
            ],
          },
          {
            title: 'Resources',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/getting-started',
              },
              {
                label: 'GitHub Repository',
                href: 'https://github.com/standardbeagle/standardbeagle-tools',
              },
              {
                label: 'Report Issues',
                href: 'https://github.com/standardbeagle/standardbeagle-tools/issues',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Standard Beagle. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'json', 'typescript', 'javascript', 'python', 'yaml', 'markdown'],
      },
    }),
};

export default config;
