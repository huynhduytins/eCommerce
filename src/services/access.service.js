"use strict"

const shopModel = require("../models/shop.model")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const keyTokenService = require("./keyToken.service")
const { createKeyTokenPair } = require("../auth/authUtils")
const { getInfoData } = require("../utils")
const { BadRequestError, AuthFailureError } = require("../core/error.response")
const { findByEmail } = require("./shop.service")

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
}

class AccessService {
  static login = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email })
    if (!foundShop) {
      throw new BadRequestError("Shop not registered")
    }

    const match = bcrypt.compare(password, foundShop.password)
    if (!match) {
      throw new AuthFailureError("Authentication error")
    }

    const privateKey = crypto.randomBytes(64).toString("hex")
    const publicKey = crypto.randomBytes(64).toString("hex")

    const tokens = await createKeyTokenPair(
      { userId: foundShop._id, name: foundShop.name },
      publicKey,
      privateKey
    )

    await keyTokenService.createKeyToken()

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    }
  }

  static signUp = async ({ name, email, password }) => {
    //check email exists?
    const holderShop = await shopModel.findOne({ email }).lean()
    if (holderShop) {
      throw new BadRequestError("Error: Shop already registered")
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
      const privateKey = crypto.randomBytes(64).toString("hex")
      const publicKey = crypto.randomBytes(64).toString("hex")

      const keyStore = await keyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      })

      if (!keyStore) {
        return {
          code: "xxx",
          message: "Create key token fail",
        }
      }

      // create token pair
      const tokens = await createKeyTokenPair(
        { userId: newShop._id, name: name },
        publicKey,
        privateKey
      )

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
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
  }
}

module.exports = AccessService
