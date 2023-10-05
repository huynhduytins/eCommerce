'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const keyTokenService = require('./keyToken.service')
const { createKeyTokenPair } = require('../auth/authUtils')
const { getInfoData } = require('../utils')

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
}

class AccessSerVice {
  static signUp = async ({ name, email, password }) => {
    try {
      //check email exists?
      const holderShop = await shopModel.findOne({ email }).lean()
      if (holderShop) {
        return {
          code: 'xxx',
          message: 'Email already exists',
          status: 'error',
        }
      }

      // create new holderShop
      const passwordHash = await bcrypt.hash(password, 10)
      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP],
      })

      // return a refresh token and direct to home page
      if (newShop) {
        // create private key and public key using asymmetric algorithms 'rsa'
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
          modulusLength: 4096,
          publicKeyEncoding: {
            type: 'pkcs1', // pkcs = Public Key CryptoGraphy Standards
            format: 'pem',
          },
          privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
          },
        })

        console.log(privateKey, publicKey)
        const publicKeyString = await keyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
        })

        if (!publicKeyString) {
          return {
            code: 'xxx',
            message: 'Create key token fail',
          }
        }

        // create token pair
        const tokens = await createKeyTokenPair(
          { userId: newShop._id, name: name },
          publicKeyString,
          privateKey
        )
        console.log('Created Token Success::', tokens)

        return {
          code: 201,
          metadata: {
            shop: getInfoData({
              fields: ['_id', 'name', 'email'],
              object: newShop,
            }),
            tokens,
          },
        }
      }

      return {
        code: 200,
        metadata: null,
      }
    } catch (error) {
      return {
        code: 'xxx',
        message: error.message,
        status: 'error',
      }
    }
  }
}

module.exports = AccessSerVice
