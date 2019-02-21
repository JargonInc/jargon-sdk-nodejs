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

// Make sure tsc can see our changes to IVoxaEvent
import '../lib/plugin'

import { expect } from 'chai'
import { DefaultResourceManagerFactory } from '../lib/'
import { JargonRenderer } from '../lib/renderer'
import { IVoxaEvent, AlexaEvent } from 'voxa'
import { AlexaRequestBuilder } from './tools'

const arb = new AlexaRequestBuilder()
const rmf = new DefaultResourceManagerFactory({})

function makeVars (basic: string, plural: number) {
  return {
    basicParam: () => basic,
    pluralParam: () => plural
  }
}

function renderer (variables?: any): JargonRenderer {
  const config = {
    variables: variables,
    views: {}
  }
  return new JargonRenderer(config)
}

function makeEvent (locale: string = 'en-US'): IVoxaEvent {
  const r = arb.getIntentRequest('FakeIntent')
  const jrm = rmf.forLocale(locale)
  return {
    ...new AlexaEvent(r),
    jrm,
    jargonResourceManager: jrm
  }
}

it('Renders a simple string', async () => {
  const r = renderer()
  const s = await r.renderPath('simple', makeEvent())
  expect(s).equals('simple')
})

it('Renders using the correct locale', async () => {
  const r = renderer()
  const s = await r.renderPath('simple', makeEvent('de-DE'))
  expect(s).equals('de simple')
})

it('Renders a basic parameter correctly', async () => {
  const param = 'This is my param'
  const vars = makeVars(param, 0)
  const r = renderer(vars)
  const s = await r.renderPath('basicParam', makeEvent())
  expect(s).equals(`basicParam: ${param}`)
})

it('Uses passed in parameters instead of ones from config', async () => {
  const param = 'This is my param'
  const vars = makeVars('Not the param we should use', 0)
  const r = renderer(vars)
  const s = await r.renderPath('basicParam', makeEvent(), { basicParam: param })
  expect(s).equals(`basicParam: ${param}`)
})

it('Renders the correct plural case for 0', async () => {
  const vars = makeVars('', 0)
  const r = renderer(vars)
  const s = await r.renderPath('pluralParam', makeEvent())
  expect(s).equals('zero')
})

it('Renders the correct plural case for 1', async () => {
  const vars = makeVars('fish', 1)
  const r = renderer(vars)
  const s = await r.renderPath('pluralParam', makeEvent())
  expect(s).equals('One fish')
})

it('Renders the correct plural case for other', async () => {
  const vars = makeVars('', 17)
  const r = renderer(vars)
  const s = await r.renderPath('pluralParam', makeEvent())
  expect(s).equals('17')
})

it('Correctly passes the voxa event to variables when rendering', async () => {
  const id = 'UserID'
  const vars = {
    basicParam: (e: IVoxaEvent) => e.user.userId,
    pluralParam: () => 0
  }
  const r = renderer(vars)
  const e = makeEvent()
  e.user.userId = id
  const s = await r.renderPath('basicParam', e)
  expect(s).equals(`basicParam: ${id}`)
})

it('Only calls the variable functions if present in the resource', async () => {
  const param = 'param'
  const vars = {
    basicParam: () => param,
    pluralParam: () => { throw new Error('Unexpected call to pluralParam') }
  }
  const r = renderer(vars)
  const s = await r.renderPath('basicParam', makeEvent())
  expect(s).equals(`basicParam: ${param}`)
})
