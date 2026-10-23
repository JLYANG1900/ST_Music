const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

// Exercise the shipped browser code without starting the host-dependent plugin.
// Layout, touch gestures, and viewport changes still require browser validation.
const source = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8')
    .replaceAll('import.meta.url', '"https://st-music.test/index.js"')
    .replace(/\bSTMusic\.init\(\);\s*\}\s*$/, '}');

function createHarness({ clipboard, copyResult = true, playError = null } = {}) {
    const elements = new Map();
    const copied = [];
    const createdUrls = [];
    const revokedUrls = [];
    const notifications = [];
    const manualCopies = [];
    let document;

    function element(tagName = 'div') {
        const attrs = new Map();
        const classes = new Set();
        let html = '';
        let deleteButton = null;
        return {
            tagName: tagName.toUpperCase(),
            style: {}, dataset: {}, children: [], value: '', parentNode: null,
            classList: {
                add(...names) { names.forEach(name => classes.add(name)); },
                remove(...names) { names.forEach(name => classes.delete(name)); },
                contains(name) { return classes.has(name); },
                toggle(name, force) {
                    const enabled = force ?? !classes.has(name);
                    if (enabled) classes.add(name); else classes.delete(name);
                    return enabled;
                },
            },
            set innerHTML(value) {
                html = value;
                this.children = [];
                deleteButton = value.includes('class="stm-track-delete"') ? element('button') : null;
            },
            get innerHTML() { return html; },
            appendChild(child) {
                this.children.push(child);
                child.parentNode = this;
                return child;
            },
            removeChild(child) {
                this.children = this.children.filter(candidate => candidate !== child);
                child.parentNode = null;
                return child;
            },
            remove() { this.parentNode?.removeChild(this); },
            setAttribute(name, value) { attrs.set(name, String(value)); },
            getAttribute(name) { return attrs.get(name) ?? null; },
            removeAttribute(name) { attrs.delete(name); },
            focus() { document.activeElement = this; },
            select() { document.selectedText = this.value; },
            setSelectionRange(start, end, direction) {
                this.selectionStart = start;
                this.selectionEnd = end;
                this.selectionDirection = direction;
                document.selectedText = this.value.slice(start, end);
            },
            querySelector(selector) { return selector === '.stm-track-delete' ? deleteButton : null; },
            querySelectorAll() { return []; },
            addEventListener() {},
            dispatchEvent() { return true; },
            getBoundingClientRect() { return { x: 0, y: 0, top: 0, left: 0, width: 44, height: 44 }; },
        };
    }

    document = {
        activeElement: null, selectedText: '',
        createElement: element,
        getElementById(id) { return elements.get(id) ?? null; },
        querySelector() { return null; }, querySelectorAll() { return []; },
        execCommand(command) {
            assert.equal(command, 'copy');
            if (copyResult) copied.push(this.selectedText);
            return copyResult;
        },
        addEventListener() {},
    };
    document.body = element('body');
    document.documentElement = element('html');

    const audio = {
        src: '', paused: true, playCalls: 0, pauseCalls: 0, loadCalls: 0,
        play() {
            this.playCalls++;
            if (playError) return Promise.reject(playError);
            this.paused = false;
            this.onplay?.();
            return Promise.resolve();
        },
        pause() { this.pauseCalls++; this.paused = true; this.onpause?.(); },
        load() { this.loadCalls++; },
        getAttribute(name) { return name === 'src' ? this.src || null : null; },
        removeAttribute(name) { if (name === 'src') this.src = ''; },
        addEventListener(name, handler) { this[`on${name}`] = handler; },
    };
    elements.set('stm-audio-player', audio);
    elements.set('stm-btn-play', element('button'));
    elements.set('stm-playlist', element());

    class TestURL extends URL {}
    TestURL.createObjectURL = file => {
        const url = `blob:st-music-test/${createdUrls.length + 1}`;
        createdUrls.push({ file, url });
        return url;
    };
    TestURL.revokeObjectURL = url => revokedUrls.push(url);
    const storage = new Map();
    const window = {
        innerWidth: 390, innerHeight: 844, isSecureContext: Boolean(clipboard),
        addEventListener() {},
        getSelection() { return null; },
        prompt(message, text) { manualCopies.push({ message, text }); return null; },
    };
    const context = vm.createContext({
        window, document, navigator: { userAgent: 'mobile compatibility test', clipboard },
        URL: TestURL, Event,
        console: { log() {}, warn() {}, error() {} },
        toastr: Object.fromEntries(['success', 'error', 'info', 'warning'].map(type => [type, text => notifications.push({ type, text })])),
        localStorage: {
            getItem(key) { return storage.get(key) ?? null; },
            setItem(key, value) { storage.set(key, value); },
        },
        setTimeout, clearTimeout,
    });
    vm.runInContext(source, context, { filename: 'ST_Music/index.js' });
    return { music: window.STMusic, document, elements, audio, copied, createdUrls, revokedUrls, notifications, manualCopies, element };
}

