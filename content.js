
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

// Map a score to its color class based on Sorsa's official tiers (Unknown/Noted/Credible/Significant/Supreme)
function getTierClass(score) {
    if (score >= 2000) return 'corsa-tier-supreme';     // Tier 5
    if (score >= 1000) return 'corsa-tier-significant';  // Tier 4
    if (score >= 500)  return 'corsa-tier-credible';     // Tier 3
    if (score >= 100)  return 'corsa-tier-noted';        // Tier 2
    return 'corsa-tier-unknown';                          // Tier 1
}

// Human-readable tier label shown on hover (tooltip)
function getTierLabel(score) {
    if (score >= 2000) return 'Tier 5 · Supreme';
    if (score >= 1000) return 'Tier 4 · Significant';
    if (score >= 500)  return 'Tier 3 · Credible';
    if (score >= 100)  return 'Tier 2 · Noted';
    return 'Tier 1 · Unknown';
}

function renderBadge(targetElement, score) {
    if (score === null || score === undefined || !targetElement) return;
    
    
    const parent = targetElement.parentElement;
    if (targetElement.querySelector('.corsa-final-badge') || (parent && parent.querySelector('.corsa-final-badge'))) {
        return;
    }

    const badge = document.createElement('span');
    // Add the tier class so the score-appropriate background color is applied
    badge.className = 'corsa-final-badge ' + getTierClass(score);
    badge.title = getTierLabel(score); // Show the tier name on hover
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