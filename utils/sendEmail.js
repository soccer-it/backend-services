const emailService = require('@sendgrid/mail')

emailService.setApiKey(process.env.EMAIL_SERVICE_KEY)

function sendEmail(email, { name, team }) {
    return new Promise((resolve, reject) => {
        const msg = {
            to: email,
            from: 'ola@info.soccerit.com.br',
            subject: 'soccerit test',
            text: 'Lorem Ipsum',
            html: `<div style="background-color: ${team.theme['base-theme-color']}; color: ${team.theme['base-content-color']}">
                <p>Olá <strong>${name}</strong>!</p>
                <p>Time: ${team.name}</p>
            </div>`,
        }

        emailService
            .send(msg)
            .then(resolve)
            .catch(reject)
    })
}

export default sendEmail
