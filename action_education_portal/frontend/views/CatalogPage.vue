<template>
  <ContentListPage
    :title="catalogTitle$()"
    :intro="catalogIntro$()"
    :emptyText="catalogEmpty$()"
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
    name: 'CatalogPage',
    components: {
      ContentListPage,
    },
    setup() {
      const {
        catalogTitle$,
        catalogIntro$,
        catalogEmpty$,
        searchLabel$,
        searchAction$,
        backHome$,
        channelMeta$,
      } = portalStrings;
      const { fetchChannels, channelHref, topicHref, fetchNodesByKind, contentHref, ContentNodeKinds } =
        useLearnContent();

      function loadItems(keywords) {
        if (keywords) {
          return fetchNodesByKind('content', { keywords, maxResults: 40 }).then(nodes =>
            (nodes || []).map(node => ({
              id: node.id,
              title: node.title,
              href: node.is_leaf ? contentHref(node.id) : topicHref(node.id),
              icon: node.kind === ContentNodeKinds.VIDEO ? 'video' : 'lesson',
              thumbnail: node.thumbnail || node.thumbnail_url || '',
              meta: node.description || '',
            })),
          );
        }
        return fetchChannels().then(channels =>
          (channels || []).map(channel => ({
            id: channel.id,
            title: channel.name || channel.title,
            href: channel.root ? topicHref(channel.root) : channelHref(channel.id),
            icon: 'library',
            thumbnail: channel.thumbnail || channel.thumbnail_url || '',
            meta: channelMeta$({
              count: channel.total_resource_count || 0,
            }),
          })),
        );
      }

      return {
        catalogTitle$,
        catalogIntro$,
        catalogEmpty$,
        searchLabel$,
        searchAction$,
        backHome$,
        loadItems,
      };
    },
  };
</script>