async function settle() {
    await new Promise(resolve => setImmediate(resolve));
}

test('copy uses the modern Clipboard API when available', async () => {
    const writes = [];
    const h = createHarness({ clipboard: { async writeText(text) { writes.push(text); } } });
    assert.equal(await h.music.writeClipboardText('歌词\n[Chorus]'), true);
    assert.deepEqual(writes, ['歌词\n[Chorus]']);
    assert.deepEqual(h.copied, []);
});

test('HTTP clipboard fallback copies text, removes its textarea, and restores focus', async () => {
    const h = createHarness();
    const previousInput = h.element('input');
    previousInput.value = 'original input text';
    h.document.body.appendChild(previousInput);
    previousInput.focus();
    previousInput.setSelectionRange(3, 8, 'forward');
    assert.equal(await h.music.writeClipboardText('手机局域网复制'), true);
    assert.deepEqual(h.copied, ['手机局域网复制']);
    assert.equal(h.document.activeElement, previousInput);
    assert.equal(previousInput.selectionStart, 3);
    assert.equal(previousInput.selectionEnd, 8);
    assert.equal(previousInput.selectionDirection, 'forward');
    assert.deepEqual(h.document.body.children, [previousInput]);
});

test('a rejected Clipboard API falls back without losing the text', async () => {
    const h = createHarness({ clipboard: { async writeText() { throw new Error('Permission denied'); } } });
    assert.equal(await h.music.writeClipboardText('保留 [Verse] 标签'), true);
    assert.deepEqual(h.copied, ['保留 [Verse] 标签']);
});

test('an unavailable clipboard reports failure without claiming a successful copy', async () => {
    const h = createHarness({ copyResult: false });
    assert.equal(await h.music.writeClipboardText('无法复制'), false);
    assert.deepEqual(h.copied, []);
    assert.equal(h.document.body.children.length, 0);
    assert.equal(h.manualCopies[0].text, '无法复制');
});

test('pressing play after first import selects the first track and assigns its source', async () => {
    const h = createHarness();
    h.music.bindPlayerEvents();
    const files = [{ name: '第一首.mp3' }, { name: '第二首.ogg' }];
    h.music.handleFileUpload({ target: { files, value: 'selected-files' } });
    h.elements.get('stm-btn-play').onclick();
    await settle();
    assert.equal(h.music.player.currentTrackIndex, 0);
    assert.equal(h.audio.src, h.music.player.playlist[0].url);
    assert.equal(h.audio.playCalls, 1);
    assert.equal(h.music.player.isPlaying, true);
    assert.match(h.elements.get('stm-btn-play').innerHTML, /fa-pause/);
});

test('a browser playback rejection leaves playback state and button stopped', async () => {
    const h = createHarness({ playError: new Error('NotAllowedError') });
    h.music.bindPlayerEvents();
    h.music.player.playlist.push({ name: 'A', url: 'https://example.test/song.mp3', type: 'link' });
    h.music.togglePlay();
    await settle();
    assert.equal(h.audio.playCalls, 1);
    assert.equal(h.music.player.isPlaying, false);
    assert.match(h.elements.get('stm-btn-play').innerHTML, /fa-play/);
    assert.ok(h.notifications.some(item => item.type === 'error'));
});

test('a failed resume also restores stopped state after an earlier successful play', async () => {
    const h = createHarness();
    h.music.bindPlayerEvents();
    h.music.player.playlist.push({ name: 'A', url: 'https://example.test/song.mp3', type: 'link' });
    h.music.togglePlay();
    await settle();
    h.music.togglePlay();
    assert.equal(h.music.player.isPlaying, false);
    h.audio.play = () => Promise.reject(new Error('Media unavailable'));
    h.music.togglePlay();
    await settle();
    assert.equal(h.music.player.isPlaying, false);
    assert.match(h.elements.get('stm-btn-play').innerHTML, /fa-play/);
});

