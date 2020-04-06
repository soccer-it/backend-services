import initFirebase from '../utils/initFirebase'

const admin = initFirebase()

const subscribeToTopic = (topic, notificationTokens) =>
  admin.messaging().subscribeToTopic(notificationTokens, topic)

export function subscribeToNotifications(userData) {
  const { team, notificationTokens } = userData
  const { slug } = team

  return new Promise((resolve, reject) => {
    const defaultTopic = '/topics/soccerit_default'

    Promise.all([
      subscribeToTopic(defaultTopic, notificationTokens),
      subscribeToTopic(`/topics/soccerit_teams_${slug}`, notificationTokens),
    ])
      .then(resolve)
      .catch(function (error) {
        console.log('Error subscribing to topic:', error)
        reject(error)
      })
  })
}
