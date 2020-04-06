import Joi from 'joi'

export const notificationSchema = Joi.object().keys({
  topic: Joi.string().required(),
  payload: Joi.object({
    notification: Joi.object({
      title: Joi.string().required(),
      body: Joi.string().required(),
    }),
    data: Joi.object({}),
  }).required(),
})
