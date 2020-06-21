//
// Copyright © 2020 Anticrm Platform Contributors.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { Resource, Metadata, Emb, Doc, Obj, Ref, EClass, Class, AllAttributes, Property, ArrayOf, Type, DocLayout, LayoutType } from '@anticrm/platform'

import { RefTo, CoreDomain, InstanceOf } from '@anticrm/platform-core'
import core from '.'
import { ModelDb, MemDb } from '@anticrm/memdb'

function str (value: string): Property<string> {
  return value as unknown as Property<string>
}

class Builder {
  private memdb: ModelDb

  constructor (memdb?: ModelDb) {
    this.memdb = memdb ?? new MemDb()
  }

  dump (): DocLayout[] { return this.memdb.dump() }

  // N E W  I N S T A N C E S

  createClass<T extends E, E extends Obj> (_id: Ref<Class<T>>, _extends: Ref<Class<E>>, _attributes: AllAttributes<T, E>, domain: string = CoreDomain.Model) {
    this.createDocument(core.class.Class as Ref<Class<EClass<T, E>>>,
      { _extends, _attributes, _domain: str(domain), _native: undefined },
      _id as Ref<EClass<T, E>>)
  }

  newInstance<M extends Emb> (_class: Ref<Class<M>>, values: Omit<M, keyof Emb>): M {
    const obj = { _class: _class as Ref<Class<Obj>>, ...values } as M
    return obj
  }

  createDocument<M extends Doc> (_class: Ref<Class<M>>, values: Record<Exclude<keyof M, keyof Doc>, LayoutType>, _id?: Ref<M>): void {
    this.memdb.createDocument(_class, values, _id)
  }

  mixin<T extends E, E extends Doc> (id: Ref<E>, clazz: Ref<Class<T>>, values: Record<Exclude<keyof T, keyof E>, LayoutType>) {
    this.memdb.mixin(id, clazz, values)
  }

  patch<T extends Doc> (obj: Ref<T>, f: (obj: DocLayout) => void) {
    f(this.memdb.get(obj))
  }

  load (model: (builder: Builder) => void) { model(this) }

  resolve<T> (resource: Resource<T>) {
    return resource as Resource<T> & Property<Promise<T>>
  }

  resolveMeta<T> (resource: Metadata<T>) {
    return resource as Metadata<T> & Property<T>
  }

  primitive<T> (prop: T) {
    return prop as T & Property<T>
  }

  // H E L P E R S

  ref<T extends Doc> (to: Ref<Class<T>>): RefTo<T> {
    return this.newInstance(core.class.RefTo, { to: to as Ref<Class<Doc>> }) as RefTo<T>
  }

  arrayOf<T> (of: Type<T>): ArrayOf<T> {
    return this.newInstance(core.class.ArrayOf, { of })
  }

  instanceOf<T extends Emb> (of: Ref<Class<T>>): InstanceOf<T> {
    return this.newInstance(core.class.InstanceOf as Ref<Class<InstanceOf<T>>>, { of })
  }
}

export default Builder
