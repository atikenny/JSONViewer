((config = {
    skipEmpty: false,
    styleTag: undefined
}) => {
    const contentUtils = (() => {
        const contentSelector = 'body > pre';
        const getContent = () => document.querySelector(contentSelector).innerHTML;
        const setContent = (HTMLResult) => document.body.innerHTML += HTMLResult;
        const parseContent = (JSONString) => JSON.parse(JSONString);

        return {
            getContent,
            setContent,
            parseContent
        };
    })();

    const HTMLMapper = (() => {
        const mapArrayToHTML = (JSONArray) => {
            let result = '';

            result += '<div class="list-container">';
            result += '<span class="open array-icon">[</span>';
            result += '<ul>';

            JSONArray.forEach((item, index) => {
                result += `<li>${index !== (JSONArray.length - 1) ? `${mapToHTML(item)},` : mapToHTML(item)}</li>`;
            })

            result += '</ul>';
            result += '<span class="close array-icon">]</span>';
            result += '</div>';

            return result;
        };
        const mapScalarToHTML = (JSONScalar) => `<span>${JSONScalar}</span>`;
        const mapObjectToHTML = (JSONObject) => {
            let result = '';

            result += '<span class="open object-icon">{</span>';
            result += '<dl>';

            Object.keys(JSONObject).forEach(propKey => {
                if (config.skipEmpty && JSONObject[propKey] === '') {
                    return;
                }

                result += `<dt>${propKey}</dt>`;
                result += `<dd>${mapToHTML(JSONObject[propKey])}</dd>`;
            });

            result += '</dl>';
            result += '<span class="close object-icon">}</span>';

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

        return {
            mapToHTML
        };
    })();

    const styler = (() => {
        const injectStylesheet = () => {
            document.body.innerHTML = config.styleTag || `
                <style>
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
                </style>
            `;
        };

        return {
            injectStylesheet
        };
    })();

    const content = contentUtils.getContent();
    const parsedContent = contentUtils.parseContent(content);
    const contentHTML = HTMLMapper.mapToHTML(parsedContent);

    styler.injectStylesheet();
    contentUtils.setContent(contentHTML);
    console.log(contentHTML);
})();
