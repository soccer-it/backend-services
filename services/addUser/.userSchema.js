import Joi from 'joi'

const userSchema = Joi.object().keys({
    name: Joi.string()
        .min(2)
        .max(30)
        .required(),
    email: Joi.string()
        .email()
        .required(),
    notificationToken: Joi.string().allow(null),
    team: Joi.string().allow(null),
})

export const validate = userData => Joi.validate(userData, userSchema)
