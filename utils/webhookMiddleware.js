const jwt = require('jsonwebtoken')

function webhookMiddleware(req, res, next) {
  const notAllowed = () =>
    res.status(401).json({
      error: true,
      message: 'Origin not allowed',
    })

  const { secret } = req.query

  const jwtSecret = process.env.WEBHOOK_JWT_SECRET

  jwt.verify(secret, jwtSecret, function(err, decoded) {
    if (
      err ||
      decoded.soccerit_services_webhook !== process.env.WEBHOOK_JWT_PAYLOAD
    ) {
      console.log('Error on verify webhook authentication', err)
      return notAllowed()
    }

    next()
  })
}

export default webhookMiddleware
