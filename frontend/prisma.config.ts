import { defineConfig } from '@prisma/config'
import * as dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    // Using DIRECT_URL for Prisma CLI operations (db push, migrate) 
    // to bypass connection pooling issues with Supabase/PgBouncer
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
})
