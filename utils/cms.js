const Airtable = require('airtable')

function getCMSData(baseName) {
  try {
    const baseIds = {
      brazil_teams: process.env.AIRTABLE_TEAMS_BASE_KEY,
    }

    Airtable.configure({
      endpointUrl: process.env.AIRTABLE_API_URL,
      apiKey: process.env.AIRTABLE_API_KEY,
    })

    const base = Airtable.base(baseIds[baseName])

    return base(baseName)
  } catch (err) {
    console.log('Error on initialize cms')
    throw err
  }
}

export default getCMSData
