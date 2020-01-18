import Joi from 'joi'

const teamSchema = Joi.object().keys({
  name: Joi.string().required(),
  alias: Joi.string().required(),
  id: Joi.string().required(),
  slug: Joi.string().required(),
  theme: Joi.object({
    'base-theme-color': Joi.string().required(),
    'base-content-color': Joi.string().required(),
  }).required(),
  banner: Joi.string().required(),
})

export default teamSchema
