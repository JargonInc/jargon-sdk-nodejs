/* tslint:disable:no-unused-expression*/

import { fail } from 'assert'
import { expect } from 'chai'
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
  let rf = new I18NextResourceManagerFactory({ consistentRandom: false, localesToPreload: [] })
  let rm = rf.forLocale(locale)
  let item = ri('variation', {})
  await checkVariations(rm, item)
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
