// Isolated browser regression: npm install --no-save playwright (or set ST_MUSIC_PLAYWRIGHT).
// Uses the installed Chrome by default; ST_MUSIC_BROWSER_CHANNEL can select another Chromium channel.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require(process.env.ST_MUSIC_PLAYWRIGHT || 'playwright');
const source = path.resolve(__dirname, '..');
const output = process.env.ST_MUSIC_TEST_OUTPUT || fs.mkdtempSync(path.join(os.tmpdir(), 'st-music-mobile-'));
const viewportSizes = [[320, 568], [360, 640], [375, 667], [390, 844], [430, 932], [768, 1024], [667, 375], [844, 390], [1280, 800]];
const metrics = [];

async function setup(browser, width, height, touch) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: touch });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
        const url = new URL(route.request().url());
        const filename = url.pathname.split('/').pop();
        if (['index.js', 'ModelCatalog.js', 'ApiService.js', 'style.css', 'music.html'].includes(filename)) {
            let body = fs.readFileSync(path.join(source, filename), 'utf8');
            // Deterministic offline font fallback; icons keep one em of layout space.
            if (filename === 'style.css') body = body.replace(/^@import[^\n]+\n/m, '');
            return route.fulfill({ body, contentType: filename.endsWith('.js') ? 'application/javascript' : filename.endsWith('.css') ? 'text/css' : 'text/html; charset=utf-8' });
        }
        if (url.pathname === '/') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:16px sans-serif;background:#202020}i.fa-solid{display:inline-block;width:1em}i.fa-solid::before{content:"♪"}</style><link rel="stylesheet" href="/style.css"><script type="module" src="/scripts/extensions/third-party/ST_Music/index.js"></script>' });
        return route.abort();
    });
    await page.goto('https://st-music.test/');
    await page.waitForFunction(() => window.STMusic && document.getElementById('stm-tab-player')?.onclick);
    return { context, page, errors };
}

async function rect(page, selector) {
    return page.locator(selector).evaluate(el => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth };
    });
}
function inside(r, bounds, label) {
    assert.ok(r.width > 0 && r.height > 0, `${label} must have positive dimensions: ${JSON.stringify(r)}`);
    assert.ok(r.x >= bounds.x - 1 && r.y >= bounds.y - 1 && r.right <= bounds.right + 1 && r.bottom <= bounds.bottom + 1, `${label} outside bounds: ${JSON.stringify({ r, bounds })}`);
}
async function settle(page) { await page.waitForTimeout(350); }
async function drag(page, touch, from, to, cancel = false) {
    if (touch) {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x, y: from.y, id: 1 }] });
        for (let i = 1; i <= 5; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (to.x - from.x) * i / 5, y: from.y + (to.y - from.y) * i / 5, id: 1 }] });
        await cdp.send('Input.dispatchTouchEvent', { type: cancel ? 'touchCancel' : 'touchEnd', touchPoints: [] });
        await cdp.detach();
    } else {
        await page.mouse.move(from.x, from.y);
        await page.mouse.down();
        await page.mouse.move(to.x, to.y, { steps: 5 });
        await page.mouse.up();
    }
}

