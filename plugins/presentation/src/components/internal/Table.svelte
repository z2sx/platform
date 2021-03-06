<!--
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
-->
<script type="ts">
  import { createEventDispatcher } from 'svelte'
  import { Class, CORE_CLASS_DOC, Doc, Ref } from '@anticrm/core'
  import { Space } from '@anticrm/domains'
  import { AttrModel, ClassModel } from '../..'
  import { createLiveQuery, getEmptyModel, getPresentationService } from '../../utils'
  import Presenter from './presenters/Presenter.svelte'

  export let _class: Ref<Class<Doc>>
  export let space: Space
  export let editable: boolean = true

  const dispatch = createEventDispatcher()

  let model: ClassModel = getEmptyModel()
  let modelClass: Ref<Class<Doc>>
  let attributes: AttrModel[] = []

  $: {
    if (_class && _class != modelClass) {
      getPresentationService()
        .then((p) => p.getClassModel(_class, CORE_CLASS_DOC))
        .then((m) => {
          model = m
          modelClass = _class
          attributes = model.getAttributes()
        })
    }
  }

  let objects: any[] = []

  const queryUpdate = createLiveQuery(_class, { _space: space._id }, (docs) => {
    objects = docs
  })

  $: queryUpdate.then(qu => qu(_class, {
    _space: space._id
  }))
</script>

<style lang="scss">
  .erp-table {
    display: table;
    border-collapse: collapse;

    .tr {
      display: table-row;
    }

    .thead {
      display: table-header-group;
      border-bottom: 1px solid var(--theme-bg-accent-color);
      color: var(--theme-content-color);
      font-size: 11px;
      font-weight: 400;
    }

    .th {
      display: table-cell;
      padding: 12px 8px;
    }

    .tbody {
      display: table-row-group;
      font-size: 14px;
      font-weight: 400;
      color: var(--theme-content-dark-color);

      .tr {
        background-color: var(--theme-bg-color);
        // border-bottom: 1px solid var(--theme-bg-accent-color);

        // &:hover {
        //   background-color: var(--theme-content-color);
        //   color: var(--theme-bg-color);
        //   cursor: pointer;
        // }

        &:nth-child(odd) {
          background-color: var(--theme-bg-accent-color);
        }
      }
    }

    .td {
      display: table-cell;
      padding: 12px 8px;
    }
  }
</style>

<div class="erp-table">
  <div class="thead">
    <div class="tr">
      {#each attributes as attr (attr.key)}
        <div class="th">{attr.label}</div>
      {/each}
    </div>
  </div>
  <div class="tbody">
    {#each objects as object (object._id)}
      <div class="tr" on:click={() => dispatch('open', { _id: object._id, _class: object._class })}>
        {#each attributes as attr (attr.key)}
          <div class="td">
            {#if attr.presenter}
              <Presenter is={attr.presenter} value={object[attr.key] || '' } attribute={attr} {editable} />
            {:else}
              <span>{object[attr.key] || ''}</span>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>
