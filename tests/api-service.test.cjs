const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

// Run the shipped catalog and API adapters, replacing only browser I/O. No real
// network requests, provider credentials, or user browser storage are used.
const projectRoot = path.join(__dirname, '..');
const STORE_KEY = 'st_music_independent_api_config';
const messages = [
    { role: 'system', content: 'Write a music note.' },
    { role: 'user', content: 'Use a piano.' },
    { role: 'assistant', content: 'What tempo?' },
    { role: 'user', content: '90 BPM.' },
];
const answer = '<music>Test song</music>';
const payloads = {
    chat: { choices: [{ finish_reason: 'stop', message: { role: 'assistant', content: answer } }] },
    responses: { output: [{ type: 'reasoning', summary: [] }, { type: 'message', content: [{ type: 'output_text', text: answer }] }] },
    anthropic: { content: [{ type: 'thinking', thinking: 'Internal reasoning' }, { type: 'text', text: answer }], stop_reason: 'end_turn' },
    gemini: { candidates: [{ content: { role: 'model', parts: [{ text: answer }] }, finishReason: 'STOP' }] },
};
const plain = value => JSON.parse(JSON.stringify(value));

function harness({ payload = payloads.chat, storage = new Map(), fetchError, status = 200 } = {}) {
    const calls = [];
    const logs = [];
    const log = (...args) => logs.push(args.map(arg => arg instanceof Error ? `${arg.name}: ${arg.message}` : typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' '));
    const window = {};
    const context = vm.createContext({
        window, URL, AbortController, setTimeout, clearTimeout, Error,
        localStorage: {
            getItem: key => storage.get(key) ?? null,
            setItem: (key, value) => storage.set(key, String(value)),
            removeItem: key => storage.delete(key),
        },
        console: { info: log, warn: log, error: log, log, groupCollapsed: log, groupEnd() {} },
        fetch: async (url, init) => {
            calls.push({ url: String(url), init, body: JSON.parse(init.body) });
            if (fetchError) throw fetchError;
            return {
                ok: status >= 200 && status < 300, status,
                json: async () => plain(payload),
                text: async () => JSON.stringify(payload),
            };
        },
    });
    for (const name of ['ModelCatalog.js', 'ApiService.js']) {
        vm.runInContext(fs.readFileSync(path.join(projectRoot, name), 'utf8'), context, { filename: name });
    }
    return { api: window.STMusicApi, calls, logs, storage };
}

function custom(overrides = {}) {
    return { provider: 'custom', protocol: 'openai-chat', endpoint: 'http://localhost:1234/v1', model: 'local-model', key: '', ...overrides };
}

function header(call, name) {
    return Object.entries(call.init.headers).find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1];
}

function assertConversation(actual) {
    assert.deepEqual(plain(actual), messages.filter(message => message.role !== 'system'));
}

test('the catalog exposes five official providers and an independent custom option', () => {
    const { api } = harness();
    const providers = api.getProviderDefinitions();
    assert.deepEqual(Object.keys(providers).sort(), ['claude', 'custom', 'deepseek', 'gemini', 'minimax', 'openai']);
    assert.equal(providers.custom.label, '自定义');
    for (const [id, provider] of Object.entries(providers)) {
        if (id === 'custom') continue;
        assert.ok(provider.models.length > 0, `${id} has models`);
        assert.equal(new Set(provider.models.map(model => model.value)).size, provider.models.length, `${id} has no duplicate model IDs`);
        assert.ok(provider.models.some(model => model.value === provider.defaultModel), `${id} default is selectable`);
    }
    assert.ok(providers.deepseek.models.some(model => model.value === 'deepseek-flash'));
    assert.ok(providers.minimax.models.some(model => model.value === 'MiniMax-M3.1-Flash'));
    // Mutating a UI copy must not change subsequent choices or requests.
    providers.deepseek.models[0].value = 'tampered';
    assert.notEqual(api.getProviderDefinitions().deepseek.models[0].value, 'tampered');
});

