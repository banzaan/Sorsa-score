const BASE_URL = "https://api.sorsa.io/v1/accounts";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "FETCH_SCORE") {
        (async () => {
            try {
  
                const suggestRes = await fetch(`${BASE_URL}/suggest?query=${request.username}`);
                const suggestData = await suggestRes.json();
                
                if (suggestData && suggestData.accounts && suggestData.accounts.length > 0) {
                    const uid = suggestData.accounts[0].id;
                    
         
                    const historyRes = await fetch(`${BASE_URL}/${uid}/histories`);
                    const historyData = await historyRes.json();
                    
                    if (historyData && historyData.histories && historyData.histories.length > 0) {
                        sendResponse({ score: historyData.histories[0].score_value });
                        return;
                    }
                }
                sendResponse({ score: null });
            } catch (err) {
                sendResponse({ score: null });
            }
        })();
        return true; //
    }
});