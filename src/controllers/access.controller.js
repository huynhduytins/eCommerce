'use strict'

class AccessController {
  signup = async (req, res, next) => {
    try {
      console.log(`[P]::signup::`, req.body)
      return res.status(201).json({
        code: 201,
        metadata: { userId: 1 },
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new AccessController()
