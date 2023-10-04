'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const keyTokenModel = require('../models/keyToken.model')
const keyTokenService = require('./keyToken.service')

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
          modulesLength: 4096,
        })

        console.log(privateKey, publicKey)
        const publicKeyString = await keyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
        })

        if (!publicKey) {
          return {
            code: 'xxx',
            message: 'Create key token fail',
          }
        }
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
