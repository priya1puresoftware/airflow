/*!
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/* global autoRefreshInterval */

import { useQuery } from 'react-query';
import axios from 'axios';

import { getMetaValue } from '../../utils';
import { useAutoRefresh } from '../context/autorefresh';

// dagId comes from dag.html
const dagId = getMetaValue('dag_id');
const treeDataUrl = getMetaValue('tree_data_url');
const numRuns = getMetaValue('num_runs');
const urlRoot = getMetaValue('root');
const baseDate = getMetaValue('base_date');

const areActiveRuns = (runs) => runs.filter((run) => ['queued', 'running', 'scheduled'].includes(run.state)).length > 0;

const useTreeData = () => {
  const emptyData = {
    dagRuns: [],
    groups: {},
  };
  const { isRefreshOn, stopRefresh } = useAutoRefresh();
  return useQuery('treeData', async () => {
    try {
      const root = urlRoot ? `&root=${urlRoot}` : '';
      const base = baseDate ? `&base_date=${baseDate}` : '';
      const data = await axios.get(`${treeDataUrl}?dag_id=${dagId}&num_runs=${numRuns}${root}${base}`);
      if (!data || !data.dagRuns) return emptyData;
      // turn off auto refresh if there are no active runs
      if (!areActiveRuns(data.dagRuns)) stopRefresh();
      return data;
    } catch (e) {
      stopRefresh();
      console.error(e);
    }
    return emptyData;
  }, {
    // only enabled and refetch if the refresh switch is on
    refetchInterval: isRefreshOn && autoRefreshInterval * 1000,
    initialData: emptyData,
  });
};

export default useTreeData;
