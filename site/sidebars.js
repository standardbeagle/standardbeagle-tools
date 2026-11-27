// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  pluginsSidebar: [
    {
      type: 'category',
      label: 'Plugins',
      link: {
        type: 'doc',
        id: 'plugins/index',
      },
      items: [
        'plugins/agnt',
        'plugins/lci',
        'plugins/tools',
        'plugins/workflow',
        'plugins/dartai',
        'plugins/figma-query',
        'plugins/slop-mcp',
      ],
    },
  ],

  mcpSidebar: [
    {
      type: 'category',
      label: 'MCP Servers',
      link: {
        type: 'doc',
        id: 'mcp/index',
      },
      items: [
        'mcp/agnt-server',
        'mcp/lci-server',
      ],
    },
  ],
};

export default sidebars;
