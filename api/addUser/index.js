import microServiceConfig from '../../utils/microServiceBaseConfig'
import { createDbClient, q } from '../../utils/db'
import userSchema from '../.schemas/userSchema'
import publishMessage from '../../utils/queue'

const app = microServiceConfig()

app.post('/api/addUser/', function(req, res) {
  const userData = req.body

  const dataValidation = userSchema.validate(userData)

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

  createDbClient().then(client => {
    client
      .query(
        q.Create(q.Collection('users'), {
          data: {
            ...userData,
            team: q.Ref(q.Collection('teams'), userData.team),
          },
        })
      )
      .then(createdUser => {
        const userId = createdUser.ref.id

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
  })
})

module.exports = app
