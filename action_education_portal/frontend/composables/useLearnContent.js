import urls from 'kolibri/urls';
import ContentNodeResource from 'kolibri-common/apiResources/ContentNodeResource';
import ContentNodeProgressResource from 'kolibri-common/apiResources/ContentNodeProgressResource';
import ChannelResource from 'kolibri-common/apiResources/ChannelResource';
import { ContentNodeKinds } from 'kolibri/constants';

export function useLearnContent() {
  function learnBase() {
    return urls['kolibri:kolibri.plugins.learn:learn']();
  }

  function contentHref(nodeId) {
    return `${learnBase()}#/topics/c/${nodeId}`;
  }

  // Exercises still play in Kolibri Learn: the flag keeps Learn from sending people back to AE.
  function exerciseHref(nodeId) {
    return `${learnBase()}?ae_exercise=1#/topics/c/${nodeId}`;
  }

  function topicHref(nodeId) {
    return `${learnBase()}#/topics/t/${nodeId}`;
  }

  function channelHref(channelId) {
    return `${learnBase()}#/topics/${channelId}`;
  }

  function libraryHref() {
    return `${learnBase()}#/library`;
  }

  function fetchNodesByKind(kind, { keywords = '', maxResults = 50 } = {}) {
    const getParams = {
      kind,
      max_results: maxResults,
      exclude_course_ancestry: true,
    };
    if (keywords) {
      getParams.keywords = keywords;
    }
    return ContentNodeResource.fetchCollection({ getParams }).then(data => {
      if (Array.isArray(data)) {
        return data;
      }
      return (data && data.results) || [];
    });
  }

  function fetchChannels() {
    return ChannelResource.fetchCollection({ getParams: { available: true } }).then(data => {
      if (Array.isArray(data)) {
        return data;
      }
      return (data && data.results) || [];
    });
  }

  function fetchProgressForIds(ids) {
    if (!ids || !ids.length) {
      return Promise.resolve([]);
    }
    return ContentNodeProgressResource.fetchCollection({
      getParams: { ids },
    }).then(data => {
      if (Array.isArray(data)) {
        return data;
      }
      return (data && data.results) || [];
    });
  }

  function progressMapFromList(progressList) {
    const map = {};
    (progressList || []).forEach(item => {
      if (item && item.content_id != null) {
        map[item.content_id] = item;
      }
    });
    return map;
  }

  function progressFraction(progressEntry) {
    if (!progressEntry) {
      return null;
    }
    if (typeof progressEntry.progress_fraction === 'number') {
      return progressEntry.progress_fraction;
    }
    if (typeof progressEntry.progress === 'number') {
      return progressEntry.progress;
    }
    return null;
  }

  return {
    ContentNodeKinds,
    learnBase,
    contentHref,
    exerciseHref,
    topicHref,
    channelHref,
    libraryHref,
    fetchChannels,
    fetchNodesByKind,
    fetchProgressForIds,
    progressMapFromList,
    progressFraction,
  };
}
