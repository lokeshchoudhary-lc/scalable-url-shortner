import dotenv from "dotenv";
dotenv.config();

export interface SecureConfig {
  PORT: number;
  DATABASE_URL: string;
  FPE_KEY: string;
  DEFAULT_EXPIRES_IN_DAYS: number;
  BASE_URL: string;
}

/**
 * Get required environment variable with graceful handling
 */
const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    console.error(`❌ Missing required environment variable: ${key}`);
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
};

/**
 * Get configuration with validation
 */
export const getSecureConfig = (): SecureConfig => {
  const config: SecureConfig = {
    PORT: parseInt(getRequiredEnv("PORT")),
    DATABASE_URL: getRequiredEnv("DATABASE_URL"),
    FPE_KEY: getRequiredEnv("FPE_KEY"),
    DEFAULT_EXPIRES_IN_DAYS: parseInt(
      getRequiredEnv("DEFAULT_EXPIRES_IN_DAYS")
    ),
    BASE_URL: getRequiredEnv("BASE_URL"),
  };

  return config;
};

// Export singleton instance
export const config = getSecureConfig();
