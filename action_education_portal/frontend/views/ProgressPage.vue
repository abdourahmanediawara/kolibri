<template>
  <ContentListPage
    :title="progressTitle$()"
    :intro="progressIntro$()"
    :emptyText="progressEmpty$()"
    :loadItems="loadItems"
    :backHomeLabel="backHome$()"
  />
</template>

<script>
  import client from 'kolibri/client';
  import urls from 'kolibri/urls';
  import { portalStrings } from '../strings';
  import { useLearnContent } from '../composables/useLearnContent';
  import ContentListPage from './ContentListPage';

  export default {
    name: 'ProgressPage',
    components: {
      ContentListPage,
    },
    setup() {
      const {
        progressTitle$,
        progressIntro$,
        progressEmpty$,
        backHome$,
        progressPercent$,
        continueAction$,
      } = portalStrings;
      const { contentHref, progressFraction } = useLearnContent();

      function loadItems() {
        return client({ url: urls['kolibri:kolibri.plugins.learn:homehydrate']() }).then(
          response => {
            const payload = response.data || {};
            const resources = payload.resumable_resources || {};
            const nodes = resources.results || [];
            const progressList = payload.resumable_resources_progress || [];
            if (!nodes.length) {
              return [];
            }
            return nodes.map(node => {
              const progressEntry = progressList.find(
                item =>
                  item.content_id === node.content_id ||
                  item.contentnode_id === node.id ||
                  item.id === node.id,
              );
              const fraction = progressFraction(progressEntry);
              return {
                id: node.id,
                title: node.title,
                href: contentHref(node.id),
                icon: 'inProgress',
                thumbnail: node.thumbnail || node.thumbnail_url || '',
                meta: continueAction$(),
                progressLabel:
                  typeof fraction === 'number'
                    ? progressPercent$({ percent: Math.round(fraction * 100) })
                    : '',
              };
            });
          },
        );
      }

      return {
        progressTitle$,
        progressIntro$,
        progressEmpty$,
        backHome$,
        loadItems,
      };
    },
  };
</script>
