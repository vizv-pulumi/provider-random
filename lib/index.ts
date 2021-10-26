import * as pulumi from '@pulumi/pulumi'
import { v4 } from 'uuid'

const randomStringCharset =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

const randomString = (length: number) => {
  let ret = ''

  while (length-- > 0) {
    ret +=
      randomStringCharset[
        Math.floor(Math.random() * randomStringCharset.length)
      ]
  }

  return ret
}

interface RandomStringState {
  length?: pulumi.Unwrap<number>
  value: pulumi.Unwrap<string>
  __provider: pulumi.Unwrap<string>
}

class RandomStringProvider implements pulumi.dynamic.ResourceProvider {
  async create(inputs: RandomStringState) {
    const { length = 32 } = inputs
    const value = randomString(length)

    return {
      id: v4(),
      outs: { value },
    }
  }

  async diff(id: pulumi.ID, olds: RandomStringState, news: RandomStringState) {
    return {
      changes: olds.__provider !== news.__provider,
    }
  }

  async update(
    id: pulumi.ID,
    olds: RandomStringState,
    news: RandomStringState,
  ) {
    const { value } = olds

    return {
      outs: { ...news, value },
    }
  }
}

interface RandomStringArgs {
  length?: pulumi.Input<number>
}

class RandomStringDynamicResource extends pulumi.dynamic.Resource {
  public readonly value!: pulumi.Output<string>

  constructor(
    name: string,
    args: RandomStringArgs,
    opts?: pulumi.CustomResourceOptions,
  ) {
    const props = {
      ...args,
      value: null,
    }

    super(new RandomStringProvider(), name, props, opts)
  }
}

export class RandomString extends pulumi.ComponentResource {
  public dynamicResource: RandomStringDynamicResource

  constructor(
    name: string,
    args: RandomStringArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super('vizv:resource:RandomString', name, {}, opts)

    this.dynamicResource = new RandomStringDynamicResource(name, args, {
      parent: this,
      protect: opts?.protect,
      dependsOn: opts?.dependsOn,
    })
  }

  get output() {
    return pulumi.output(this.dynamicResource.value)
  }

  get secret() {
    return pulumi.secret(this.dynamicResource.value)
  }
}
