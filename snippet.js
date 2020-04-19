(({
    config = {
        skipEmpty: false,
        styleTag: undefined
    },
    contentInput
} = {}) => {
    const contentUtils = (() => {
        const contentSelector = 'body > pre';
        const getContent = () => contentInput || document.querySelector(contentSelector).innerHTML;
        const setContent = (HTMLResult) => document.body.innerHTML += HTMLResult;
        const parseContent = (JSONString) => JSON.parse(JSONString);

        return {
            getContent,
            setContent,
            parseContent
        };
    })();

    const typeUtils = (() => {
        const isNumber = (input) => typeof input === 'number';
        const isString = (input) => typeof input === 'string';
        const isRegExp = (input) => {
            const validString = isString(input);
            const startsWithSlash = validString && input.substr(0, 1) === '/';
            const modifiersStartIndex = startsWithSlash && input.lastIndexOf('/') + 1;
            const modifiers = startsWithSlash && input.substr(input.lastIndexOf('/') + 1);
            const withoutModifier = modifiersStartIndex && input.substring(1, modifiersStartIndex - 1);
            const regExp = startsWithSlash && new RegExp(withoutModifier, modifiers);
            const matchesRegExpObj = regExp && regExp.toString() === input;

            return matchesRegExpObj;
        };
        const isUrl = (input) => /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(input);
        const isUnixTimestamp = (input) => input.length === 10 && (parseInt(input, 10) == input);
        const isDate = (input) => /\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4}/.test(input)

        return {
            isDate,
            isNumber,
            isRegExp,
            isString,
            isUnixTimestamp,
            isUrl
        };
    })();

    const HTMLMapper = (() => {
        const mapArrayToHTML = (JSONArray) => {
            let result = '';

            result += '<div class="list-container">';
            result += '<button class="open array-icon">[</button>';
            result += '<ul class="content-container">';

            JSONArray.forEach(item => {
                result += `<li>${mapToHTML(item)}</li>`;
            })

            result += '</ul>';
            result += closedContent();
            result += '<button class="close array-icon">]</button>';
            result += '</div>';

            return result;
        };
        const getTypeClass = (input) => {
            const { isDate, isNumber, isRegExp, isString, isUnixTimestamp, isUrl } = typeUtils;

            if (isNumber(input)) {
                return 'number';
            } else if (isRegExp(input)) {
                return 'regexp';
            } else if (isUrl(input)) {
                return 'url';
            } else if (isUnixTimestamp(input)) {
                return 'date-time unix-timestamp';
            } else if (isDate(input)) {
                return 'date-time date';
            } else if (isString(input)) {
                return 'string';
            }

            return '';
        };
        const mapScalarToHTML = (JSONScalar) => {
            const { isString, isUrl } = typeUtils;

            let result = '';

            if (isString(JSONScalar)) {
                result += `<span class="start quote">'</span>`;
                result += `<span class="${getTypeClass(JSONScalar)}">`;

                if (isUrl(JSONScalar)) {
                    result += `<a href="${JSONScalar}" target="_blank">${JSONScalar}</a>`;
                } else {
                    result += `${JSONScalar}`;
                }

                result += `</span>`;
                result += `<span class="end quote">'</span>`;
            } else {
                result += `<span class="${getTypeClass(JSONScalar)}">`;
                result += `${JSONScalar}`;
                result += `</span>`;
            }

            return result;
        };
        const closedContent = () => '<span class="closed-content">...</span>';
        const mapObjectToHTML = (JSONObject) => {
            let result = '';

            result += '<div class="object-container">'
            result += '<button class="open object-icon">{</button>';
            result += '<dl class="content-container">';

            Object.keys(JSONObject).forEach(propKey => {
                if (config.skipEmpty && JSONObject[propKey] === '') {
                    return;
                }

                result += `<dt>${propKey}:</dt>`;
                result += `<dd>${mapToHTML(JSONObject[propKey])}</dd>`;
            });

            result += '</dl>';
            result += closedContent();
            result += '<button class="close object-icon">}</button>';
            result += '</div>';

            return result;
        };
        const mapToHTML = (JSONContent) => {
            let HTMLResult = '';

            if (Array.isArray(JSONContent)) {
                HTMLResult += mapArrayToHTML(JSONContent);
            } else if (typeof JSONContent === 'object') {
                HTMLResult += mapObjectToHTML(JSONContent)
            } else {
                HTMLResult += mapScalarToHTML(JSONContent);
            }

            return HTMLResult;
        };
        const toggleSection = (event) => {
            const button = event.target;
            const elementToToggle = button.parentElement;

            elementToToggle.classList.toggle('closed');
        };
        const attachEventListeners = () => {
            const buttons = document.querySelectorAll('button.open, button.close');

            buttons.forEach(button => {
                button.addEventListener('click', toggleSection);
            });
        };

        return {
            attachEventListeners,
            mapToHTML
        };
    })();

    const styler = (() => {
        const injectStylesheet = () => {
            document.body.innerHTML = config.styleTag || `
                <style>
                    /* THEMING.*/

                    /* DARK THEME */
                    .dark {
                        background-color: #2e2a2e;
                        color: #bbbbbb;
                    }

                    .dark .array-icon,
                    .dark .object-icon {
                        color: #ff4e83;
                    }

                    .dark .string,
                    .dark .unix-timestamp,
                    .dark .url a {
                        color: #ffd84b;
                    }

                    .dark .regexp {
                        color: #ff4e83;
                    }

                    .dark .number {
                        color: #beaef4;
                    }

                    .dark .date-time {
                        color: #95d764;
                    }
                    /* END OF DARK THEME.*/

                    /* END OF THEMING */

                    body {
                        font-size: 16px;
                        font-family: Arial;
                    }

                    ul {
                        list-style: none;
                    }

                    ul, dl, dd, dt {
                        padding: 0;
                        margin: 0;
                    }

                    ul {
                        margin-left: 24px;
                    }

                    dl {
                        overflow: hidden;
                        margin-left: 24px;
                    }

                    dt, dd {
                        float: left;
                        padding: 12px;
                    }

                    dt {
                        clear: left;
                    }

                    dt {
                        font-weight: bold;
                    }

                    button {
                        background: none;
                        border: 0;
                        padding: 0;
                        margin: 0;
                        cursor: pointer;
                    }

                    .url a {
                        text-decoration: underline;
                    }

                    .array-icon,
                    .object-icon,
                    .divider {
                        font-weight: bold;
                        font-size: 18px;
                    }

                    .closed .content-container {
                        display: none;
                    }

                    .closed-content {
                        display: none;
                        margin: 0 8px;
                    }

                    .closed .closed-content {
                        display: inline;
                    }
                </style>
            `;
        };
        const addThemeClass = () => document.body.classList.add('dark');

        return {
            addThemeClass,
            injectStylesheet
        };
    })();

    const content = contentUtils.getContent();
    const parsedContent = contentUtils.parseContent(content);
    const contentHTML = HTMLMapper.mapToHTML(parsedContent);

    styler.injectStylesheet();
    styler.addThemeClass();
    contentUtils.setContent(contentHTML);
    HTMLMapper.attachEventListeners();
    console.log(contentHTML);
})();
