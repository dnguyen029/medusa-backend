import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    workerMode: process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server",
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "@medusajs/cache-redis",
      key: Modules.CACHE,
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: "@medusajs/event-bus-redis",
      key: Modules.EVENT_BUS,
      options: {
        redisUrl: process.env.REDIS_URL,
      },
    },
    {
      resolve: "medusa-google-storage",
      options: {
        project_id: process.env.GCS_PROJECT_ID,
        bucket: process.env.GCS_BUCKET,
        gcs_path: process.env.GCS_PATH,
        keyFilename: process.env.GCS_KEYFILE,
      },
    },
  ],
  plugins: [
    {
      resolve: `medusa-plugin-contentful`,
      options: {
        space_id: process.env.CONTENTFUL_SPACE_ID,
        access_token: process.env.CONTENTFUL_ACCESS_TOKEN,
        management_token: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
      },
    },
  ]
})
