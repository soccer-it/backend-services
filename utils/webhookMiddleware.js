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

    const webhookPermissions = process.env.WEBHOOK_PERMISSIONS
    const consumerUserAgent = req.headers['user-agent']

    const currentWebHookConfig = webhookPermissions[consumerUserAgent]

    if (!currentWebHookConfig) {
        return notAllowed()
    }

    const webhookKey = currentAgent.WEBHOOK_KEY
    const webhookSecret = currentAgent.WEBHOOK_SECRET

    const cipher = Buffer.from(secret, 'base64').toString()

    const decryptedSecret = CryptoJS.AES.decrypt(
        cipher,
        webhookSecret
    ).toString(CryptoJS.enc.Utf8)

    if (webhookKey !== decryptedSecret) {
        return notAllowed()
    }

    return next()
}

export default webhookMiddleware
