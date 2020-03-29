import Joi from 'joi'
import { teamIdSchema } from './teamSchema'

const userSchema = Joi.object().keys({
  userId: Joi.string().optional(),
  name: Joi.string()
    .min(2)
    .max(60)
    .required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  notificationToken: Joi.string().allow(null),
  team: teamIdSchema,
})

export default userSchema
