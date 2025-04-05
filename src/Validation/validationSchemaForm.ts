import * as Yup from 'yup'
import { featureType } from '../types/formTypes'

export const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  add: Yup.array().of(
    Yup.object().shape({
      question: Yup.string().required('Question is Required'),
      featureType: Yup.string().oneOf(Object.values(featureType)).required('Required'),
      shortAnswer: Yup.lazy(() =>
        Yup.string().when('featureType', {
          is: featureType.ShortAnswer,
          then: schema => schema.notRequired(),
          otherwise: schema => schema.notRequired(),
        })
      ),
      paragraph: Yup.lazy(() =>
        Yup.string().when('featureType', {
          is: featureType.Paragraph,
          then: schema => schema.notRequired(),
          otherwise: schema => schema.notRequired(),
        })
      ),
      multipleChoice: Yup.lazy(() =>
        Yup.array()
          .of(Yup.string())
          .when('featureType', {
            is: featureType.MultipleChoice,
            then: schema => schema.min(1, 'At least one option is required'),
            otherwise: schema => schema.notRequired(),
          })
      ),
      checkboxGroup: Yup.lazy(() =>
        Yup.array()
          .of(Yup.string())
          .when('featureType', {
            is: featureType.Checkboxes,
            then: schema => schema.min(1, 'Please select at least one option').required('Required'),
            otherwise: schema => schema.notRequired(),
          })
      ),
    })
  ),
})
