import { I18NextResourceManagerFactory, ri, DefaultResourceManagerOptions, DefaultResourceManagerFactory, ResourceManager, ResourceManagerOptions } from '@jargon/sdk-core'
import { JRB, JargonResponseBuilderOptions } from '../../lib/responseBuilder'
import { expect } from 'chai'
import { ResponseFactory } from 'ask-sdk-core'
import { ui } from 'ask-sdk-model'
import SsmlOutputSpeech = ui.SsmlOutputSpeech

const locale = 'en-US'
const resourceManagerFactory = new I18NextResourceManagerFactory(DefaultResourceManagerOptions)
const resourceManager = resourceManagerFactory.forLocale(locale)

const mergeOptions: JargonResponseBuilderOptions = {
  mergeSpeakAndReprompt: true
}

const needsEscapingResult = 'foo &amp; bar'
const helloResult = 'world'
const mergedHelloResult = `${helloResult} ${helloResult}`

it('includes the escaped speak output in the response', async () => {
  let jrb = new JRB(ResponseFactory.init(), resourceManager)
  jrb.speak(ri('needsEscaping'))

  let response = await jrb.getResponse()
  let os = response.outputSpeech!
  validateOutputSpeech(os, needsEscapingResult)
})

it('includes the escaped reprompt output in the response', async () => {
  let jrb = new JRB(ResponseFactory.init(), resourceManager)
  jrb.reprompt(ri('needsEscaping'))

  let response = await jrb.getResponse()
  let os = response.reprompt!.outputSpeech
  validateOutputSpeech(os, needsEscapingResult)
})

it('does not merge speak content by default', async () => {
  let jrb = new JRB(ResponseFactory.init(), resourceManager)
  jrb.speak(ri('hello'))
  jrb.speak(ri('hello'))

  let response = await jrb.getResponse()
  let os = response.outputSpeech!
  validateOutputSpeech(os, helloResult)
})

it('merges speak content based on boolean parameter', async () => {
  let jrb = new JRB(ResponseFactory.init(), resourceManager)
  jrb.speak(ri('hello'))
  jrb.speak(ri('hello'), true)

  let response = await jrb.getResponse()
  let os = response.outputSpeech!
  validateOutputSpeech(os, mergedHelloResult)
})

it('merges speak content based on options parameter', async () => {
  let jrb = new JRB(ResponseFactory.init(), resourceManager)
  jrb.speak(ri('hello'))
  jrb.speak(ri('hello'), { merge: true })

  let response = await jrb.getResponse()
  let os = response.outputSpeech!
  validateOutputSpeech(os, mergedHelloResult)
})

it('merges speak content based on response builder options', async () => {
  let jrb = new JRB(ResponseFactory.init(), resourceManager, mergeOptions)
  jrb.speak(ri('hello'))
  jrb.speak(ri('hello'), { playBehavior: 'ENQUEUE' })

  let response = await jrb.getResponse()
  let os = response.outputSpeech!
  validateOutputSpeech(os, mergedHelloResult, 'ENQUEUE')
})

it('does not merge speak content due to boolean parameter override', async () => {
  let jrb = new JRB(ResponseFactory.init(), resourceManager, mergeOptions)
  jrb.speak(ri('hello'))
  jrb.speak(ri('hello'), false)

  let response = await jrb.getResponse()
  let os = response.outputSpeech!
  validateOutputSpeech(os, helloResult)
})

it('does not merge speak content due to options parameter override', async () => {
  let jrb = new JRB(ResponseFactory.init(), resourceManager, mergeOptions)
  jrb.speak(ri('hello'))
  jrb.speak(ri('hello'), { merge: false })

  let response = await jrb.getResponse()
  let os = response.outputSpeech!
  validateOutputSpeech(os, helloResult)
})

it('does not merge reprompt content by default', async () => {
  let jrb = new JRB(ResponseFactory.init(), resourceManager)
  jrb.reprompt(ri('hello'), { playBehavior: 'REPLACE_ALL' })
  jrb.reprompt(ri('hello'), { playBehavior: 'ENQUEUE' })

  let response = await jrb.getResponse()
  let os = response.reprompt!.outputSpeech
  validateOutputSpeech(os, helloResult, 'ENQUEUE')
})

it('merges reprompt content based on boolean parameter', async () => {
  let jrb = new JRB(ResponseFactory.init(), resourceManager)
  jrb.reprompt(ri('hello'))
  jrb.reprompt(ri('hello'), true)

  let response = await jrb.getResponse()
  let os = response.reprompt!.outputSpeech
  validateOutputSpeech(os, mergedHelloResult)
})

it('merges reprompt content based on options parameter', async () => {
  let jrb = new JRB(ResponseFactory.init(), resourceManager)
  jrb.reprompt(ri('hello'))
  jrb.reprompt(ri('hello'), { merge: true })

  let response = await jrb.getResponse()
  let os = response.reprompt!.outputSpeech
  validateOutputSpeech(os, mergedHelloResult)
})

it('merges reprompt content based on response builder options', async () => {
  let jrb = new JRB(ResponseFactory.init(), resourceManager, mergeOptions)
  jrb.reprompt(ri('hello'), { playBehavior: 'REPLACE_ALL' })
  jrb.reprompt(ri('hello'), { playBehavior: 'ENQUEUE' })

  let response = await jrb.getResponse()
  let os = response.reprompt!.outputSpeech
  validateOutputSpeech(os, mergedHelloResult, 'REPLACE_ALL')
})

it('does not merge reprompt content due to boolean parameter override', async () => {
  let jrb = new JRB(ResponseFactory.init(), resourceManager, mergeOptions)
  jrb.reprompt(ri('hello'), { playBehavior: 'REPLACE_ALL' })
  jrb.reprompt(ri('hello'), false)

  let response = await jrb.getResponse()
  let os = response.reprompt!.outputSpeech
  validateOutputSpeech(os, helloResult)
})

it('does not merge reprompt content due to options parameter override', async () => {
  let jrb = new JRB(ResponseFactory.init(), resourceManager, mergeOptions)
  jrb.reprompt(ri('hello'))
  jrb.reprompt(ri('hello'), { merge: false, playBehavior: 'ENQUEUE' })

  let response = await jrb.getResponse()
  let os = response.reprompt!.outputSpeech
  validateOutputSpeech(os, helloResult, 'ENQUEUE')
})

it('loads resources from an alternate directory', async () => {
  const rm = rmForResourceDirectory('./alt-resources')
  let jrb = new JRB(ResponseFactory.init(), rm)
  jrb.speak(ri('hello'))

  let response = await jrb.getResponse()
  let os = response.outputSpeech!
  validateOutputSpeech(os, 'a different world')
})

function validateOutputSpeech (os: ui.OutputSpeech, text: string, playBehavior?: ui.PlayBehavior) {
  expect(os.type).equals('SSML')
  let ssml = os as SsmlOutputSpeech
  expect(ssml.ssml).equals(`<speak>${text}</speak>`)
  expect(os.playBehavior).equals(playBehavior)
}

function rmForResourceDirectory (dir: string): ResourceManager {
  const opts: ResourceManagerOptions = {
    resourceDirectory: dir
  }

  const rf = new DefaultResourceManagerFactory(opts)
  const rm = rf.forLocale(locale)
  return rm
}
