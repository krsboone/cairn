/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  entriesSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Kalshi',
      items: [
        'kalshi/kalshi-fill-cost-sell-semantics',
        'kalshi/kalshi-signing-path-prefix',
        'kalshi/kalshi-production-base-url',
        'kalshi/kalshi-order-price-field-required',
        'kalshi/kalshi-market-publish-delay',
      ],
    },
    {
      type: 'category',
      label: 'Kraken',
      items: [
        'kraken/kraken-ohlc-price-staleness',
      ],
    },
    'schema',
    'CONTRIBUTING',
  ],
};

export default sidebars;
