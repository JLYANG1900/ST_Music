// Offline settings regression. Uses the same Playwright/Chrome environment as mobile-browser.cjs.
// Set ST_MUSIC_PLAYWRIGHT, ST_MUSIC_BROWSER_CHANNEL and ST_MUSIC_TEST_OUTPUT when needed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require(process.env.ST_MUSIC_PLAYWRIGHT || 'playwright');

const source = path.resolve(__dirname, '..');
const output = process.env.ST_MUSIC_TEST_OUTPUT || fs.mkdtempSync(path.join(os.tmpdir(), 'st-music-api-settings-'));
const origin = 'https://st-music.test';
const storeKey = 'st_music_independent_api_config';
const profiles = ['primary', 'secondary'];
const protocols = ['openai-chat', 'openai-responses', 'anthropic', 'gemini'];
const modelCounts = { openai: 54, gemini: 19, claude: 20, deepseek: 4, minimax: 6 };
const results = [];

async function setup(browser, width = 1280, height = 900, seed) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 1000, serviceWorkers: 'block' });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const errors = [];
    const blockedRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    await context.addInitScript(({ seed, storeKey }) => {
        // Capture notifications without a modal dialog; no real credential or provider call is used.
        window.__settingsNotices = [];
        window.toastr = {
            success: message => window.__settingsNotices.push({ type: 'success', message }),
            error: message => window.__settingsNotices.push({ type: 'error', message }),
            warning: message => window.__settingsNotices.push({ type: 'warning', message }),
            info: message => window.__settingsNotices.push({ type: 'info', message }),
        };
        if (seed && !sessionStorage.getItem('st-music-test-seeded')) {
            localStorage.setItem(storeKey, JSON.stringify(seed));
            sessionStorage.setItem('st-music-test-seeded', 'true');
        }
    }, { seed, storeKey });
    await context.route('**/*', route => {
        const request = route.request();
        const url = new URL(request.url());
        const filename = url.pathname.split('/').pop();
        // Only these exact local fixture resources are fulfilled. All other hosts and methods abort.
        if (url.origin === origin && request.method() === 'GET') {
            if (['index.js', 'ModelCatalog.js', 'ApiService.js', 'style.css', 'music.html'].includes(filename)) {
                let body = fs.readFileSync(path.join(source, filename), 'utf8');
                if (filename === 'style.css') body = body.replace(/^@import[^\n]+\n/m, '');
                return route.fulfill({ body, contentType: filename.endsWith('.js') ? 'application/javascript' : filename.endsWith('.css') ? 'text/css' : 'text/html; charset=utf-8' });
            }
            if (url.pathname === '/') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:16px sans-serif;background:#202020}i.fa-solid{display:inline-block;width:1em}i.fa-solid::before{content:"♪"}</style><link rel="stylesheet" href="/style.css"><script type="module" src="/scripts/extensions/third-party/ST_Music/index.js"></script>' });
        }
        blockedRequests.push({ method: request.method(), host: url.host });
        return route.abort();
    });
    await page.goto(`${origin}/`);
    await openSettings(page);
    return { context, page, errors, blockedRequests };
}

async function openSettings(page) {
    await page.waitForFunction(() => window.STMusicApi && document.getElementById('stm-tab-settings')?.onclick);
    if (!(await page.locator('#st-music-panel').isVisible())) await page.locator('#st-music-toggle-btn').click();
    await page.locator('#stm-tab-settings').click();
    await page.locator('#stm-primary-provider').waitFor({ state: 'visible' });
    await page.waitForTimeout(100);
}

async function reloadSettings(page) {
    await page.reload();
    await openSettings(page);
}

async function save(page) {
    await page.evaluate(() => { window.__settingsNotices = []; });
    await page.locator('#stm-save-api-profiles').click();
    const notices = await page.evaluate(() => window.__settingsNotices);
    assert.ok(notices.some(notice => notice.type === 'success'), `save should succeed: ${JSON.stringify(notices)}`);
    assert.ok(!notices.some(notice => notice.type === 'error'), 'save must not report an error');
    assert.equal(await page.evaluate(() => STMusicApi.getApiProfileConfig().version), 5);
}

async function fillCustom(page, name, config) {
    await page.locator(`#stm-${name}-provider`).selectOption('custom');
    await page.locator(`#stm-${name}-protocol`).selectOption(config.protocol);
    await page.locator(`#stm-${name}-endpoint`).fill(config.endpoint);
    await page.locator(`#stm-${name}-custom-model`).fill(config.model);
    await page.locator(`#stm-${name}-temperature`).fill(config.temperature);
    await page.locator(`#stm-${name}-max-tokens`).fill(config.maxTokens);
    await page.locator(`#stm-${name}-key`).fill(config.key);
}

