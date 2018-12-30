/* tslint:disable:no-unused-expression*/

import { fail } from 'assert'
import { assert, expect } from 'chai'
import { DefaultResourceManagerOptions, I18NextResourceManagerFactory, RenderItem, ResourceManager, ri } from '../../lib/resourceManager'

const rf = new I18NextResourceManagerFactory(DefaultResourceManagerOptions)
const locale = 'en-US'
const rm = rf.forLocale(locale)

it('constructs a resource manager for the desired locale', () => {
  expect(rm.locale).equals(locale)
})

it('returns the expected string - simple key', async () => {
  let s = await rm.render(ri('hello'))
  expect(s).equals('world')
})

it('returns the expected string - nested key', async () => {
  let s = await rm.render(ri('nested.key'))
  expect(s).equals('nested value')
})

it('returns only one of the expected string variations', async () => {
  let i = 0
  let item = ri('variation')
  let first = await rm.render(item)
  expect(first).to.be.oneOf(['v1','v2'])
  while (i++ < 10) {
    let s = await rm.render(item)
    expect(s).equals(first)
  }
})

it('returns multiple variations variations based on render item override', async () => {
  let item = ri('variation', {}, { forceNewRandom: true })
  await checkVariations(rm, item)
})

it('returns multiple variations variations based on resource manager confguration', async () => {
  let rf = new I18NextResourceManagerFactory({ consistentRandom: false })
  let rm = rf.forLocale(locale)
  let item = ri('variation', {})
  await checkVariations(rm, item)
})

it('tracks the variation that was selected', async () => {
  let item = ri('variation')
  let s = await rm.render(item)
  let sv = await rm.selectedVariation(item)

  expect(sv.variationKey).equals(s)
  assert(sv.key.startsWith('variation'))
})

it('skips tracking when configured not to do so', async () => {
  let rf = new I18NextResourceManagerFactory({ trackSelectedVariations: false })
  let rm = rf.forLocale(locale)
  let item = ri('variation')
  await rm.render(item)
  try {
    await rm.selectedVariation(item)
    fail('Expected rm.selectedVariation() to throw')
  } catch (error) {
    // Expected
  }
})

it('errors when asked for an item without variations', async () => {
  let item = ri('hello')
  await rm.render(item)
  try {
    await rm.selectedVariation(item)
    fail('Expected rm.selectedVariation() to throw')
  } catch (error) {
    // Expected
  }
})

it('returns the selected variations in the expected order', async () => {
  // We need to use a fresh ResourceManager for this test
  let rm = rf.forLocale(locale)

  let r1 = ri('variation')
  let r2 = ri('anotherVariation')
  await rm.renderBatch([r1, r2])
  let vs = await rm.selectedVariations()
  expect(vs).length(2)
  expect(vs[0].item).equals(r1)
  expect(vs[1].item).equals(r2)
})

it('returns the rendered object', async () => {
  let item = ri('object', { name: 'World', num: 7 })
  let obj: any = await rm.renderObject(item)
  expect(obj.boolVal).to.be.true
  expect(obj.numVal).equals(32)
  expect(obj.greeter).equals('Hello World')
  expect(obj.child.grandchild.numString).equals('7')
})

it('rejects an attempt to load a raw boolean', async () => {
  let item = ri('rawBoolean')
  try {
    let v = await rm.render(item)
    fail('Render of a non-string should have failed')
  } catch (error) {
    // Expected!
  }
})

it('returns the raw boolean', async () => {
  let item = ri('rawBoolean')
  let v = await rm.renderObject(item)
  expect(v).to.be.false
})

it('rejects an attempt to load a raw number', async () => {
  let item = ri('rawNumber')
  try {
    let v = await rm.render(item)
    fail('Render of a non-string should have failed')
  } catch (error) {
    // Expected!
  }
})

it('returns the raw number', async () => {
  let item = ri('rawNumber')
  let v = await rm.renderObject(item)
  expect(v).equals(42)
})

it('returns the number we passed in', async () => {
  let s = await rm.render(ri('number', { num: 4 }))
  expect(s).equals('4')
})

