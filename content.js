
const userScoreCache = new Map();

function injectSorsa() {
  
    const elements = document.querySelectorAll('span, div, a');

    elements.forEach((el) => {
       
        if (el.offsetParent === null) return;

        
        if (el.hasAttribute('data-corsa-done')) return;
        
        const text = el.textContent ? el.textContent.trim() : "";
        
      
        if (text.startsWith('@') && text.length > 1 && text.length < 30) {
            
           
            const parentBlock = el.closest('[data-testid="User-Name"]') || el.closest('a[href^="/"]') || el.parentElement;
            
            if (parentBlock) {
              
                if (parentBlock.hasAttribute('data-corsa-block-processed')) return;
                parentBlock.setAttribute('data-corsa-block-processed', 'true');
            }

           
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
    
    
    const parent = targetElement.parentElement;
    if (targetElement.querySelector('.corsa-final-badge') || (parent && parent.querySelector('.corsa-final-badge'))) {
        return;
    }

    const badge = document.createElement('span');
    badge.className = 'corsa-final-badge';
    badge.innerText = ` ${score} `;
    
   
    try {
        if (parent) {
            parent.appendChild(badge);
        } else {
            targetElement.appendChild(badge);
        }
    } catch (e) {
        targetElement.appendChild(badge);
    }
}


setInterval(injectSorsa, 1000);