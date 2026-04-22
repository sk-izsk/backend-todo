import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured')
}

function getDirectConnectionString(url: string) {
  if (!url.startsWith('prisma+postgres://')) {
    return url
  }

  const apiKey = new URL(url).searchParams.get('api_key')

  if (!apiKey) {
    throw new Error('Prisma dev DATABASE_URL is missing api_key')
  }

  const payload = JSON.parse(Buffer.from(apiKey, 'base64url').toString('utf8')) as {
    databaseUrl?: string
  }

  if (!payload.databaseUrl) {
    throw new Error('Prisma dev DATABASE_URL does not contain databaseUrl')
  }

  return payload.databaseUrl
}

const adapter = new PrismaPg({ connectionString: getDirectConnectionString(connectionString) })

const prisma = new PrismaClient({ adapter })

export default prisma
