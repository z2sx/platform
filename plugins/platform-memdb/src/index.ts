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

import { plugin, AnyPlugin } from '@anticrm/platform'

/** This is the only allowed type for an object property */
interface Property<T> { __property: T }

/** Object property serialized as String */
type StringProperty<T> = string & Property<T>
/** Object property serialized as Number */
type NumberProperty<T> = number & Property<T>

type Resource<T> = StringProperty<T> & { __resource: T } // TODO related to `Resource`

export type Ref<T> = StringProperty<T> & { __ref: true }

export interface Obj { _class: Ref<Class<this>> }
export interface Emb extends Obj { __property: this }
export interface Doc extends Obj {
  _id: Ref<this>
  _mixins?: Ref<Class<Doc>>[]
}
export interface Type<A> extends Emb {
  default?: Property<A>
  exert?: Property<(value: Property<A>) => A>
}
export interface RefTo<T extends Doc> extends Type<T> { to: Ref<Class<Doc>> }
export interface InstanceOf<T extends Emb> extends Type<T> { of: Ref<Class<T>> }
export interface BagOf<A> extends Type<{ [key: string]: A }> { of: Type<A> }
export interface ArrayOf<A> extends Type<A[]> { of: Type<A> }
export interface ResourceType<T> extends Type<T> { }

/////

type PropertyTypes<T> = { [P in keyof T]:
  T[P] extends Property<infer X> ? Type<X> :
  T[P] extends { [key: string]: Property<infer X> } ? Type<{ [key: string]: X }> :
  T[P] extends Property<infer X>[] ? Type<X[]> :
  never
}
export type Attributes<T extends E, E extends Obj> = PropertyTypes<Required<Omit<T, keyof E>>>

export interface EClass<T extends E, E extends Obj> extends Doc {
  _attributes: Attributes<T, E>
}

export type Class<T extends Obj> = EClass<T, Obj>

//////

export type Instance<T extends Obj> = { [P in keyof T]:
  T[P] extends Property<infer X> ? X :
  T[P] extends Property<infer X> | undefined ? X :
  T[P] extends { [key: string]: Property<infer X> } ? { [key: string]: X } :
  T[P] extends Property<infer X>[] ? X[] :
  never
}


export interface Session {
  // -- Here is a single fundamental signature: `mixin`:
  // mixin<D extends T, M extends T, T extends Doc> (doc: D, clazz: Ref<EClass<M, T>>, values: Omit<M, keyof T>): M 

  // newInstance       <M        extends       Obj>         (clazz: Ref<Class<M>>,     values: Omit<M, keyof Obj>): M 
  //     newInstance === mixin, where D = Doc & T = Doc
  // newDocument       <M        extends       Doc>         (clazz: Ref<Class<M>>,     values: Omit<M, keyof Doc>): M 
  //     newInstance === mixin, where D = Doc & T = Doc
  // newClass
  //     newClass === newInstance, where M === EClass<T, E> // clazz: Ref<Class<EClass<T, E>>>,

  mixin<D extends T, M extends T, T extends Doc> (doc: D, clazz: Ref<EClass<M, T>>, values: Omit<M, keyof T>): M
  newInstance<M extends Emb> (clazz: Ref<Class<M>>, values: Omit<M, keyof Emb>): M
  newDocument<M extends Doc> (clazz: Ref<Class<M>>, values: Omit<M, keyof Doc>): Instance<M>
  newClass<T extends E, E extends Obj> (values: Omit<EClass<T, E>, keyof Obj>): EClass<T, E>
}

const core = plugin('core' as AnyPlugin, {}, {
  class: {
    Obj: '' as Ref<Class<Obj>>,
    Doc: '' as Ref<Class<Doc>>,
    Class: '' as Ref<Class<Class<Obj>>>,

    Type: '' as Ref<Class<Type<any>>>,
    RefTo: '' as Ref<Class<RefTo<Doc>>>,
    BagOf: '' as Ref<Class<BagOf<any>>>,
    ArrayOf: '' as Ref<Class<ArrayOf<any>>>,
    InstanceOf: '' as Ref<Class<InstanceOf<Emb>>>,
    ResourceType: '' as Ref<Class<ResourceType<any>>>,
  }
})

export default core

const S = {} as Session

const classObj = S.newClass<Obj, Obj>({
  _id: core.class.Obj,
  _attributes: {}
})

const classDoc = S.newClass<Doc, Obj>({
  _id: core.class.Doc,
  _attributes: {
    _id: S.newInstance(core.class.RefTo, {
      to: core.class.Doc,
    }),
    _mixins: S.newInstance(core.class.ArrayOf, {
      of: S.newInstance(core.class.RefTo, { to: core.class.Doc })
    })
  }
})

const classClass = S.newClass<Class<Obj>, Doc>({
  _id: core.class.Class,
  _attributes: {
    _attributes: S.newInstance(core.class.BagOf, {
      of: S.newInstance(core.class.InstanceOf, { of: core.class.Type })
    })
  }
})

const typeClass = S.newClass<Type<any>, Emb>({
  _id: core.class.Type,
  _attributes: {
    default: S.newInstance(core.class.Type, {}),
    exert: S.newInstance(core.class.ResourceType, {
      default: 'func: type.exert' as Resource<(value: Property<any>) => any>
    })
  }
})
