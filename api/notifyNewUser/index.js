import microServiceConfig from '../../utils/microServiceBaseConfig'
import webhookMiddleware from '../../utils/webhookMiddleware'
import { notifyNewUserSchema } from '../.schemas/userSchema'
import sendEmail from '../../utils/sendEmail'
import { subscribeToNotifications } from '../../utils/subscribeToNotifications'
import { createDbClient, q } from '../../utils/db'

const request = require('request')
const app = microServiceConfig()

function addContact(contact) {
  return new Promise((resolve, reject) => {
    request(
      {
        url: `${process.env.EMAIL_SERVICE_URL}/marketing/contacts`,
        method: 'PUT',
        body: JSON.stringify({
          contacts: [contact],
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.EMAIL_SERVICE_KEY}`,
        },
      },
      function (err, r, body) {
        if (err) {
          return reject(err)
        }

        if (!/(200|202)/.test(r.statusCode)) {
          console.log(body, r.statusCode)
          return reject()
        }

        return resolve()
      }
    )
  })
}

function updateUser(userId) {
  const updateUserById = (client) =>
    client.query(
      q.Update(q.Ref(q.Collection('users'), userId), {
        data: {
          onboardingNotification: true,
        },
      })
    )

  return new Promise((resolve, reject) => {
    createDbClient().then(updateUserById).then(resolve).catch(reject)
  })
}

function getCurrentTeam(team) {
  const currentTeamPayload = q.Get(q.Ref(q.Collection('teams'), team))
  const queryForTeam = (client) => client.query(currentTeamPayload)

  return new Promise((resolve, reject) => {
    createDbClient().then(queryForTeam).then(resolve).catch(reject)
  })
}

function sendOnboardingEmail(userData) {
  return new Promise((resolve, reject) => {
    const { email, userId } = userData

    sendEmail(email, userData)
      .then((_) => updateUser(userId).then(resolve).catch(reject))
      .catch(reject)
  })
}

function notifyNewUser(req, res) {
  const userData = req.body

  const dataValidation = notifyNewUserSchema.validate(userData)

  if (dataValidation.error) {
    return res.status(400).json({
      error: dataValidation.error.details,
    })
  }

  const { name, email, team } = userData

  function notify(teamPayload) {
    return Promise.all([
      addContact({
        first_name: name,
        email,
      }),
      sendOnboardingEmail({ ...userData, team: teamPayload.data }),
      subscribeToNotifications({ ...userData, team: teamPayload.data }),
    ])
      .then(() => {
        res.status(200).send({
          ok: true,
        })
      })
      .catch((err) => {
        const message = 'Error on notify user'

        console.log(message, err)

        res.status(500).send({
          error: true,
          message,
        })
      })
  }

  getCurrentTeam(team)
    .then(notify)
    .catch((err) => {
      const message = 'Error on query for current team'
      console.log(message, err)

      res.status(400).send({
        error: true,
        message,
      })
    })
}

app.post('/api/notifyNewUser/', webhookMiddleware, notifyNewUser)

module.exports = app
