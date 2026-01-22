// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/comtrade-api',
    createProxyMiddleware({
      target: 'https://comtradeapi.un.org',
      changeOrigin: true,
      pathRewrite: {
        '^/comtrade-api': '', // Menghapus prefix /comtrade-api saat dikirim ke server UN
      },
    })
  );
};