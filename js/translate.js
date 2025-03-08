function init() {
    new google.translate.TranslateElement({pageLanguage: 'fr', defaultLanguage: 'fr', includedLanguages: 'fr,en,de', gaTrack: false}, 'translate');
}