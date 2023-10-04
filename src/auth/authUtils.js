'use strict'

const JWT = require('jsonwebtoken')

const createKeyTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '2 days',
    })

    const refreshToken = await JWT.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '7 days',
    })

    return { accessToken, refreshToken }
  } catch (error) {
    return error
  }
}

module.exports = {
  createKeyTokenPair,
}
