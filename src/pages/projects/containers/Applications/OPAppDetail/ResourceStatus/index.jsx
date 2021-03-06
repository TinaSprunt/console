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

import { isEmpty } from 'lodash'
import React from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import RouterStore from 'stores/router'
import { joinSelector } from 'utils'
import Services from 'projects/components/Cards/Services'
import Ingresses from 'projects/components/Cards/Ingresses'
import ServiceMonitors from 'projects/components/Cards/ServiceMonitors'

import styles from './index.scss'

@inject('detailStore')
@observer
export default class ResourceStatus extends React.Component {
  constructor(props) {
    super(props)

    this.store = props.detailStore
    this.module = props.module

    this.routerStore = new RouterStore()

    this.getData()
  }

  getData() {
    const detail = toJS(this.store.detail)
    const { cluster, namespace } = this.props.match.params

    const params = {
      cluster,
      namespace,
      labelSelector: joinSelector({
        app: detail.name,
        release: detail.name,
        'app.kubernetes.io/managed-by': 'Helm',
      }),
    }

    this.store.fetchComponents(params)

    this.routerStore.getGateway({ cluster, namespace })
  }

  get prefix() {
    const { workspace, cluster, namespace } = this.props.match.params
    return `/${workspace}/clusters/${cluster}/projects/${namespace}`
  }

  render() {
    const { detail, isLoading } = toJS(this.store)
    const components = toJS(this.store.components.data)
    const serviceMonitors = toJS(this.store.serviceMonitorStore.list.data)
    const gateway = toJS(this.routerStore.gateway.data)

    return (
      <div className={styles.main}>
        {!isEmpty(detail.ingresses) && (
          <Ingresses
            data={detail.ingresses}
            loading={isLoading}
            gateway={gateway}
            prefix={`${this.prefix}/ingresses`}
          />
        )}
        <Services
          className="margin-t12"
          data={components}
          loading={this.store.components.isLoading}
          prefix={`${this.prefix}/services`}
        />
        <ServiceMonitors
          className="margin-t12"
          data={serviceMonitors}
          loading={this.store.components.isLoading}
        />
      </div>
    )
  }
}
