const CryptoJS = require('crypto-js')

function webhookMiddleware(req, res, next) {
  if (process.env.NODE_ENV === 'development') {
    return next()
  }

  const notAllowed = () =>
    res.status(401).json({
      error: true,
      message: 'Origin not allowed',
    })

  const { secret } = req.query

  const webhookKey = process.env.WEBHOOK_KEY
  const webhookSecret = process.env.WEBHOOK_SECRET

  const cipher = Buffer.from(secret, 'base64').toString()

  const decryptedSecret = CryptoJS.AES.decrypt(cipher, webhookSecret).toString(
    CryptoJS.enc.Utf8
  )

  if (webhookKey !== decryptedSecret) {
    return notAllowed()
  }

  return next()
}

export default webhookMiddleware