test('an older play request rejecting after a track switch cannot stop the new track', async () => {
    const h = createHarness();
    h.music.bindPlayerEvents();
    h.music.player.playlist.push(
        { name: 'A', url: 'https://example.test/a.mp3', type: 'link' },
        { name: 'B', url: 'https://example.test/b.mp3', type: 'link' },
    );
    let rejectFirst;
    h.audio.play = () => {
        h.audio.paused = false;
        h.audio.onplay?.();
        return new Promise((resolve, reject) => { rejectFirst = reject; });
    };
    h.music.playTrack(0);
    h.audio.play = () => { h.audio.paused = false; h.audio.onplay?.(); return Promise.resolve(); };
    h.music.playTrack(1);
    await settle();
    rejectFirst(new Error('Previous source was interrupted'));
    await settle();
    assert.equal(h.music.player.currentTrackIndex, 1);
    assert.equal(h.music.player.isPlaying, true);
    assert.equal(h.audio.src, 'https://example.test/b.mp3');
    assert.match(h.elements.get('stm-btn-play').innerHTML, /fa-pause/);
    assert.equal(h.notifications.filter(item => item.type === 'error').length, 0);
});

test('native media pause and error events keep the mobile player controls in sync', async () => {
    const h = createHarness();
    h.music.bindPlayerEvents();
    h.music.player.playlist.push({ name: 'A', url: 'https://example.test/a.mp3', type: 'link' });
    h.music.togglePlay();
    await settle();
    assert.equal(h.music.player.isPlaying, true);
    // Phone backgrounding and native media controls can pause outside togglePlay().
    h.audio.pause();
    assert.equal(h.music.player.isPlaying, false);
    assert.match(h.elements.get('stm-btn-play').innerHTML, /fa-play/);
    h.music.togglePlay();
    await settle();
    assert.equal(h.music.player.isPlaying, true);
    h.audio.onerror();
    assert.equal(h.music.player.isPlaying, false);
    assert.match(h.elements.get('stm-btn-play').innerHTML, /fa-play/);
});

test('multiple file selection imports every track and permits selecting the same files again', () => {
    const h = createHarness();
    const files = [{ name: '第一首.mp3' }, { name: 'second.track.ogg' }, { name: 'third.wav' }];
    const target = { files, value: 'selected-files' };
    h.music.handleFileUpload({ target });
    assert.deepEqual(Array.from(h.music.player.playlist, track => track.name), ['第一首', 'second.track', 'third']);
    assert.deepEqual(h.createdUrls.map(item => item.file), files);
    assert.equal(target.value, '');
});

test('deleting the current local track releases its blob and clears the audio source', async () => {
    const h = createHarness();
    h.music.bindPlayerEvents();
    h.music.handleFileUpload({ target: { files: [{ name: 'local.mp3' }], value: '' } });
    h.music.togglePlay();
    await settle();
    const url = h.music.player.playlist[0].url;
    const remove = h.elements.get('stm-playlist').children[0].querySelector('.stm-track-delete');
    assert.ok(remove?.onclick);
    remove.onclick({ stopPropagation() {} });
    assert.equal(h.music.player.playlist.length, 0);
    assert.equal(h.music.player.currentTrackIndex, null);
    assert.equal(h.music.player.isPlaying, false);
    assert.equal(h.audio.paused, true);
    assert.equal(h.audio.src, '');
    assert.deepEqual(h.revokedUrls, [url]);
});

test('deleting a preceding track preserves the current track and adjusts its index', async () => {
    const h = createHarness();
    h.music.bindPlayerEvents();
    h.music.handleFileUpload({ target: { files: [{ name: 'first.mp3' }, { name: 'second.mp3' }], value: '' } });
    h.music.playTrack(1);
    await settle();
    const currentUrl = h.audio.src;
    const deletedUrl = h.music.player.playlist[0].url;
    h.elements.get('stm-playlist').children[0].querySelector('.stm-track-delete').onclick({ stopPropagation() {} });
    assert.equal(h.music.player.currentTrackIndex, 0);
    assert.equal(h.music.player.playlist[0].url, currentUrl);
    assert.equal(h.audio.src, currentUrl);
    assert.equal(h.audio.paused, false);
    assert.deepEqual(h.revokedUrls, [deletedUrl]);
});
