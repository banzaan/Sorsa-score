
const userScoreCache = new Map();

const processedElements = new WeakSet();

function injectSorsa() {

    const elements = document.querySelectorAll('span, div, a');

    elements.forEach((el) => {

        if (el.offsetParent === null) return;

        if (processedElements.has(el) || el.hasAttribute('data-corsa-done')) return;
        
        const text = el.textContent ? el.textContent.trim() : "";
        

        if (text.startsWith('@') && text.length > 1 && text.length < 30) {
            

            if (el.children.length > 0 && el.querySelector('span, div, a')) {
                return;
            }

   
            processedElements.add(el);
            el.setAttribute('data-corsa-done', 'true');
            
            const username = text.replace('@', '').trim();


            if (userScoreCache.has(username)) {
                renderBadge(el, userScoreCache.get(username));
                return;
            }


            chrome.runtime.sendMessage({ type: "FETCH_SCORE", username: username }, (response) => {
                if (response && response.score !== null && response.score !== undefined) {
                    const finalScore = Math.round(response.score);
                    userScoreCache.set(username, finalScore);
                    renderBadge(el, finalScore);
                } else {
                    userScoreCache.set(username, null);
                }
            });
        }
    });
}

function renderBadge(targetElement, score) {
    if (score === null || score === undefined || !targetElement) return;
    

    if (targetElement.querySelector('.corsa-final-badge') || 
        (targetElement.parentElement && targetElement.parentElement.querySelector('.corsa-final-badge'))) {
        return;
    }

    const badge = document.createElement('span');
    badge.className = 'corsa-final-badge';
    badge.innerText = ` ${score} `;
    

    try {
        if (targetElement.parentElement) {
            targetElement.parentElement.appendChild(badge);
        } else {
            targetElement.appendChild(badge);
        }
    } catch (e) {
        targetElement.appendChild(badge);
    }
}


setInterval(injectSorsa, 1000);