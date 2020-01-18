import Joi from 'joi'
import teamSchema from './teamSchema'

const userSchema = Joi.object().keys({
    userId: Joi.string().optional(),
    name: Joi.string()
        .min(2)
        .max(30)
        .required(),
    email: Joi.string()
        .email()
        .required(),
    notificationToken: Joi.string().allow(null),
    team: teamSchema.required(),
})

export default userSchema
