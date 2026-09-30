/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

const LOCALE_FILE = path.resolve(
  __dirname,
  '../../../kolibri/locale/fr_FR/LC_MESSAGES/action_education_portal.app-messages.json',
);

const REQUIRED_NAV_KEYS = [
  'spaceLearner',
  'spaceCoach',
  'spaceAdmin',
  'sessions',
  'createSession',
];

describe('ActionEducationPortalStrings fr-fr catalog', () => {
  it('includes primary navigation keys under ActionEducationPortalStrings', () => {
    expect(fs.existsSync(LOCALE_FILE)).toBe(true);
    const catalog = JSON.parse(fs.readFileSync(LOCALE_FILE, 'utf8'));
    REQUIRED_NAV_KEYS.forEach(key => {
      const fullKey = `ActionEducationPortalStrings.${key}`;
      expect(catalog[fullKey]).toBeTruthy();
      expect(typeof catalog[fullKey]).toBe('string');
    });
  });

  it('keeps the same keys in side_nav catalog', () => {
    const sideNavFile = path.resolve(
      __dirname,
      '../../../kolibri/locale/fr_FR/LC_MESSAGES/action_education_portal.side_nav-messages.json',
    );
    const catalog = JSON.parse(fs.readFileSync(sideNavFile, 'utf8'));
    REQUIRED_NAV_KEYS.forEach(key => {
      expect(catalog[`ActionEducationPortalStrings.${key}`]).toBeTruthy();
    });
  });
});
