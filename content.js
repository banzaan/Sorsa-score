const userScoreCache = new Map();

// Valid X handle: leading @, 1-15 chars of [A-Za-z0-9_]. Rejecting anything else
// stops us querying garbage like "@user · 2h" and showing a wrong/blank score.
const HANDLE_RE = /^@\w{1,15}$/;

function injectSorsa() {
    const elements = document.querySelectorAll('span, div, a');

    elements.forEach((el) => {
        if (el.offsetParent === null) return;           // not visible
        if (el.hasAttribute('data-corsa-done')) return;  // already handled
        // Only the INNERMOST element that holds the handle text. textContent bubbles
        // up, so without this guard every ancestor (span -> div -> a) also matched and
        // we painted the same score 4-5 times across a profile header.
        if (el.children.length > 0) return;

        const text = el.textContent ? el.textContent.trim() : "";
        if (!HANDLE_RE.test(text)) return;

        // Only badge AUTHOR / profile handles. This excludes @mentions inside tweet
        // and reply body text, which previously got badged in random places.
        if (!el.closest('[data-testid="User-Name"], [data-testid="UserName"], [data-testid="HoverCard"]')) return;

        el.setAttribute('data-corsa-done', 'true');
        const username = text.slice(1); // drop the leading '@'
        const key = username.toLowerCase();

        if (userScoreCache.has(key)) {
            renderBadge(el, userScoreCache.get(key));
            return;
        }

        chrome.runtime.sendMessage({ type: "FETCH_SCORE", username: username }, (response) => {
            if (response && response.score !== null && response.score !== undefined) {
                const finalScore = Math.round(response.score);
                userScoreCache.set(key, finalScore);
                renderBadge(el, finalScore);
            } else {
                userScoreCache.set(key, null);
            }
        });
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

    // Already a badge right next to this exact handle? Don't add another.
    const next = targetElement.nextElementSibling;
    if (next && next.classList && next.classList.contains('corsa-final-badge')) return;

    const badge = document.createElement('span');
    // Tier class drives the pill background/border color
    badge.className = 'corsa-final-badge ' + getTierClass(score);
    badge.title = 'Sorsa score: ' + score + ' · ' + getTierLabel(score);
    badge.setAttribute('aria-label', 'Sorsa score ' + score + ', ' + getTierLabel(score));
    badge.textContent = String(score);

    // Sit the badge immediately AFTER the handle text, not appended to some big
    // container (which scattered the number next to unrelated UI like "Follows you").
    try {
        targetElement.after(badge);
    } catch (e) {
        if (targetElement.parentElement) targetElement.parentElement.appendChild(badge);
    }
}

// Drive scans from real DOM changes (throttled) instead of a blind 1s interval that
// re-scanned the whole page forever — that caused scroll lag, memory growth and the
// long-lived-tab refresh (e.g. during X Spaces). Now we go fully idle when nothing changes.
let scanTimer = null;
function scheduleScan() {
    if (scanTimer) return;
    scanTimer = setTimeout(() => { scanTimer = null; injectSorsa(); }, 400);
}

const observer = new MutationObserver(scheduleScan);
observer.observe(document.documentElement, { childList: true, subtree: true });
scheduleScan(); // initial pass
