import KolibriApp from 'kolibri-app';
import RootVue from './views/PortalIndex';
import routes from './routes';
import pluginModule from './modules/pluginModule';
import './styles/fonts.scss';

class PortalModule extends KolibriApp {
  get routes() {
    return routes;
  }
  get RootVue() {
    return RootVue;
  }
  get pluginModule() {
    return pluginModule;
  }
}

export default new PortalModule();
