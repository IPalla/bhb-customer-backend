export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  guestApiKey: process.env.GUEST_API_KEY || "123456",
  square: {
    applicationId: process.env.SQ_APPLICATION_ID,
    accessToken: process.env.SQ_ACCESS_TOKEN,
    isSandbox: process.env.SQ_SANDBOX === "true",
    locationIds: process.env.SQ_LOCATION_IDS.split(","),
  },
  database: {
    dialect: "postgres",
    username: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: parseInt(process.env.DB_PORT, 10),
    schema: process.env.DB_SCHEMA || "public",
    autoLoadModels: true,
    logging: false, //console.log,
    sync: { force: process.env.DB_SYNC_FORCE === "true" },
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    verifyServiceSid: process.env.VERIFY_SERVICE_SID,
    isActive: process.env.TWILIO_IS_ACTIVE === "true",
  },
  deliveryManager: {
    baseUrl: process.env.DELIVERY_MANAGER_BASE_URL,
  },
  close: {
    apiKey: process.env.CLOSE_API_KEY,
  },
  whatsapp: {
    token: process.env.WHATSAPP_TOKEN,
    origin: process.env.WHATSAPP_ORIGIN,
  },
});
