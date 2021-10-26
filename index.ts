import * as pulumi from '@pulumi/pulumi'
import { RandomString } from './lib'

const config = new pulumi.Config()

const foo = new RandomString('foo', {
  length: config.getNumber('foo-length') || 5,
})
const bar = new RandomString('bar', {
  length: config.getNumber('bar-length') || 10,
})

export const fooValue = foo.output
export const barValue = bar.secret
