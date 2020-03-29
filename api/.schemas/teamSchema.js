import Joi from 'joi'

export const teamIdSchema = Joi.string().required()

const teamSchema = Joi.object().keys({
  name: Joi.string().required(),
  alias: Joi.string().required(),
  id: teamIdSchema,
  slug: Joi.string().required(),
  theme: Joi.object({
    'base-theme-color': Joi.string().required(),
    'base-content-color': Joi.string().required(),
  }).required(),
  banner: Joi.string().required(),
})

export default teamSchema
