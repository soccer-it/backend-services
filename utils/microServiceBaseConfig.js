const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const app = express()

export default function microServiceConfig() {
    const corsConfig =
        process.env.NODE_ENV === 'development'
            ? '*'
            : process.env.CORS_ALLOWED_ORIGIN

    app.use(
        bodyParser.urlencoded({
            extended: false,
        })
    )

    app.use(bodyParser.json())

    app.use(function(err, _, res, next) {
        if (err) {
            console.error(err)
            return res.status(500).json({
                error: true,
                message: 'Algum erro aconteceu. Tente novamente mais tarde.',
            })
        }

        next()
    })

    app.use(function(_, res, next) {
        res.header('Access-Control-Allow-Origin', corsConfig)
        res.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
        )

        next()
    })

    app.use(helmet())

    return app
}
