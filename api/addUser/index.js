import microServiceConfig from '../../utils/microServiceBaseConfig'
import { createDbClient, q } from '../../utils/db'
import { addUserSchema } from '../.schemas/userSchema'
import publishMessage from '../../utils/queue'
import request from 'request'

const app = microServiceConfig()

function sendUserMessage(userName) {
  return request({
    uri: `${SOCCERIT_SERVICES}/sendPushNotification/`,
    method: 'POST',
    body: JSON.stringify({
      topic: '/topics/soccerit_default',
      payload: {
        notification: {
          title: `Boas vindas ${userName}`,
          body: 'Essa é sua primeira notificação no soccerit!',
        },
      },
    }),
  })
}

app.post('/api/addUser/', function (req, res) {
  const userData = req.body

  const dataValidation = addUserSchema.validate(userData)

  if (dataValidation.error) {
    return res.status(400).json({
      error: dataValidation.error.details,
    })
  }

  const catchError = (err) => {
    console.log('Error on create user', err)

    res.status(400).json({
      error: true,
    })
  }

  createDbClient().then((client) => {
    const teamRef = q.Ref(q.Collection('teams'), userData.team)

    client
      .query(
        q.Create(q.Collection('users'), {
          data: {
            ...userData,
            team: teamRef,
          },
        })
      )
      .then((createdUser) => {
        const userId = createdUser.ref.id

        Promise.all([
          sendUserMessage(userData.name),
          publishMessage('user-messages', {
            userId,
            ...userData,
          }),
        ])
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
