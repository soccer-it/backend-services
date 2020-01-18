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

function getDBTeams() {
  return new Promise((resolve, reject) => {
    request.get(`${process.env.SOCCERIT_SERVICES}/listTeams`, function(
      err,
      r,
      body
    ) {
      if (err || r.statusCode !== 200) {
        return reject(err)
      }

      resolve(JSON.parse(body))
    })
  })
}

function saveTeams(teams, populate = false) {
  return new Promise((resolve, reject) => {
    const mapCrawledTeams = teams.reduce((acc, team) => {
      return {
        ...acc,
        [team.hash]: team,
      }
    }, {})

    getDBTeams().then(currentTeams => {
      createDbClient().then(client => {
        const create = q.Create(q.Collection('teams'), {
          data: q.Var('team'),
        })

        const update = q.Update(
          q.Ref(q.Collection('teams'), q.Select(['id'], q.Var('team'))),
          {
            data: q.Select(
              [q.Select(['hash'], q.Var('team'))],
              mapCrawledTeams
            ),
          }
        )

        const action = populate ? create : update

        client
          .query(q.Map(currentTeams, q.Lambda('team', action)))
          .then(resolve)
          .catch(reject)
      })
    })
  })
}

app.post('/api/populateTeams/', function(req, res) {
  const payload = req.body

  const serviceAction = req.body.populate

  if (!payload.resource) {
    res.status(400).json({
      error: true,
      message: 'Crawler result dataset not found',
    })
  }

  const storeId = payload.resource.defaultDatasetId

  getScrapedTeams(storeId)
    .then(scraperOutput => {
      getCMSTeams()
        .then(cmsTeams => {
          return scraperOutput.map(team => {
            const cmsConfig = cmsTeams.find(t => t.hash === team.hash)

            return {
              active: !!cmsConfig,
              ...team,
              ...cmsConfig,
            }
          })
        })
        .then(teams => saveTeams(teams, serviceAction))
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
