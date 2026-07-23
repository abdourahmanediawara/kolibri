<template>
  <ContentListPage
    :title="videosTitle$()"
    :intro="videosIntro$()"
    :emptyText="videosEmpty$()"
    :showSearch="true"
    :searchLabel="searchLabel$()"
    :searchAction="searchAction$()"
    :loadItems="loadItems"
    :backHomeLabel="backHome$()"
  />
</template>

<script>
  import { portalStrings } from '../strings';
  import { useLearnContent } from '../composables/useLearnContent';
  import ContentListPage from './ContentListPage';

  export default {
    name: 'VideosPage',
    components: {
      ContentListPage,
    },
    setup() {
      const {
        videosTitle$,
        videosIntro$,
        videosEmpty$,
        searchLabel$,
        searchAction$,
        backHome$,
        progressPercent$,
        notStarted$,
      } = portalStrings;
      const {
        fetchNodesByKind,
        fetchProgressForIds,
        progressMapFromList,
        progressFraction,
        contentHref,
        ContentNodeKinds,
      } = useLearnContent();

      function loadItems(keywords) {
        return fetchNodesByKind(ContentNodeKinds.VIDEO, { keywords, maxResults: 50 }).then(
          nodes => {
            const list = nodes || [];
            return fetchProgressForIds(list.map(n => n.id)).then(progressList => {
              const map = progressMapFromList(progressList);
              return list.map(node => {
                const fraction = progressFraction(map[node.content_id]);
                return {
                  id: node.id,
                  title: node.title,
                  href: contentHref(node.id),
                  icon: 'video',
                  thumbnail: node.thumbnail || node.thumbnail_url || '',
                  meta: node.duration ? String(node.duration) : '',
                  progressLabel:
                    typeof fraction === 'number'
                      ? progressPercent$({ percent: Math.round(fraction * 100) })
                      : notStarted$(),
                };
              });
            });
          },
        );
      }

      return {
        videosTitle$,
        videosIntro$,
        videosEmpty$,
        searchLabel$,
        searchAction$,
        backHome$,
        loadItems,
      };
    },
  };
</script>