test('v4 saved model IDs survive migration and custom settings survive a fresh runtime', () => {
    const storage = new Map([[STORE_KEY, JSON.stringify({
        version: 4,
        primary: { provider: 'deepseek', model: 'previously-selected-model', key: 'test-legacy-key' },
    })]]);
    const { api } = harness({ storage });
    assert.equal(api.getApiProfileConfig().version, 5);
    assert.equal(api.getApiProfileConfig().primary.model, 'previously-selected-model');
    const config = {
        ...api.getApiProfileConfig(),
        enableSecondApi: true,
        primary: custom({ endpoint: 'https://proxy.example/api/v1?workspace=music', model: 'my-custom-model', protocol: 'openai-responses', key: 'test-only-key', temperature: '0.7', maxTokens: '4096' }),
        secondary: { provider: 'minimax', model: 'MiniMax-M3', region: 'global', key: 'test-minimax-key' },
        viewApiMap: { music: 'secondary' },
    };
    assert.equal(api.saveApiProfileConfig(config), true);
    const restored = harness({ storage }).api.getApiProfileConfig();
    for (const field of ['provider', 'endpoint', 'model', 'protocol', 'key', 'temperature', 'maxTokens']) {
        assert.equal(restored.primary[field], config.primary[field], `preserved ${field}`);
    }
    assert.equal(restored.secondary.region, 'global');
    assert.equal(restored.enableSecondApi, true);
    assert.equal(restored.viewApiMap.music, 'secondary');
});

test('secondary routing accepts keyless local custom API and falls back for an unusable profile', () => {
    const { api } = harness();
    const primary = { provider: 'deepseek', model: 'deepseek-flash', key: 'test-primary-key' };
    const save = (secondary, enableSecondApi = true) => api.saveApiProfileConfig({ primary, secondary, enableSecondApi, viewApiMap: { music: 'secondary' } });
    save(custom());
    assert.equal(api.loadApiConfigForView('music').provider, 'custom');
    save(custom({ endpoint: 'not a URL' }));
    assert.equal(api.loadApiConfigForView('music').provider, 'deepseek');
    save({ provider: 'claude', model: 'a-saved-claude-model', key: '' });
    assert.equal(api.loadApiConfigForView('music').provider, 'deepseek');
    save(custom(), false);
    assert.equal(api.loadApiConfigForView('music').provider, 'deepseek');
});

test('changing an override provider starts from that provider defaults and never inherits routed credentials', async () => {
    const { api, calls } = harness();
    api.saveApiProfileConfig({
        primary: { provider: 'openai', model: 'gpt-6.1-sol', key: 'test-primary-key' },
        secondary: custom({ endpoint: 'https://old-provider.example/v1', model: 'secondary-custom-model', key: 'test-secondary-key' }),
        enableSecondApi: true, viewApiMap: { music: 'secondary' },
    });
    const noKey = await api.callIndependentApi(messages, { provider: 'deepseek' });
    assert.equal(noKey.success, false);
    assert.equal(calls.length, 0, 'a different official provider requires its own key');
    const switched = await api.callIndependentApi(messages, { provider: 'deepseek', key: 'test-deepseek-key' });
    assert.equal(switched.success, true);
    assert.equal(calls[0].url, 'https://api.deepseek.com/chat/completions');
    assert.equal(calls[0].body.model, api.getProviderDefinitions().deepseek.defaultModel);
    assert.equal(header(calls[0], 'Authorization'), 'Bearer test-deepseek-key');

    api.saveApiProfileConfig({ primary: { provider: 'openai', model: 'gpt-6.1-sol', key: 'test-primary-key' } });
    const keyless = await api.callIndependentApi(messages, { provider: 'custom', endpoint: 'http://localhost:8000/v1', model: 'local-model' });
    assert.equal(keyless.success, true);
    assert.equal(header(calls[1], 'Authorization'), undefined, 'OpenAI credentials never go to a newly selected custom target');
    assert.equal(calls[1].body.model, 'local-model');
});

