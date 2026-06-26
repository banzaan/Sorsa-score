// کَش برای جلوگیری از درخواست‌های تکراری
const userScoreCache = new Map();
// قفل برای اینکه روی یک المان مشخص دقیقاً یک‌بار پردازش انجام شود
const processedElements = new WeakSet();

function injectSorsa() {
    // پیدا کردن تمام تگ‌های متنی عمومی توییتر برای پوشش همه‌جا (پست، بایو، ساجست و غیره)
    const elements = document.querySelectorAll('span, div, a');

    elements.forEach((el) => {
        // ۱. شرط اول: المان حتماً باید به کاربر نشان داده شود (مخفی در HTML نباشد)
        if (el.offsetParent === null) return;

        // ۲. جلوگیری از پردازش تکراری المان
        if (processedElements.has(el) || el.hasAttribute('data-corsa-done')) return;
        
        const text = el.textContent ? el.textContent.trim() : "";
        
        // ۳. تشخیص آیدی که با @ شروع می‌شود
        if (text.startsWith('@') && text.length > 1 && text.length < 30) {
            
            // شاه‌کلید جلوگیری از تکرار: اگر این المان خودش شامل المان‌های متنی دیگری در درونش است،
            // یعنی المان والد است و باید صبر کنیم تا کد روی عمیق‌ترین تگ داخلی (فرزند) اجرا شود.
            if (el.children.length > 0 && el.querySelector('span, div, a')) {
                return;
            }

            // قفل کردن المان
            processedElements.add(el);
            el.setAttribute('data-corsa-done', 'true');
            
            const username = text.replace('@', '').trim();

            // اگر قبلاً امتیازش گرفته شده، درجا نشان بده
            if (userScoreCache.has(username)) {
                renderBadge(el, userScoreCache.get(username));
                return;
            }

            // درخواست از بک‌گراند
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
    
    // لایه محافظتی فیزیکی ثانویه: چک کردن اینکه در خود المان یا والد نزدیکش بج وجود نداشته باشد
    if (targetElement.querySelector('.corsa-final-badge') || 
        (targetElement.parentElement && targetElement.parentElement.querySelector('.corsa-final-badge'))) {
        return;
    }

    const badge = document.createElement('span');
    // Add the tier class so the score-appropriate background color is applied
    badge.className = 'corsa-final-badge ' + getTierClass(score);
    badge.title = getTierLabel(score); // Show the tier name on hover
    badge.innerText = ` ${score} `;
    
    // اضافه کردن امتیاز چسبیده به متن آیدی
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

// اسکن مداوم با زمان‌بندی ۱ ثانیه‌ای کاملاً منطبق بر منطق فایل اصلی شما
setInterval(injectSorsa, 1000);