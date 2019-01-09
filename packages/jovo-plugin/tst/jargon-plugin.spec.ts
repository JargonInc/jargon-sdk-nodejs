/*
 * Copyright 2019 Jargon, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import { assert } from 'chai'
import { HandleRequest } from 'jovo-core'
import { App, ExpressJS } from 'jovo-framework'
import { Alexa } from 'jovo-platform-alexa'
import { Done } from 'mocha'
import { JargonPlugin, ri } from '../lib'

function makeApp () {
  const app = new App({ logging: false })
  app.use(
    new Alexa(),
    new JargonPlugin()
  )

  app.setHandler({
    LAUNCH () {
      this.toIntent('HelloWorldIntent')
    },

    HelloWorldIntent () {
      this.jargon.ask(ri('hwi.ask'), ri('hwi.reprompt'))
    },

    MyNameIsIntent () {
      this.jargon.tell(ri('mnii', { name: this.$inputs.name.value }))
    }
  })
  return app
}

const alexa = new Alexa()
const ts = alexa.makeTestSuite()

it('Returns one of the expected resources for the hello world intent', function (done: Done) {
  this.timeout(1000)

  const app = makeApp()
  app.middleware('after.response')!.use((handleRequest: HandleRequest) => {
    const jovo = handleRequest.jovo!
    const resp = jovo.$response!
    assert.ok(resp.isAsk(
      [
        "Hello from Jargon! What's your name?",
        'Thanks for using Jargon! Could you tell me your name?',
        'Who are you?',
        "What's your name?"
      ],
      [
        'Please tell me your name.',
        'Could you tell me your name?',
        "My name is Alexa. What's yours?",
        "I'd really like to know your name. What is it?"
      ]
    ))

    done()
  })

  ts.requestBuilder.intent('HelloWorldIntent', {})
    .then(request => {
      const host = ExpressJS.dummyRequest(request)
      app.handle(host)
    })
})

it('Includes variables in the response', function (done: Done) {
  this.timeout(1000)

  let app = makeApp()
  app.middleware('after.response')!.use((handleRequest: HandleRequest) => {
    const jovo = handleRequest.jovo!
    const resp = jovo.$response!
    assert.ok(resp.isTell(
      [
        'Hey Jargon, nice to meet you!',
        'Hi there Jargon!'
      ]
    ))

    done()
  })

  ts.requestBuilder.intent('MyNameIsIntent', { name: 'Jargon' })
    .then(request => {
      const host = ExpressJS.dummyRequest(request)
      app.handle(host)
    })
})
