import microServiceConfig from '../../utils/microServiceBaseConfig'

const app = microServiceConfig()

app.get('/services/health', function(req, res) {
    res.send('soccerit ok!')
})

module.exports = app
