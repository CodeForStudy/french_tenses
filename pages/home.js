document.addEventListener('DOMContentLoaded', () => {
    const heading = document.querySelector('.animated-heading');
    const texts = ['Willkommen!', 'Bienvenue!'];
    let index = 0;

    function animateText() {
        heading.innerHTML = '';
        const text = texts[index];
        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.transitionDelay = `${i * 0.2}s`;
            heading.appendChild(span);
        });

        setTimeout(() => {
            heading.querySelectorAll('span').forEach((span, i) => {
                span.style.opacity = 1;
                span.style.transform = 'translateY(0)';
            });
        }, 100);

        setTimeout(() => {
            heading.querySelectorAll('span').forEach((span, i) => {
                span.style.opacity = 0;
                span.style.transform = 'translateY(20px)';
            });
        }, 10000);

        setTimeout(() => {
            index = (index + 1) % texts.length;
            animateText();
        }, 12500);
    }

    animateText();

    document.querySelector('.translation-widget button').addEventListener('click', async () => {
        const inputText = document.querySelector('.translation-widget textarea').value;
        const languageSwitch = document.querySelector('.language-switch');
        const fromFlag = languageSwitch.querySelector('.from');
        const toFlag = languageSwitch.querySelector('.to');

        const fromLang = fromFlag.classList.contains('de-flag') ? 'de' : 'fr';
        const toLang = toFlag.classList.contains('de-flag') ? 'de' : 'fr';

        const response = await fetch('https://api-ng.pons.com/pons-mf-resultpage/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                language1: fromLang,
                language2: toLang,
                sourceLanguage: fromLang,
                query: inputText,
                dictionaryHint: `${fromLang}${toLang}`,
                locale: fromLang
            })
        });

        const data = await response.json();
        const resultDiv = document.getElementById('translation-result');
        resultDiv.innerHTML = '';

        if(data.type === "text-translation") {
            // Direkt den Text-Übersetzungsteil anzeigen
            const textTransDiv = document.createElement('div');
            textTransDiv.classList.add('translation');
            textTransDiv.innerHTML = data.textTranslation.translation;
            resultDiv.appendChild(textTransDiv);
            
            // Mit Abstand nach unten: Zeige Dictionary-Information als Tabelle
            if(data.dictionary && data.dictionary.result) {
                data.dictionary.result.forEach(entry => {
                    // Extrahiere alle Inhalte (falls entry.content keine Array ist)
                    const contents = Array.isArray(entry.content) ? entry.content : Object.values(entry.content);
                    // Filtere nur Inhalte passend zur Quellsprache
                    const matchingContents = contents.filter(c => c.lang === fromLang);
                    matchingContents.forEach(content => {
                        if(content.hits && content.hits.length > 0) {
                            const table = document.createElement('table');
                            table.style.width = '100%';
                            table.classList.add('translation-table'); // Neue Klasse zum Stylen der horizontalen Trennstriche
                            content.hits.forEach(hit => {
                                const row = document.createElement('tr');
                                const leftCell = document.createElement('td');
                                leftCell.innerHTML = hit.source || "";
                                const rightCell = document.createElement('td');
                                rightCell.innerHTML = hit.target || "";
                                row.appendChild(leftCell);
                                row.appendChild(rightCell);
                                table.appendChild(row);
                            });
                            const spacer = document.createElement('div');
                            spacer.style.marginTop = '20px';
                            spacer.appendChild(table);
                            resultDiv.appendChild(spacer);
                        }
                    });
                });
            }
        } else {
            // Standard-Dictionary-Verarbeitung (wie zuvor)
            if (data.dictionary && data.dictionary.result) {
                data.dictionary.result.forEach(entry => {
                    const entryDiv = document.createElement('div');
                    entryDiv.classList.add('entry');
                    
                    // Falls entry.content kein Array ist, alle Werte verwenden
                    const contents = Array.isArray(entry.content) ? entry.content : Object.values(entry.content);
                    
                    let allTranslationHits = [];
                    contents.forEach(content => {
                        if (content.hits && content.hits.length > 0) {
                            const transHits = content.hits.filter(hit => hit.type_hint === 'translation');
                            allTranslationHits.push(...transHits);
                        }
                    });
                    if (allTranslationHits.length) {
                        const validHits = allTranslationHits.filter(hit => !hit.target.includes('ugs'));
                        const translationHit = validHits.length ? validHits[0] : allTranslationHits[0];
                        const translationDiv = document.createElement('div');
                        translationDiv.classList.add('translation');
                        translationDiv.innerHTML = translationHit.target;
                        entryDiv.appendChild(translationDiv);
                    } else if (entry.secondary_entries && entry.secondary_entries.length > 0) {
                        // Neuer Fall: Verarbeitung von secondary_entries, um z. B. "kebab" anzuzeigen
                        entry.secondary_entries.forEach(secondaryEntry => {
                            if (secondaryEntry.roms && secondaryEntry.roms.length > 0) {
                                secondaryEntry.roms.forEach(rom => {
                                    if (rom.arabs && rom.arabs.length > 0) {
                                        rom.arabs.forEach(arab => {
                                            if (arab.translations && arab.translations.length > 0) {
                                                const translationDiv = document.createElement('div');
                                                translationDiv.classList.add('translation');
                                                translationDiv.innerHTML = arab.translations[0].target;
                                                entryDiv.appendChild(translationDiv);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        contents.forEach(content => {
                            if (content.hits && content.hits.length > 0) {
                                content.hits.forEach(hit => {
                                    const hitDiv = document.createElement('div');
                                    hitDiv.classList.add('hit');
                                    if (hit.text && hit.text.trim() !== '') {
                                        hitDiv.textContent = hit.text;
                                    }
                                    if (hit.roms && hit.roms.length > 0) {
                                        hit.roms.forEach((rom, index) => {
                                            const romContainer = document.createElement('div');
                                            romContainer.classList.add('rom-container');
                                            
                                            const romHeader = document.createElement('h2');
                                            romHeader.innerHTML = rom.numeral 
                                                ? `${rom.numeral}. ${rom.headword_full || 'N/A'}`
                                                : `${index + 1}. ${rom.headword_full || 'N/A'}`;
                                            romContainer.appendChild(romHeader);
                                            
                                            if (rom.arabs && rom.arabs.length > 0) {
                                                rom.arabs.forEach(arab => {
                                                    if (arab.header && arab.header.trim() !== '') {
                                                        const arabHeader = document.createElement('h4');
                                                        arabHeader.innerHTML = arab.header;
                                                        romContainer.appendChild(arabHeader);
                                                    }
                                                    const table = document.createElement('table');
                                                    table.style.width = '100%';
                                                    arab.translations.forEach(translation => {
                                                        const row = document.createElement('tr');
                                                        const leftCell = document.createElement('td');
                                                        leftCell.innerHTML = translation.source;
                                                        const rightCell = document.createElement('td');
                                                        rightCell.innerHTML = translation.target;
                                                        row.appendChild(leftCell);
                                                        row.appendChild(rightCell);
                                                        table.appendChild(row);
                                                    });
                                                    romContainer.appendChild(table);
                                                });
                                            }
                                            hitDiv.appendChild(romContainer);
                                        });
                                    }
                                    entryDiv.appendChild(hitDiv);
                                });
                            }
                        });
                    }
                    resultDiv.appendChild(entryDiv);
                });
            } else if (data.dictionary && data.dictionary.content) {
                data.dictionary.content.forEach(entry => {
                    const entryDiv = document.createElement('div');
                    entryDiv.classList.add('entry');
                    const label = document.createElement('h3');
                    label.textContent = entry.label;
                    entryDiv.appendChild(label);

                    const contents = Array.isArray(entry.content) ? entry.content : Object.values(entry.content);
                    contents.forEach(content => {
                    });
                    resultDiv.appendChild(entryDiv);
                });
            } else {
                const noResultDiv = document.createElement('div');
                noResultDiv.classList.add('no-result');
                noResultDiv.textContent = 'Keine Ergebnisse gefunden.';
                resultDiv.appendChild(noResultDiv);
            }
        }

        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth' });
    });
});

function swapFlags() {
    const languageSwitch = document.querySelector('.language-switch');
    const deFlag = languageSwitch.querySelector('.de-flag');
    const frFlag = languageSwitch.querySelector('.fr-flag');

    deFlag.classList.toggle('de-flag');
    deFlag.classList.toggle('fr-flag');
    frFlag.classList.toggle('fr-flag');
    frFlag.classList.toggle('de-flag');
}