async function assertCustom(page, name, expected) {
    const values = await page.evaluate(name => {
        const value = field => document.getElementById(`stm-${name}-${field}`).value;
        return { provider: value('provider'), protocol: value('protocol'), endpoint: value('endpoint'),
            model: value('custom-model'), temperature: value('temperature'), maxTokens: value('max-tokens'), key: value('key') };
    }, name);
    assert.deepEqual(values, { provider: 'custom', ...expected }, `${name} custom settings should round-trip`);
    assert.equal(await page.locator(`#stm-${name}-custom-fields`).isVisible(), true);
    assert.equal(await page.locator(`#stm-${name}-builtin-model-field`).isVisible(), false);
}

async function checkFixture(fixture, label) {
    assert.deepEqual(fixture.errors, [], `${label}: no uncaught browser errors`);
    assert.ok(!fixture.blockedRequests.some(request => request.method() !== 'GET'), `${label}: settings must not try sending an API request`);
}

async function runCase(browser, label, action, options = {}) {
    const fixture = await setup(browser, options.width, options.height, options.seed);
    try {
        await action(fixture.page);
        await checkFixture(fixture, label);
        results.push({ name: label, passed: true, blockedExternalRequests: fixture.blockedRequests.length });
        console.log(`PASS ${label}`);
    } finally { await fixture.context.close(); }
}

