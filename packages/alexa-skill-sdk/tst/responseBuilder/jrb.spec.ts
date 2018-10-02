import { I18NextResourceManagerFactory, ri, DefaultResourceManagerOptions } from '../../lib/resourceManager'
import { JRB } from '../../lib/responseBuilder'
import { expect } from 'chai'
import { ResponseFactory } from 'ask-sdk-core'
import { ui } from 'ask-sdk-model'
import SsmlOutputSpeech = ui.SsmlOutputSpeech

const resourceManagerFactory = new I18NextResourceManagerFactory(DefaultResourceManagerOptions)
const resourceManager = resourceManagerFactory.forLocale('en-US')
let responseFactory = ResponseFactory.init()

it('includes the escaped speak output in the response', async () => {
  let jrb = new JRB(responseFactory, resourceManager)
  jrb.speak(ri('needsEscaping'))

  let response = await jrb.getResponse()
  let os = response.outputSpeech!
  validateOutputSpeech(os)
})

it('includes the escaped reprompt output in the response', async () => {
  let jrb = new JRB(responseFactory, resourceManager)
  jrb.reprompt(ri('needsEscaping'))

  let response = await jrb.getResponse()
  let os = response.reprompt!.outputSpeech
  validateOutputSpeech(os)
})

function validateOutputSpeech (os: ui.OutputSpeech) {
  expect(os.type).equals('SSML')
  let ssml = os as SsmlOutputSpeech
  expect(ssml.ssml).equals('<speak>foo &amp; bar</speak>')
}
