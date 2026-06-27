const BASE_URL = "https://api.sorsa.io/v1/accounts";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "FETCH_SCORE") {
        (async () => {
            try {
                const query = encodeURIComponent(request.username);
                const suggestRes = await fetch(`${BASE_URL}/suggest?query=${query}`);
                const suggestData = await suggestRes.json();

                const accounts = (suggestData && suggestData.accounts) || [];

                // /suggest is a FUZZY search — its first result is often a DIFFERENT
                // account (e.g. "elon" -> "Yonelonmusk"). Only trust an EXACT,
                // case-insensitive screen_name match, otherwise we'd show the wrong score.
                const wanted = request.username.toLowerCase();
                const match = accounts.find(
                    (a) => a && typeof a.screen_name === "string" && a.screen_name.toLowerCase() === wanted
                );

                if (match) {
                    const historyRes = await fetch(`${BASE_URL}/${match.id}/histories`);
                    const historyData = await historyRes.json();
                    // histories are returned newest-first, so [0] is the current score.
                    if (historyData && historyData.histories && historyData.histories.length > 0) {
                        sendResponse({ score: historyData.histories[0].score_value });
                        return;
                    }
                }
                sendResponse({ score: null }); // no exact match -> show nothing rather than a wrong number
            } catch (err) {
                sendResponse({ score: null });
            }
        })();
        return true; // keep the async channel open
    }
});
