import { NetlifyJwtVerifier } from '@serverless-jwt/netlify'

export const verifyJwt = NetlifyJwtVerifier({
  issuer: process.env.AUTH0_ISSUER,
  audience: process.env.AUTH0_AUDIENCE
})