test('custom endpoint overrides and endpoint aliases never inherit the previous target key', async t => {
    for (const field of ['endpoint', 'baseUrl', 'url']) await t.test(field, async () => {
        const { api, calls } = harness();
        api.saveApiProfileConfig({ primary: custom({ endpoint: 'https://old-provider.example/v1', key: 'test-old-host-key' }) });
        const result = await api.callIndependentApi(messages, { [field]: 'http://localhost:9000/v1', model: 'another-model' });
        assert.equal(result.success, true);
        assert.equal(calls[0].url, 'http://localhost:9000/v1/chat/completions');
        assert.equal(calls[0].body.model, 'another-model');
        assert.equal(header(calls[0], 'Authorization'), undefined);
        const explicitKey = await api.callIndependentApi(messages, { [field]: 'https://new-provider.example/v1', key: 'test-new-host-key' });
        assert.equal(explicitKey.success, true);
        assert.equal(header(calls[1], 'Authorization'), 'Bearer test-new-host-key');
        assert.equal(api.getApiProfileConfig().primary.endpoint, 'https://old-provider.example/v1');
        assert.equal(api.getApiProfileConfig().primary.key, 'test-old-host-key', 'temporary overrides do not modify saved credentials');
    });
});

test('a model-only override retains same-target credentials while a MiniMax region change requires its own key', async () => {
    const { api, calls } = harness();
    api.saveApiProfileConfig({ primary: custom({ endpoint: 'https://same-provider.example/v1', model: 'old-model', key: 'test-same-host-key' }) });
    const sameTarget = await api.callIndependentApi(messages, { model: 'new-model' });
    assert.equal(sameTarget.success, true);
    assert.equal(calls[0].body.model, 'new-model');
    assert.equal(header(calls[0], 'Authorization'), 'Bearer test-same-host-key');
    api.saveApiProfileConfig({ primary: { provider: 'minimax', model: 'MiniMax-M3', key: 'test-cn-key', region: 'cn' } });
    const wrongRegionKey = await api.callIndependentApi(messages, { region: 'global' });
    assert.equal(wrongRegionKey.success, false);
    assert.equal(calls.length, 1, 'China credentials are not sent to the global platform');
    const global = await api.callIndependentApi(messages, { region: 'global', key: 'test-global-key' });
    assert.equal(global.success, true);
    assert.equal(calls[1].url, 'https://api.minimax.io/v1/chat/completions');
    assert.equal(header(calls[1], 'Authorization'), 'Bearer test-global-key');
    assert.equal(api.getApiProfileConfig().primary.region, 'cn');
});

test('custom Chat Completions supports local keyless APIs and preserves conversation and numeric controls', async () => {
    const { api, calls } = harness();
    const result = await api.callIndependentApi(messages, custom({ temperature: '0', maxTokens: '1024' }));
    assert.equal(result.success, true);
    assert.equal(result.content, answer);
    assert.equal(calls.length, 1);
    const call = calls[0];
    assert.equal(call.url, 'http://localhost:1234/v1/chat/completions');
    assert.equal(call.init.method, 'POST');
    assert.equal(header(call, 'Content-Type'), 'application/json');
    assert.equal(header(call, 'Authorization'), undefined);
    assert.equal(call.body.model, 'local-model');
    assert.deepEqual(call.body.messages, messages);
    assert.equal(call.body.temperature, 0);
    assert.equal(call.body.max_tokens, 1024);
});

test('custom Responses uses instructions/input and parses output text blocks', async () => {
    const { api, calls } = harness({ payload: payloads.responses });
    const result = await api.callIndependentApi(messages, custom({ protocol: 'openai-responses', endpoint: 'https://proxy.example', key: 'test-response-key', temperature: '0.7', maxTokens: '2048' }));
    assert.equal(result.success, true);
    assert.equal(result.content, answer);
    const call = calls[0];
    assert.equal(call.url, 'https://proxy.example/v1/responses');
    assert.equal(header(call, 'Authorization'), 'Bearer test-response-key');
    assert.equal(call.body.instructions, messages[0].content);
    assertConversation(call.body.input);
    assert.equal(call.body.max_output_tokens, 2048);
    assert.equal(call.body.temperature, 0.7);
});

