import Joi from 'joi'
import { teamIdSchema } from './teamSchema'

const baseUserSchema = Joi.object().keys({
  userId: Joi.string().optional(),
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  notificationTokens: Joi.array().items(Joi.string()).allow(null),
  team: teamIdSchema,
})

export const addUserSchema = baseUserSchema.keys({
  userId: Joi.string().optional(),
})

export const notifyNewUserSchema = baseUserSchema.keys({
  userId: Joi.string().required(),
})
