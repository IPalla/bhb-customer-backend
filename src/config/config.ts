export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  square: {
    applicationId: process.env.SQ_APPLICATION_ID,
    accessToken: process.env.SQ_ACCESS_TOKEN,
    isSandbox: process.env.SQ_SANDBOX === 'true',
  },
  database: {
    dialect: 'postgres',
    username: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: parseInt(process.env.DB_PORT, 10),
    autoLoadModels: true,
    logging: false, //console.log,
    sync: { force: process.env.DB_SYNC_FORCE === 'true' },
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    verifyServiceSid: process.env.VERIFY_SERVICE_SID,
    isActive: process.env.TWILIO_IS_ACTIVE === 'true',
  },
});