test('custom Anthropic uses messages/system and ignores thinking response blocks', async () => {
    const { api, calls } = harness({ payload: payloads.anthropic });
    const result = await api.callIndependentApi(messages, custom({ protocol: 'anthropic', endpoint: 'https://proxy.example/anthropic/v1', key: 'test-anthropic-key', maxTokens: '2048', temperature: '0.5' }));
    assert.equal(result.success, true);
    assert.equal(result.content, answer);
    const call = calls[0];
    assert.equal(call.url, 'https://proxy.example/anthropic/v1/messages');
    assert.equal(header(call, 'x-api-key'), 'test-anthropic-key');
    assert.equal(header(call, 'anthropic-version'), '2023-06-01');
    assert.equal(call.body.system, messages[0].content);
    assertConversation(call.body.messages);
    assert.equal(call.body.max_tokens, 2048);
    assert.equal(call.body.temperature, 0.5);
});

test('custom Gemini uses generateContent and preserves role history', async () => {
    const { api, calls } = harness({ payload: payloads.gemini });
    const result = await api.callIndependentApi(messages, custom({ protocol: 'gemini', endpoint: 'https://proxy.example/v1beta', model: 'models/custom-gemini', key: 'test-google-key', maxTokens: '2048', temperature: '0.6' }));
    assert.equal(result.success, true);
    assert.equal(result.content, answer);
    const call = calls[0];
    assert.equal(call.url, 'https://proxy.example/v1beta/models/custom-gemini:generateContent');
    assert.equal(header(call, 'x-goog-api-key'), 'test-google-key');
    assert.equal(call.body.systemInstruction.parts[0].text, messages[0].content);
    assert.deepEqual(call.body.contents, [
        { role: 'user', parts: [{ text: 'Use a piano.' }] },
        { role: 'model', parts: [{ text: 'What tempo?' }] },
        { role: 'user', parts: [{ text: '90 BPM.' }] },
    ]);
    assert.equal(call.body.generationConfig.maxOutputTokens, 2048);
    assert.equal(call.body.generationConfig.temperature, 0.6);
    assert.equal(new URL(call.url).searchParams.has('key'), false);
});

test('text response variants keep readable content and omit Gemini thought parts', async () => {
    const chat = harness({ payload: { choices: [{ message: { content: [{ type: 'text', text: '<music>' }, { type: 'text', text: 'Test song</music>' }] } }] } });
    const chatResult = await chat.api.callIndependentApi(messages, custom());
    assert.equal(chatResult.success, true);
    assert.equal(chatResult.content, answer);
    const gemini = harness({ payload: { candidates: [{ content: { parts: [{ thought: true, text: 'Internal reasoning' }, { text: answer }] } }] } });
    const geminiResult = await gemini.api.callIndependentApi(messages, custom({ protocol: 'gemini', endpoint: 'http://localhost:1234/v1beta' }));
    assert.equal(geminiResult.success, true);
    assert.equal(geminiResult.content, answer);
});

test('base URLs and complete custom endpoints retain path prefixes and query parameters', () => {
    const { api } = harness();
    for (const [protocol, endpoint, expected, model = 'local-model'] of [
        ['openai-chat', 'http://localhost:1234', 'http://localhost:1234/v1/chat/completions'],
        ['openai-chat', 'https://proxy.example/custom/v1/?tenant=music', 'https://proxy.example/custom/v1/chat/completions?tenant=music'],
        ['openai-responses', 'https://proxy.example/v1/responses?api-version=test', 'https://proxy.example/v1/responses?api-version=test'],
        ['anthropic', 'https://proxy.example', 'https://proxy.example/v1/messages'],
        ['anthropic', 'https://proxy.example/anthropic/v1/messages?route=fast', 'https://proxy.example/anthropic/v1/messages?route=fast'],
        ['gemini', 'https://proxy.example', 'https://proxy.example/v1beta/models/local-model:generateContent'],
        ['gemini', 'https://proxy.example/v1beta/models/deployment-name:generateContent?tenant=music', 'https://proxy.example/v1beta/models/deployment-name:generateContent?tenant=music', 'deployment-name'],
        ['gemini', 'https://proxy.example/v1beta/models/deployment-name:generateContent?tenant=music', 'https://proxy.example/v1beta/models/deployment-name:generateContent?tenant=music', 'models/deployment-name'],
    ]) {
        assert.equal(api.resolveCustomEndpoint(api.normalizeApiProfile(custom({ protocol, endpoint, model }))), expected);
    }
});

