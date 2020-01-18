import microServiceConfig from '../../utils/microServiceBaseConfig'

const app = microServiceConfig()

app.get('/api/health/', function(req, res) {
    res.send('soccerit ok!')
})

module.exports = app