(async () => {
    fs.mkdirSync(output, { recursive: true });
    const browser = await chromium.launch({ channel: process.env.ST_MUSIC_BROWSER_CHANNEL || 'chrome', headless: true });
    try {
        for (const [width, height] of viewportSizes) {
            const touch = width < 1000;
            const { context, page, errors } = await setup(browser, width, height, touch);
            const bounds = { x: 0, y: 0, right: width, bottom: height };
            const icon = '#st-music-toggle-btn';
            const start = await rect(page, icon);
            await drag(page, touch, { x: start.x + start.width / 2, y: start.y + start.height / 2 }, { x: Math.min(width - 30, start.x + 100), y: 210 });
            const moved = await rect(page, icon);
            assert.ok(Math.abs(moved.y - start.y) > 80, `${width}: ${touch ? 'touch' : 'mouse'} drag must move icon`);
            assert.equal(await page.locator('#st-music-panel').isVisible(), false, 'drag must not open panel');
            inside(moved, bounds, 'dragged icon');
            const saved = await page.evaluate(() => localStorage.getItem('ST_Music_Toggle_Position_v1'));
            assert.ok(saved, 'drag position saved');
            await page.reload();
            await page.waitForFunction(() => document.getElementById('stm-tab-player')?.onclick);
            const restored = await rect(page, icon);
            assert.ok(Math.abs(restored.x - moved.x) < 2 && Math.abs(restored.y - moved.y) < 2, 'drag position restored');
            // Drag towards an edge; the button must stay fully reachable.
            await drag(page, touch, { x: restored.x + restored.width / 2, y: restored.y + restored.height / 2 }, { x: 1, y: 1 });
            inside(await rect(page, icon), bounds, 'edge-clamped icon');
            if (width === 375) {
                const edge = await rect(page, icon);
                await drag(page, true, { x: edge.x + 22, y: edge.y + 22 }, { x: 100, y: 100 }, true);
                assert.equal(await page.locator(icon).evaluate(e => e.classList.contains('stm-dragging')), false, 'touch cancellation releases drag state');
                assert.equal(await page.locator('#st-music-panel').isVisible(), false, 'canceled drag does not open panel');
            }
            if (touch) await page.locator(icon).tap(); else await page.locator(icon).click();
            await settle(page);
            assert.equal(await page.locator('#st-music-panel').isVisible(), true, 'tap after drag opens panel');
            const player = await rect(page, '#st-music-panel');
            inside(player, bounds, 'player panel');
            const playlist = await rect(page, '.stm-playlist-area');
            assert.ok(playlist.width > 40 && playlist.height > 40, 'compact playlist must not collapse');
            inside(await rect(page, '#stm-btn-close'), player, 'close button');
            if (!touch) {
                const header = await rect(page, '.stm-logo-title');
                await drag(page, false, { x: header.x + 30, y: header.y + 10 }, { x: header.x + 130, y: header.y + 50 });
                const draggedPanel = await rect(page, '#st-music-panel');
                assert.ok(draggedPanel.x - player.x > 80, 'desktop panel header remains draggable without jQuery');
                inside(draggedPanel, bounds, 'dragged desktop panel');
            }
            // Exercise populated lists and the touch delete affordance.
            await page.evaluate(() => {
                STMusic.player.playlist = [{ name: '一首用于布局测试的歌曲', type: 'link', url: 'https://example.invalid/music.mp3' }];
                STMusic.renderPlaylist();
            });
            if (touch) assert.equal(await page.locator('.stm-track-delete').evaluate(e => getComputedStyle(e).opacity), '1', 'touch delete is visible');
            await page.screenshot({ path: path.join(output, `${width}x${height}-player.png`) });
            await page.locator('#stm-btn-link').click();
            await settle(page);
            assert.equal(await page.locator('#stm-link-modal').evaluate(e => e.parentElement.id), 'st-music-root');
            inside(await rect(page, '.stm-modal-content'), bounds, 'link dialog');
            inside(await rect(page, '#stm-modal-confirm'), bounds, 'dialog action');
            await page.keyboard.press('Escape');
            assert.equal(await page.locator('#stm-link-modal').isVisible(), false);
            assert.equal(await page.evaluate(() => document.activeElement.id), 'stm-btn-link');
            for (const view of ['create', 'results', 'settings']) {
                await page.locator(`#stm-tab-${view}`).click();
                await settle(page);
                const panel = await rect(page, '#st-music-panel');
                inside(panel, bounds, `${view} panel`);
                assert.ok(panel.scrollWidth <= panel.clientWidth + 1, `${width} ${view} must not overflow horizontally`);
                inside(await rect(page, '#stm-btn-close'), panel, `${view} close`);
                inside(await rect(page, `#stm-page-${view}`), panel, `${view} content`);
                for (const tab of ['player', 'create', 'results', 'settings']) inside(await rect(page, `#stm-tab-${tab}`), panel, `${view} ${tab} tab`);
                if (view === 'create' || view === 'settings') await page.screenshot({ path: path.join(output, `${width}x${height}-${view}.png`) });
            }
            await page.locator('#stm-tab-results').click();
            await page.evaluate(() => STMusic.showPreview('用于检查窄屏预览的测试内容。'));
            await settle(page);
            inside(await rect(page, '#stm-preview-confirm'), bounds, 'preview confirm');
            inside(await rect(page, '#stm-preview-close'), bounds, 'preview close');
            await page.locator('#stm-preview-close').click();
            await page.locator('#stm-btn-history').click();
            inside(await rect(page, '#stm-history-close'), bounds, 'history close');
            await page.locator('#stm-history-close').click();
            await page.locator('#stm-btn-close').click();
            assert.equal(await page.locator('#st-music-panel').isVisible(), false);
            if (!touch) {
                await page.locator(icon).focus();
                await page.keyboard.press('Enter');
                assert.equal(await page.locator('#st-music-panel').isVisible(), true, 'keyboard can open panel');
                await page.locator('#stm-btn-close').click();
            }
            // Orientation/resize clamp after a saved edge position.
            await page.setViewportSize({ width: height, height: width });
            await settle(page);
            inside(await rect(page, icon), { x: 0, y: 0, right: height, bottom: width }, 'rotated icon');
            assert.deepEqual(errors, [], 'no uncaught page errors');
            metrics.push({ width, height, drag: touch ? 'touch' : 'mouse', playlistWidth: playlist.width, passed: true });
            console.log(`PASS ${width}x${height}: drag, bounds, tabs, playlist, modal, preview, history, rotation`);
            await context.close();
        }
        // Simulate visual viewport shrink/offset while the layout viewport remains unchanged.
        for (const [width, height, visibleHeight] of [[375, 667, 280], [844, 390, 180]]) {
            const { context, page, errors } = await setup(browser, width, height, true);
            await page.evaluate(({ width, visibleHeight }) => {
                const viewport = new EventTarget();
                Object.assign(viewport, { width, height: visibleHeight, offsetTop: 12, offsetLeft: 0 });
                Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
                STMusic.bindViewportEvents();
                STMusic.togglePanel();
                STMusic.toggleView('create');
            }, { width, visibleHeight });
            await settle(page);
            const bounds = { x: 0, y: 12, right: width, bottom: 12 + visibleHeight };
            inside(await rect(page, '#st-music-panel'), bounds, 'keyboard panel');
            inside(await rect(page, '#stm-btn-close'), bounds, 'keyboard close');
            await page.evaluate(() => STMusic.openLinkModal());
            await settle(page);
            inside(await rect(page, '.stm-modal-content'), bounds, 'keyboard modal');
            inside(await rect(page, '#stm-modal-confirm'), bounds, 'keyboard modal action');
            inside(await rect(page, '#stm-link-url'), await rect(page, '.stm-modal-body'), 'keyboard focused input');
            await page.screenshot({ path: path.join(output, `${width}x${height}-keyboard.png`) });
            assert.deepEqual(errors, []);
            console.log(`PASS ${width}x${height}: simulated keyboard viewport ${visibleHeight}px`);
            await context.close();
        }
        fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(metrics, null, 2));
        console.log(`Screenshots and results: ${output}`);
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