test('invalid endpoint, protocol mismatch, model and numeric input fail before fetch', async t => {
    const invalid = [
        ['missing URL', { endpoint: '' }],
        ['relative URL', { endpoint: '/v1' }],
        ['non-HTTP URL', { endpoint: 'ftp://proxy.example/v1' }],
        ['URL credentials', { endpoint: 'https://user:password@proxy.example/v1' }],
        ['URL fragment', { endpoint: 'https://proxy.example/v1#fragment' }],
        ['missing model', { model: ' ' }],
        ['nonnumeric temperature', { temperature: 'NaN' }],
        ['negative temperature', { temperature: '-1' }],
        ['too-high temperature', { temperature: '2.1' }],
        ['zero tokens', { maxTokens: '0' }],
        ['fractional tokens', { maxTokens: '1.5' }],
        ['infinite tokens', { maxTokens: 'Infinity' }],
        ['unsafe integer tokens', { maxTokens: '9007199254740992' }],
        ['Chat with Messages URL', { endpoint: 'https://proxy.example/v1/messages' }],
        ['Anthropic with Chat URL', { protocol: 'anthropic', endpoint: 'https://proxy.example/v1/chat/completions' }],
        ['Chat with Gemini URL', { endpoint: 'https://proxy.example/v1beta/models/model:generateContent' }],
        ['Gemini with Chat URL', { protocol: 'gemini', endpoint: 'https://proxy.example/v1/chat/completions' }],
        ['Gemini URL and selected model disagree', { protocol: 'gemini', endpoint: 'https://proxy.example/v1beta/models/previous-model:generateContent?tenant=music', model: 'new-model' }],
    ];
    for (const [label, overrides] of invalid) await t.test(label, async () => {
        const { api, calls } = harness();
        const profile = custom(overrides);
        assert.ok(api.validateApiProfile(profile), 'validation returns an actionable error');
        const result = await api.callIndependentApi(messages, profile);
        assert.equal(result.success, false);
        assert.ok(result.error);
        assert.equal(calls.length, 0, 'invalid input must not leave the browser');
    });
});

test('official providers require a key, while a local custom service does not', async () => {
    const { api, calls } = harness();
    for (const provider of ['openai', 'gemini', 'claude', 'deepseek', 'minimax']) {
        const result = await api.callIndependentApi(messages, { provider, key: '' });
        assert.equal(result.success, false, provider);
    }
    assert.equal(calls.length, 0);
    assert.equal(api.validateApiProfile(custom()), '');
});

test('official provider adapters use their documented text-generation contracts', async t => {
    for (const provider of ['openai', 'gemini', 'claude', 'deepseek', 'minimax']) await t.test(provider, async () => {
        const payload = provider === 'openai' ? payloads.responses : provider === 'claude' ? payloads.anthropic : provider === 'gemini' ? payloads.gemini : payloads.chat;
        const { api, calls } = harness({ payload });
        const model = api.getProviderDefinitions()[provider].defaultModel;
        const result = await api.callIndependentApi(messages, { provider, model, key: 'test-provider-key' });
        assert.equal(result.success, true);
        assert.equal(result.content, answer);
        assert.equal(calls.length, 1);
        const call = calls[0];
        assert.equal(call.init.method, 'POST');
        if (provider === 'openai') {
            assert.equal(call.url, 'https://api.openai.com/v1/responses');
            assert.equal(call.body.model, model);
            assert.equal(header(call, 'Authorization'), 'Bearer test-provider-key');
            assert.ok(call.body.input);
        } else if (provider === 'gemini') {
            assert.equal(new URL(call.url).hostname, 'generativelanguage.googleapis.com');
            assert.ok(new URL(call.url).pathname.endsWith(`/models/${model}:generateContent`));
            assert.ok(call.body.contents);
            assert.equal(header(call, 'x-goog-api-key'), 'test-provider-key');
        } else if (provider === 'claude') {
            assert.equal(call.url, 'https://api.anthropic.com/v1/messages');
            assert.equal(header(call, 'x-api-key'), 'test-provider-key');
            assert.equal(header(call, 'anthropic-version'), '2023-06-01');
            assert.ok(call.body.max_tokens > 0);
            assertConversation(call.body.messages);
        } else if (provider === 'deepseek') {
            assert.equal(call.url, 'https://api.deepseek.com/chat/completions');
            assert.equal(call.body.model, model);
            assert.equal(header(call, 'Authorization'), 'Bearer test-provider-key');
            assert.deepEqual(call.body.messages, messages);
        } else {
            assert.equal(call.url, 'https://api.minimax.cn/v1/chat/completions');
            assert.equal(call.body.model, model);
            assert.equal(header(call, 'Authorization'), 'Bearer test-provider-key');
            assert.deepEqual(call.body.messages, messages);
            assert.notEqual(call.body.thinking?.type, 'disabled', 'M3.1 Flash requires thinking');
            assert.notEqual(call.body.reasoning_effort, 'none', 'M3.1 Flash rejects none');
            assert.equal(call.body.reasoning_split, true);
            assert.ok(call.body.max_completion_tokens >= 4096, 'thinking has room before the final music note');
        }
    });
});

