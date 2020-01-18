import microServiceConfig from '../../utils/microServiceBaseConfig'
import { createDbClient, q } from '../../utils/db'
import getCMSData from '../../utils/cms'

const request = require('request')
const app = microServiceConfig()

function mapScrapedTeams(scraperOutput) {
  return scraperOutput.reduce((acc, championship) => {
    const championshipName = Object.keys(championship)[0]
    const championshipData = JSON.parse(championship[championshipName])

    const { teams } = championshipData

    return [...acc, ...teams]
  }, [])
}

function getScrapedTeams(storeId) {
  return new Promise((resolve, reject) => {
    request.get(
      `${process.env.APIFY_API_URL}/datasets/${storeId}/items`,
      (err, r, body) => {
        if (err || r.statusCode !== 200) {
          return reject(err)
        }

        const scraperOutput = JSON.parse(body)

        resolve(mapScrapedTeams(scraperOutput))
      }
    )
  })
}

function getCMSTeams() {
  return new Promise((resolve, reject) => {
    getCMSData('brazil_teams')
      .select({
        view: 'Grid view',
      })
      .firstPage(function(err, records) {
        if (err) {
          return reject(err)
        }

        resolve(records.map(({ _rawJson }) => _rawJson.fields))
      })
  })
}

function insertTeams(teams) {
  return new Promise((resolve, reject) => {
    createDbClient().then(client => {
      client
        .query(
          q.Map(
            teams,
            q.Lambda(
              'team',
              q.Create(q.Collection('teams'), {
                data: q.Var('team'),
              })
            )
          )
        )
        .then(resolve)
        .catch(reject)
    })
  })
}

app.post('/api/populateTeams/', function(req, res) {
  const payload = req.body
  const storeId = payload.resource.defaultDatasetId

  getScrapedTeams(storeId)
    .then(scraperOutput => {
      getCMSTeams()
        .then(cmsTeams => {
          const teams = scraperOutput.map(team => {
            const cmsConfig = cmsTeams.find(t => t.hash === team.hash) || {}

            return {
              active: !!cmsConfig,
              ...team,
              ...cmsConfig,
            }
          })

          return teams
        })
        .then(insertTeams)
        .then(_ =>
          res.status(200).json({
            ok: true,
          })
        )
    })
    .catch(err => {
      console.log('Error on populate teams', err)

      res.status(400).json({
        error: true,
        message: 'Error on get scraped teams',
      })
    })
})

module.exports = app
