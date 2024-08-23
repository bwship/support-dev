import i18next from 'i18n';
import enTranslation from "./locales/en/translation.json" assert {
  type: "json",
};
import esTranslation from "./locales/es/translation.json" assert {
  type: "json",
};

const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;

i18next
  .init({
    fallbackLng: "en",
    resources: {
      en: {
        translation: enTranslation,
      },
      es: {
        translation: esTranslation,
      },
    }
  });

export default () =>
  i18next.getFixedT(systemLocale);