test('MiniMax region chooses the matching public API host and separates reasoning', async () => {
    const { api, calls } = harness({ payload: { choices: [{ message: { reasoning_content: 'Internal reasoning', content: answer }, finish_reason: 'stop' }] } });
    const result = await api.callIndependentApi(messages, { provider: 'minimax', region: 'global', model: 'MiniMax-M3', key: 'test-minimax-key' });
    assert.equal(result.success, true);
    assert.equal(result.content, answer);
    assert.equal(calls[0].url, 'https://api.minimax.io/v1/chat/completions');
    assert.equal(calls[0].body.model, 'MiniMax-M3');
});

test('OpenAI search model uses its required Chat Completions endpoint and preserves citations', async () => {
    const citation = { type: 'url_citation', url_citation: { url: 'https://example.org/source', title: 'Source', start_index: 0, end_index: 5 } };
    const { api, calls } = harness({ payload: { choices: [{ message: { content: answer, annotations: [citation] } }] } });
    const result = await api.callIndependentApi(messages, { provider: 'openai', model: 'gpt-5-search-api', key: 'test-search-key' });
    assert.equal(result.success, true);
    assert.equal(result.content, answer);
    assert.equal(calls[0].url, 'https://api.openai.com/v1/chat/completions');
    assert.equal(calls[0].body.model, 'gpt-5-search-api');
    assert.deepEqual(calls[0].body.web_search_options, {});
    assert.deepEqual(plain(result.citations), [{ url: 'https://example.org/source', title: 'Source' }]);
});

test('empty and failed upstream responses return useful failures instead of fabricated content', async t => {
    for (const [label, options] of [
        ['HTTP failure', { status: 401, payload: { error: { message: 'Invalid credential' } } }],
        ['empty response', { payload: { choices: [{ message: { content: '' } }] } }],
        ['reasoning-only truncation', { payload: { choices: [{ finish_reason: 'length', message: { content: '', reasoning_content: 'unfinished' } }] } }],
        ['network failure', { fetchError: new Error('network unavailable') }],
    ]) await t.test(label, async () => {
        const { api } = harness(options);
        const result = await api.callIndependentApi(messages, custom());
        assert.equal(result.success, false);
        assert.equal(result.content, '');
        assert.ok(result.error);
    });
});

test('saving and calling APIs never prints the configured API key, including upstream exceptions', async () => {
    const secret = 'test-key-must-never-be-logged-76931';
    const { api, logs } = harness({ fetchError: new Error(`upstream rejected key ${secret}`) });
    const profile = custom({ key: secret });
    assert.equal(api.saveApiProfileConfig({ primary: profile }), true);
    api.getApiProfileConfig();
    await api.callIndependentApi(messages, profile);
    assert.equal(logs.join('\n').includes(secret), false);
});
