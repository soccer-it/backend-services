const amqp = require('amqplib/callback_api')

function createConnection() {
    return new Promise((resolve, reject) => {
        amqp.connect(process.env.QUEUE_URL, function(err, connection) {
            if (err) {
                return reject(err)
            }

            connection.createChannel(function(err, channel) {
                if (err) {
                    return reject(err)
                }

                resolve({ channel, connection })
            })
        })
    })
}

const createPublisher = channel => (queueName, data = {}, properties = {}) => {
    return new Promise((resolve, reject) => {
        if (!queueName) {
            return reject('queueName is not defined')
        }
        try {
            channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
                contentType: 'application/json',
                ...properties,
            })

            resolve()
        } catch (err) {
            reject(err)
        }
    })
}

function publishMessage(...args) {
    return new Promise((resolve, reject) => {
        createConnection()
            .then(({ channel, connection }) => {
                const publisher = createPublisher(channel)

                publisher(...args).then(() => {
                    setTimeout(() => {
                        try {
                            channel.close()
                            connection.close()
                        } catch (err) {
                            console.log(err)
                        }

                        resolve()
                    }, 5)
                })

                process.on('exit', code => {
                    channel.close()
                    connection.close()
                    console.log(`Closing rabbitmq channel`)

                    reject()
                })
            })
            .catch(err => console.log('err', err))
    })
}

export default publishMessage
