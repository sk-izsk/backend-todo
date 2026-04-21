import dotenv from 'dotenv'

const isTestEnvironment = process.env.NODE_ENV === 'test'

if (isTestEnvironment) {
  dotenv.config({
    path: '.env.test',
    quiet: true,
  })
}

dotenv.config({
  path: '.env',
  quiet: true,
})

export const ENV = {
  PORT: process.env.PORT,
}
