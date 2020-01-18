import Joi from 'joi'
import microServiceConfig from '../../utils/microServiceBaseConfig'
import webhookMiddleware from '../../utils/webhookMiddleware'
import userSchema from '../.schemas/userSchema'
import sendEmail from '../../utils/sendEmail'
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
      function(err, r, body) {
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
  const updateUserById = client =>
    client.query(
      q.Update(q.Ref(q.Collection('users'), userId), {
        data: {
          onboardingNotification: true,
        },
      })
    )

  return new Promise((resolve, reject) => {
    createDbClient()
      .then(updateUserById)
      .then(resolve)
      .catch(reject)
  })
}

function sendOnboardingEmail(userData) {
  return new Promise((resolve, reject) => {
    const { email, userId } = userData

    sendEmail(email, userData)
      .then(_ =>
        updateUser(userId)
          .then(resolve)
          .catch(reject)
      )
      .catch(reject)
  })
}

function notifyNewUser(req, res) {
  const userData = req.body

  const dataValidation = Joi.validate(userData, userSchema)

  if (dataValidation.error) {
    return res.status(400).json({
      error: dataValidation.error.details,
    })
  }

  const { name, email } = userData

  Promise.all([
    addContact({
      first_name: name,
      email,
    }),
    sendOnboardingEmail(userData),
  ])
    .then(() => {
      res.status(200).send({
        ok: true,
      })
    })
    .catch(err => {
      console.log(err)

      res.status(500).send({
        error: true,
        message: 'Error on notify user',
      })
    })
}

app.post('/api/notifyNewUser/', webhookMiddleware, notifyNewUser)

module.exports = app
