import * as admin from 'firebase-admin'

const atob = require('atob')

function initFirebase() {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE,
      project_id: process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID,
      private_key_id: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
      private_key: atob(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY),
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_ID,
      auth_uri: process.env.GOOGLE_SERVICE_ACCOUNT_AUTH_URI,
      token_uri: process.env.GOOGLE_SERVICE_ACCOUNT_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url:
        process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL,
    }),
    databaseURL: process.env.GOOGLE_SERVICE_ACCOUNT_DATABASEURL,
  })

  return admin
}

export default initFirebase
