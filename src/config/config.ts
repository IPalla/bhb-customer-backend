export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  square: {
    applicationId: process.env.SQ_APPLICATION_ID,
    accessToken: process.env.SQ_ACCESS_TOKEN,
    isSandbox: process.env.SQ_SANDBOX === 'true',
  },
});
