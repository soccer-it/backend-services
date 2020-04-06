import microServiceConfig from '../../utils/microServiceBaseConfig'
import { notificationSchema } from '../.schemas/notificationSchema'
import initFirebase from '../../utils/initFirebase'

const app = microServiceConfig()
const admin = initFirebase()

function sendMessage(topic, payload = {}) {
  const message = {
    data: {
      ...payload.data,
    },
    notification: {
      ...payload.notification,
    },
    topic,
  }

  return admin.messaging().send(message)
}

function onSendPushNotification(req, res) {
  const notificationData = req.body

  const dataValidation = notificationSchema.validate(notificationData)

  if (dataValidation.error) {
    return res.status(400).json({
      error: dataValidation.error.details,
    })
  }

  const { topic, payload } = notificationData

  sendMessage(topic, payload)
    .then(() => res.status(200).send('Message has been successfully sended!'))
    .catch((err) => {
      const errorMessage = 'Error on send message'

      console.log(errorMessage, err)

      res.status(400).send({
        error: true,
        message: errorMessage,
      })
    })
}

app.post('/api/sendPushNotification', onSendPushNotification)

module.exports = app
