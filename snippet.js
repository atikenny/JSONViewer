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
            result += '<span class="folder-icon">-</span>';
            result += '<ul>';

            JSONArray.forEach(item => {
                result += `<li>${mapToHTML(item)}</li>`;
            })

            result += '</ul>';
            result += '</div>';

            return result;
        };
        const mapScalarToHTML = (JSONScalar) => `<span>${JSONScalar}</span>`;
        const mapObjectToHTML = (JSONObject) => {
            let result = '<dl>';

            Object.keys(JSONObject).forEach(propKey => {
                if (config.skipEmpty && JSONObject[propKey] === '') {
                    return;
                }

                result += `<dt>${propKey}</dt>`;
                result += `<dd>${mapToHTML(JSONObject[propKey])}</dd>`;
            });

            result += '</dl>';

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