it('returns the number and the word we passed in', async () => {
  let s = await rm.render(ri('numberAndSub', { num: 4, word: 'the word' }))
  expect(s).equals('4 the word')

  s = await rm.render(ri('numberAndSub', { num: 0, word: 'the word' }))
  expect(s).equals('zero the word')
})

it('substitues our name', async () => {
  let s = await rm.render(ri('substitution', { name: 'Jonathan' }))
  expect(s).equals('Hello Jonathan')
})

it('works in batch', async () => {
  let e = ri('substitution', { name: 'Everyone' })
  let j = ri('substitution', { name: 'Jonathan' })
  let w = ri('substitution', { name: 'World' })

  let batch = await rm.renderBatch([e, j, w])
  expect(batch).to.have.length(3)
  expect(batch[0]).equals('Hello Everyone')
  expect(batch[1]).equals('Hello Jonathan')
  expect(batch[2]).equals('Hello World')
})

it('renders nested render items correctly', async () => {
  let inner = ri('wordifier', { bird: 'hummingbird' })
  let item = ri('numberAndSub', {
    num: 1,
    word: inner
  })

  let s = await rm.render(item)
  expect(s).equals('one hummingbird is the word')
})

it('returns selected variations when nested render items are present', async () => {
  // We need to use a fresh ResourceManager for this test
  let rm = rf.forLocale(locale)

  let inner = ri('anotherVariation')
  let item = ri('variationWithParam', {
    param: inner
  })

  let s = await rm.render(item)
  let sv = await rm.selectedVariations()

  expect(sv).length(2)
  expect(sv[0].item).equals(inner)
  expect(sv[1].item).equals(item)

  let param = await rm.render(ri(sv[0].key))
  let rendered = await rm.render(ri(sv[1].key, { param: param }))
  expect(s).equals(rendered)
})

it('uses internal resources', async () => {
  let s = await rm.render(ri('Jargon.unhandledResponse'))
  expect(s).to.be.oneOf(['I couldn\'t understand that. Could you repeat that?',
        'I\'m sorry, I didn\'t understand. Can you rephrase that?',
        'I\'m afraid I don\'t know what you mean. Please say that again.',
        'I\'m sorry, but I did not understand your response.',
        'Sorry, I missed that. Could you say it again?'])
})

it('respects override of internal resources', async () => {
  let rm = rf.forLocale('en-GB')
  let s = await rm.render(ri('Jargon.unhandledResponse'))
  expect(s).equals('My own response')

  s = await rm.render(ri('Jargon.defaultReprompt'))
  expect(s).to.be.oneOf(['What else can I help you with?',
    'How else can I help you?'])
})

it('understands internal resources of different locales', async () => {
  let testResources = {
    "en-US": {
      "Jargon": {
        "defaultReprompt": "An American reprompt"
      }
    },
    "en-GB": {
      "Jargon": {
        "defaultReprompt": "A British reprompt"
      }
    },
    "de": {
      "Jargon": {
        "defaultReprompt": "A German reprompt"
      }
    }
  }
  let rf = new I18NextResourceManagerFactory({}, testResources)
  let rm = rf.forLocale('en-US')
  let s = await rm.render(ri('Jargon.defaultReprompt'))
  expect(s).equals('An American reprompt')

  rm = rf.forLocale('en-GB')
  s = await rm.render(ri('Jargon.defaultReprompt'))
  expect(s).equals('A British reprompt')

  rm = rf.forLocale('de-DE')
  s = await rm.render(ri('Jargon.defaultReprompt'))
  expect(s).equals('A German reprompt')
})

async function checkVariations (rm: ResourceManager, item: RenderItem) {
  let i = 0
  let previous = await rm.render(item)
  expect(previous).to.be.oneOf(['v1','v2'])

  let sawVariation = false
  while (i++ < 10) {
    let s = await rm.render(item)
    expect(previous).to.be.oneOf(['v1','v2'])
    sawVariation = sawVariation || s !== previous
  }

  expect(sawVariation).to.be.true
}
