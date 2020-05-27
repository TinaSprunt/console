/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import { set, uniq, cloneDeep } from 'lodash'
import { Modal, Notify } from 'components/Base'
import ClusterVisibility from 'clusters/components/Modals/ClusterVisibility'
import FORM_TEMLATES from 'utils/form.templates'

import WorkspaceStore from 'stores/workspace'

export default {
  'cluster.visibility.edit': {
    on({ store, success, cluster, ...props }) {
      const workspaceStore = new WorkspaceStore()
      const modal = Modal.open({
        onOk: async data => {
          if (!data) {
            return Modal.close(modal)
          }

          if (data.public === true) {
            await store.patch(
              { name: store.detail.name },
              {
                metadata: {
                  labels: {
                    'cluster.kubesphere.io/visibility': data.public
                      ? 'public'
                      : 'private',
                  },
                },
              }
            )
          }

          const requests = []
          if (data.public === false) {
            if (data.addWorkspaces) {
              data.addWorkspaces.forEach(item => {
                const formData = Object.assign(
                  {},
                  FORM_TEMLATES.workspaces(),
                  cloneDeep(item._originData)
                )
                const clusters = item.clusters || []
                set(
                  formData,
                  'spec.clusters',
                  uniq([...clusters, cluster.name])
                )
                set(formData, 'metadata.resourceVersion', item.resourceVersion)
                requests.push(workspaceStore.update(item, formData))
              })
            }
            if (data.deleteWorkspaces) {
              data.deleteWorkspaces.forEach(item => {
                const formData = Object.assign(
                  {},
                  FORM_TEMLATES.workspaces(),
                  cloneDeep(item._originData)
                )
                const clusters = item.clusters || []
                set(
                  formData,
                  'spec.clusters',
                  clusters.filter(name => name !== cluster.name)
                )
                set(formData, 'metadata.resourceVersion', item.resourceVersion)
                requests.push(workspaceStore.update(item, formData))
              })
            }
          }

          await Promise.all(requests)

          Modal.close(modal)
          success && success()
          Notify.success({ content: `${t('Updated Successfully')}!` })
        },
        modal: ClusterVisibility,
        store,
        cluster,
        ...props,
      })
    },
  },
}
