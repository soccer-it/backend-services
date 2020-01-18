import microServiceConfig from '../../utils/microServiceBaseConfig'
import { createDbClient, q } from '../../utils/db'
import { validate } from './.userSchema'

const app = microServiceConfig()

app.post('/services/addUser', function(req, res) {
    const userData = req.body

    const dataValidation = validate(userData)

    if (dataValidation.error) {
        return res.status(400).json({
            error: dataValidation.error.details,
        })
    }

    createDbClient().then(client =>
        client
            .query(
                q.Create(q.Collection('users'), {
                    data: userData,
                })
            )
            .then(({ ref }) =>
                res.status(200).json({
                    userId: ref.id,
                })
            )
            .catch(err => {
                console.log('Error on create user', err)

                res.status(400).json({
                    error: true,
                })
            })
    )
})

module.exports = app
