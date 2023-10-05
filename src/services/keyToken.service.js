'use strict'

const keyTokenModel = require('../models/keyToken.model')

class keyTokenService {
  static createKeyToken = async ({ userId, publicKey }) => {
    try {
      // convert buffer to string because the publicKey come from 'rsa' algorithms
      const publicKeyString = publicKey.toString()
      const tokens = await keyTokenModel.create({
        user: userId,
        publicKey: publicKeyString,
      })

      return tokens ? tokens.publicKey : null
    } catch (error) {
      return error
    }
  }
}

module.exports = keyTokenService
