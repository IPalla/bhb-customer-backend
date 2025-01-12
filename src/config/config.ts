export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  woocommerce: {
    clientId: process.env.WOOCOMMERCE_CLIENT_ID,
    clientSecret: process.env.WOOCOMMERCE_CLIENT_SECRET,
    url: process.env.WOOCOMMERCE_URL,
  }
});