(async () => {
    fs.mkdirSync(output, { recursive: true });
    const browser = await chromium.launch({ channel: process.env.ST_MUSIC_BROWSER_CHANNEL || 'chrome', headless: true });
    try {
        await runCase(browser, 'primary and secondary catalog options and exact counts', async page => {
            for (const name of profiles) {
                const choices = await page.locator(`#stm-${name}-provider option`).evaluateAll(nodes => nodes.map(node => ({ value: node.value, label: node.textContent })));
                assert.equal(choices.length, 6);
                assert.ok(choices.some(choice => choice.value === 'custom' && choice.label === '自定义'));
                for (const [provider, expected] of Object.entries(modelCounts)) {
                    await page.locator(`#stm-${name}-provider`).selectOption(provider);
                    const models = await page.locator(`#stm-${name}-model option`).evaluateAll(nodes => nodes.map(node => node.value));
                    assert.equal(models.length, expected, `${name} ${provider} model count`);
                    assert.equal(new Set(models).size, expected, `${name} ${provider} IDs must be unique`);
                }
                await page.locator(`#stm-${name}-provider`).selectOption('custom');
                assert.deepEqual(await page.locator(`#stm-${name}-protocol option`).evaluateAll(nodes => nodes.map(node => node.value)), protocols);
            }
        });

        await runCase(browser, 'all four custom protocols persist for both profiles', async page => {
            for (const protocol of protocols) {
                const expected = {};
                for (const [index, name] of profiles.entries()) {
                    expected[name] = { protocol, endpoint: `https://${name}.example.invalid/${protocol === 'gemini' ? 'v1beta' : 'v1'}`,
                        model: `local/${name}-${protocol}`, temperature: index === 0 ? '0.4' : '0.8',
                        maxTokens: index === 0 ? '8192' : '4096', key: `TEST-ONLY-FAKE-${name}-${protocol}` };
                    await fillCustom(page, name, expected[name]);
                }
                await page.locator('#stm-enable-second-api').selectOption('true');
                await page.locator('#stm-music-api-profile').selectOption('secondary');
                await save(page);
                await reloadSettings(page);
                for (const name of profiles) await assertCustom(page, name, expected[name]);
                assert.equal(await page.locator('#stm-enable-second-api').inputValue(), 'true');
                assert.equal(await page.locator('#stm-music-api-profile').inputValue(), 'secondary');
                const config = await page.evaluate(() => STMusicApi.getApiProfileConfig());
                for (const name of profiles) assert.deepEqual(config[name], { provider: 'custom', ...expected[name], region: 'cn' });
            }
        });

        await runCase(browser, 'provider drafts restore without reusing another provider key', async page => {
            for (const name of profiles) {
                const originalModel = await page.locator(`#stm-${name}-model`).inputValue();
                await page.locator(`#stm-${name}-key`).fill(`TEST-ONLY-OPENAI-${name}`);
                await page.locator(`#stm-${name}-provider`).selectOption('gemini');
                assert.equal(await page.locator(`#stm-${name}-key`).inputValue(), '', 'a new provider starts with no key');
                await page.locator(`#stm-${name}-key`).fill(`TEST-ONLY-GEMINI-${name}`);
                await page.locator(`#stm-${name}-model`).selectOption('gemini-2.5-pro');
                await page.locator(`#stm-${name}-provider`).selectOption('custom');
                assert.equal(await page.locator(`#stm-${name}-key`).inputValue(), '', 'custom must not inherit an official key');
                const custom = { protocol: 'openai-responses', endpoint: 'http://127.0.0.1:1234/v1', model: `draft-${name}`,
                    temperature: '0.6', maxTokens: '5000', key: '' };
                await fillCustom(page, name, custom);
                await page.locator(`#stm-${name}-provider`).selectOption('openai');
                assert.equal(await page.locator(`#stm-${name}-key`).inputValue(), `TEST-ONLY-OPENAI-${name}`);
                assert.equal(await page.locator(`#stm-${name}-model`).inputValue(), originalModel);
                await page.locator(`#stm-${name}-provider`).selectOption('gemini');
                assert.equal(await page.locator(`#stm-${name}-key`).inputValue(), `TEST-ONLY-GEMINI-${name}`);
                assert.equal(await page.locator(`#stm-${name}-model`).inputValue(), 'gemini-2.5-pro');
                await page.locator(`#stm-${name}-provider`).selectOption('custom');
                await assertCustom(page, name, custom);
            }
        });

        await runCase(browser, 'legacy configuration retains saved models during version 5 migration', async page => {
            assert.equal(await page.evaluate(() => STMusicApi.getApiProfileConfig().version), 5);
            assert.equal(await page.locator('#stm-primary-model').inputValue(), 'gemini-3.5-flash');
            assert.equal(await page.locator('#stm-secondary-model').inputValue(), 'private-saved-legacy-model');
            assert.match(await page.locator('#stm-secondary-model-meta').textContent(), /已保存型号/);
            await save(page);
            await reloadSettings(page);
            const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storeKey);
            assert.equal(stored.version, 5);
            assert.equal(stored.primary.model, 'gemini-3.5-flash');
            assert.equal(stored.secondary.model, 'private-saved-legacy-model');
            assert.equal(await page.locator('#stm-primary-model').inputValue(), stored.primary.model);
            assert.equal(await page.locator('#stm-secondary-model').inputValue(), stored.secondary.model);
        }, { seed: { version: 4, enableSecondApi: true,
            primary: { provider: 'gemini', model: 'gemini-3.5-flash', key: 'TEST-ONLY-OLD-GEMINI' },
            secondary: { provider: 'claude', model: 'private-saved-legacy-model', key: 'TEST-ONLY-OLD-CLAUDE' },
            viewApiMap: { music: 'secondary' } } });

        await runCase(browser, 'MiniMax regions persist independently for primary and secondary', async page => {
            for (const name of profiles) {
                await page.locator(`#stm-${name}-provider`).selectOption('minimax');
                assert.equal(await page.locator(`#stm-${name}-region-field`).isVisible(), true);
                assert.deepEqual(await page.locator(`#stm-${name}-region option`).evaluateAll(nodes => nodes.map(node => node.value)), ['cn', 'global']);
                await page.locator(`#stm-${name}-key`).fill(`TEST-ONLY-MINIMAX-${name}`);
            }
            for (const [primary, secondary] of [['global', 'cn'], ['cn', 'global']]) {
                await page.locator('#stm-primary-region').selectOption(primary);
                await page.locator('#stm-secondary-region').selectOption(secondary);
                await save(page);
                await reloadSettings(page);
                const config = await page.evaluate(() => STMusicApi.getApiProfileConfig());
                assert.equal(config.primary.region, primary);
                assert.equal(config.secondary.region, secondary);
                assert.equal(await page.locator('#stm-primary-region').inputValue(), primary);
                assert.equal(await page.locator('#stm-secondary-region').inputValue(), secondary);
            }
        });

        await runCase(browser, 'local custom secondary routes without an API key', async page => {
            await page.locator('#stm-primary-key').fill('TEST-ONLY-PRIMARY-FALLBACK');
            await fillCustom(page, 'secondary', { protocol: 'openai-chat', endpoint: 'http://127.0.0.1:1234/v1',
                model: 'local/offline-model', key: '', temperature: '', maxTokens: '' });
            await page.locator('#stm-enable-second-api').selectOption('true');
            await page.locator('#stm-music-api-profile').selectOption('secondary');
            await save(page);
            await reloadSettings(page);
            const route = await page.evaluate(() => {
                const profile = STMusicApi.loadApiConfigForView('music');
                return { profile, validationError: STMusicApi.validateApiProfile(profile), endpoint: STMusicApi.resolveCustomEndpoint(profile) };
            });
            assert.equal(route.profile.provider, 'custom');
            assert.equal(route.profile.model, 'local/offline-model');
            assert.equal(route.profile.key, '');
            assert.equal(route.validationError, '');
            assert.equal(route.endpoint, 'http://127.0.0.1:1234/v1/chat/completions');
        });

        await runCase(browser, 'disabled secondary keeps unfinished custom drafts without blocking primary saves', async page => {
            const primaryModel = await page.locator('#stm-primary-model option').nth(1).getAttribute('value');
            for (const [index, endpoint] of ['', 'not-a-valid-url'].entries()) {
                const draft = { protocol: 'openai-chat', endpoint, model: `unfinished-secondary-${index}`,
                    key: '', temperature: '', maxTokens: '' };
                await page.locator('#stm-enable-second-api').selectOption('true');
                await fillCustom(page, 'secondary', draft);
                await page.locator('#stm-enable-second-api').selectOption('false');
                await page.locator('#stm-primary-model').selectOption(primaryModel);
                await page.locator('#stm-primary-key').fill(`TEST-ONLY-UPDATED-PRIMARY-${index}`);
                await save(page);
                await reloadSettings(page);
                const config = await page.evaluate(() => STMusicApi.getApiProfileConfig());
                assert.equal(config.enableSecondApi, false);
                assert.equal(config.primary.model, primaryModel, 'the enabled primary changes must be saved');
                assert.equal(config.primary.key, `TEST-ONLY-UPDATED-PRIMARY-${index}`);
                assert.deepEqual(config.secondary, { provider: 'custom', ...draft, region: 'cn' });
                await page.locator('#stm-enable-second-api').selectOption('true');
                await assertCustom(page, 'secondary', draft);
                assert.equal(await page.locator('#stm-enable-second-api').inputValue(), 'true');
            }
        });

        for (const [width, height] of [[320, 568], [375, 667], [844, 390]]) {
            await runCase(browser, `${width}x${height} custom settings fit and use touch-sized input text`, async page => {
                for (const name of profiles) await fillCustom(page, name, {
                    protocol: 'openai-responses', endpoint: 'https://a-long-custom-model-gateway.example.invalid/proxy/v1',
                    model: 'organization/long-local-language-model-name-2026-preview', temperature: '0.7', maxTokens: '32768', key: '',
                });
                const layout = await page.evaluate(() => {
                    const visible = element => element.getClientRects().length > 0;
                    const measurements = Array.from(document.querySelectorAll('#stm-page-settings .stm-settings-card, #stm-page-settings .stm-settings-field, #stm-page-settings .stm-form-scroll, #st-music-panel, #stm-page-settings')).filter(visible).map(element => {
                        const rect = element.getBoundingClientRect();
                        return { label: element.id || element.className, left: rect.left, right: rect.right, width: rect.width,
                            scrollWidth: element.scrollWidth, clientWidth: element.clientWidth };
                    });
                    const controls = Array.from(document.querySelectorAll('#stm-page-settings input, #stm-page-settings select')).filter(visible).map(element => {
                        const rect = element.getBoundingClientRect();
                        return { id: element.id, left: rect.left, right: rect.right, width: rect.width, fontSize: parseFloat(getComputedStyle(element).fontSize) };
                    });
                    return { measurements, controls, documentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth };
                });
                assert.ok(layout.documentWidth <= width + 1, 'document must not scroll horizontally');
                for (const item of layout.measurements) {
                    assert.ok(item.width > 0 && item.left >= -1 && item.right <= width + 1, `${item.label} should remain within viewport: ${JSON.stringify(item)}`);
                    assert.ok(item.scrollWidth <= item.clientWidth + 1, `${item.label} must not overflow horizontally: ${JSON.stringify(item)}`);
                }
                for (const control of layout.controls) {
                    assert.ok(control.width > 0 && control.left >= -1 && control.right <= width + 1, `${control.id} should fit the viewport`);
                    assert.ok(control.fontSize >= 16, `${control.id} needs at least 16px input text, got ${control.fontSize}`);
                }
                for (const name of profiles) {
                    await page.locator(`#stm-${name}-endpoint`).scrollIntoViewIfNeeded();
                    await page.screenshot({ path: path.join(output, `${width}x${height}-${name}-custom.png`) });
                }
                await save(page);
            }, { width, height });
        }
        fs.writeFileSync(path.join(output, 'api-settings-results.json'), JSON.stringify(results, null, 2));
        console.log(`Screenshots and results: ${output}`);
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
