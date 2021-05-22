const mailgun = require("mailgun-js");

const apiKey = process.env.MAIL_GUN_API_KEY
const domain = process.env.MAIL_GUN_DOMAIN_URL;
const mg = mailgun({ apiKey, domain });

const sendWelcomeEmail = (email, name) => {
    mg.messages().send({
        to: email,
        from: 'Mailgun Sandbox <postmaster@sandbox325619e96fee46c986d87a32e38610eb.mailgun.org>',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. We are good to see you here.`
    })
}

const sendCancelationEmail = (email, name) => {
    mg.messages().send({
        to: email,
        from: 'Mailgun Sandbox <postmaster@sandbox325619e96fee46c986d87a32e38610eb.mailgun.org>',
        subject: 'Glad to see ou again!',
        text: `GoodBye, ${name}. Hope to see you soon!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}