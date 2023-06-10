export default () => ({
  port: process.env.PORT || 5000,
  database: {
    host: process.env.DATABASE_HOST,
  },
});
