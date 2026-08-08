process.env.NODE_ENV = "test";
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || "mongodb://aim_admin:aim_local_dev_change_me@127.0.0.1:27017/fundsprojects_aim_test?authSource=admin";
process.env.JWT_SECRET = "test-secret-that-is-long-enough-for-authentication-123456789";
process.env.EMAIL_DELIVERY_MODE = "test";
process.env.BCRYPT_ROUNDS = "10";
process.env.FRONTEND_URL = "http://localhost:5173";
