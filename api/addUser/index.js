import microServiceConfig from '../../utils/microServiceBaseConfig'
import { createDbClient, q } from '../../utils/db'
import userSchema from '../.schemas/userSchema'
import Joi from 'joi'
import publishMessage from '../../utils/queue'

const app = microServiceConfig()

app.post('/api/addUser/', function(req, res) {
  const userData = req.body

  const dataValidation = Joi.validate(userData, userSchema)

  if (dataValidation.error) {
    return res.status(400).json({
      error: dataValidation.error.details,
    })
  }

  const catchError = err => {
    console.log('Error on create user', err)

    res.status(400).json({
      error: true,
    })
  }

  createDbClient().then(client =>
    client
      .query(
        q.Create(q.Collection('users'), {
          data: userData,
        })
      )
      .then(({ ref }) => {
        const userId = ref.id

        publishMessage('user-messages', {
          userId,
          ...userData,
        })
          .then(() =>
            res.status(200).json({
              userId,
            })
          )
          .catch(catchError)
      })
      .catch(catchError)
  )
})

module.exports = app
