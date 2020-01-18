const faunadb = require('faunadb')

export const q = faunadb.query

export function createDbClient() {
  return new Promise((resolve, reject) => {
    try {
      const dbClient = new faunadb.Client({
        secret: process.env.FAUNA_DB_KEY,
        keepAlive: true,
      })

      return resolve(dbClient)
    } catch (err) {
      console.log(err)
      return reject(err)
    }
  })
}
