import microServiceConfig from '../../utils/microServiceBaseConfig'
import { createDbClient, q } from '../../utils/db'

const app = microServiceConfig()

function queryForTeams() {
  return new Promise((resolve, reject) => {
    const teamsCollectionQuery = q.Map(
      q.Paginate(q.Match(q.Index('all_teams'))),
      q.Lambda('Team', q.Get(q.Var('Team')))
    )

    createDbClient().then(client => {
      client
        .query(teamsCollectionQuery)
        .then(resolve)
        .catch(reject)
    })
  })
}

app.get('/api/listTeams/', function(req, res) {
  const mapTeams = ({ data }) => {
    const byTeam = ({ ref, data }) => ({
      id: ref.id,
      ...data,
    })

    res.status(200).json(data.map(byTeam))
  }

  const errorOnGetTems = err => {
    console.log('Error on get teams', err)

    res.status(400).json({
      error: true,
      message: 'Error on get teams',
    })
  }

  queryForTeams()
    .then(mapTeams)
    .catch(errorOnGetTems)
})

module.exports = app
