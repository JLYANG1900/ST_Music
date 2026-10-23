// --- ST Music Creator 核心逻辑 (v2.0 Client-Side) ---

console.log("🎵 [ST Music] 脚本文件已加载 (Client Mode)");

// ----------------------------------------------------------------------
// BROWSER / FRONTEND CONTEXT
// ----------------------------------------------------------------------
{ // Client Side Scope

    console.log("🎵 [ST Music] 脚本文件已加载");

    const extensionName = "st-music-creator";
    const extensionPath = `scripts/extensions/third-party/ST_Music`;

    // --- ST Music runtime add-ons ---
    const ST_MUSIC_RUNTIME_SCRIPTS = Object.freeze([
        {
            id: "st-music-model-catalog",
            file: "ModelCatalog.js",
            isReady: () => Boolean(window.STMusicModelCatalog?.providers),
        },
        {
            id: "st-music-api-runtime",
            file: "ApiService.js",
            isReady: () =>
                Boolean(window.STMusicApi || window.MusicApiService)
                && Boolean(window.STMusicApiSettings || window.MusicSettings),
        },
    ]);

    const runtimeScriptPromises = new Map();

    function attachRuntimeScript(scriptDef) {
        if (scriptDef.isReady()) return Promise.resolve(scriptDef.id);

        const src = `${extensionPath}/${scriptDef.file}`;
        if (runtimeScriptPromises.has(src)) return runtimeScriptPromises.get(src);

        const promise = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.async = false;
            script.dataset.stMusicRuntimeScript = scriptDef.id;
            script.onload = () => {
                if (scriptDef.isReady()) {
                    resolve(scriptDef.id);
                    return;
                }
                reject(new Error(`Loaded ${scriptDef.file}, but the expected runtime hook was not registered`));
            };
            script.onerror = () => reject(new Error(`Failed to load ${scriptDef.file}`));
            document.head.appendChild(script);
        });

        const trackedPromise = promise.catch((error) => {
            runtimeScriptPromises.delete(src);
            throw error;
        });

        runtimeScriptPromises.set(src, trackedPromise);
        return trackedPromise;
    }

    async function loadStMusicRuntimeScripts() {
        for (const scriptDef of ST_MUSIC_RUNTIME_SCRIPTS) {
            await attachRuntimeScript(scriptDef);
        }
        console.log("🎵 [ST Music] 独立 API 模块加载完成");
    }

    // --- 数据常量 ---

    const VOCAL_RANGES = [
        "女高音 (Soprano)",
        "女中音 (Mezzo-Soprano)",
        "女低音 (Contralto)",
        "男高音 (Tenor)",
        "男中音 (Baritone)",
        "男低音 (Bass)",
        "根据人设推断合适的人声音域"
    ];

    // 韵脚方案数据
    const RHYME_SCHEMES = [
        { name: "不押韵", desc: "" },
        { name: "ABCB (二四押韵)", desc: "听感：自然、不刻意，给听众一种\"期待感\"并在偶数句得到释放。例子：周杰伦《晴天》" },
        { name: "AABB (双行押韵)", desc: "听感：节奏感强，朗朗上口，常用于副歌（Chorus）或儿歌、洗脑歌。例子：筷子兄弟《小苹果》" },
        { name: "ABAB (交叉押韵)", desc: "听感：更有韵律跳跃感。例子：邓丽君《月亮代表我的心》" },
        { name: "AAAA (全行押韵)", desc: "听感：极具冲击力，常用于说唱（Rap）或情感非常激烈的段落，但也容易显得单调。" }
    ];

    // 声部音色数据
    const VOICE_TIMBRES = [
        "Auto (自动)",
        "Husky (烟嗓/沙哑)",
        "Clean (清澈/标准)",
        "Warm (温暖/磁性)",
        "Gritty (粗砺/颗粒感)",
        "Bright (明亮/尖细)",
        "Dark (暗淡/深沉)",
        "Soulful (深情/灵魂)"
    ];

    const GENRE_DATA = {
        "流行音乐 (Pop)": {
            desc: "具有极强的包容性，常与其他流派融合，主要以商业成功和大众审美为导向。",
            bpms: "110-130 (Upbeat)",
            instruments: ["合成器 (Synthesizer)", "吉他 (Guitar)", "鼓机 (Drum Machine)", "钢琴 (Piano)", "贝斯 (Bass)"],
            sub: [
                { name: "Synth-Pop (合成器流行)", desc: "80年代兴起，以电子合成器为主导乐器（如 Depeche Mode）。" },
                { name: "Indie Pop (独立流行)", desc: "保留流行的旋律，但制作更DIY，听感更粗糙或文艺（如 Lana Del Rey）。" },
                { name: "Dream Pop (梦幻流行)", desc: "强调迷幻的质感、混响人声和朦胧的氛围。" },
                { name: "Art Pop (艺术流行)", desc: "尝试前卫艺术形式，结构不循规蹈矩（如 Lady Gaga, Björk）。" },
                { name: "K-Pop (韩国流行)", desc: "已发展为独特体系，融合嘻哈、电子、舞曲，强调视觉与表演。" },
                { name: "Latin Pop (拉丁流行)", desc: "融合拉丁节奏（如莎莎、巴恰塔）的流行乐（如 Shakira）。" },
                { name: "Dance-Pop (舞曲流行)", desc: "专为夜店和电台设计，节奏强劲，结构简单。" },
                { name: "Bubblegum Pop (泡泡糖流行)", desc: "面向青少年，旋律极度甜美、歌词单纯。" },
                { name: "Electropop (电子流行)", desc: "侧重电子音色，通常比 Synth-pop 更现代、更重节奏。" },
                { name: "Chamber Pop (室内流行)", desc: "在流行乐中加入弦乐、管乐等管弦乐编制，气质优雅。" }
            ]
        },
        "摇滚乐 (Rock)": {
            desc: "以吉他、贝斯、鼓为三大件，精神内核从叛逆到内省无所不包。",
            bpms: "120-150 (Fast/Driving)",
            instruments: ["电吉他 (Electric Guitar)", "电贝斯 (Electric Bass)", "架子鼓 (Drum Kit)", "键盘/风琴 (Keyboards/Organ)"],
            sub: [
                { name: "Alternative Rock (另类摇滚)", desc: "80-90年代兴起，区别于主流商业摇滚的统称。" },
                { name: "Punk Rock (朋克摇滚)", desc: "快节奏、三和弦、反建制，强调宣泄（如 The Ramones）。" },
                { name: "Heavy Metal (重金属)", desc: "失真吉他、密集鼓点、嘶吼唱腔，极具侵略性。" },
                { name: "Psychedelic Rock (迷幻摇滚)", desc: "试图模拟致幻体验，使用大量效果器和长篇独奏（如 Pink Floyd）。" },
                { name: "Progressive Rock (前卫摇滚)", desc: "结构复杂，融合古典与爵士技巧，强调演奏技术。" },
                { name: "Indie Rock (独立摇滚)", desc: "强调独立厂牌发行，风格多样，通常也是车库摇滚的延伸。" },
                { name: "Grunge (垃圾摇滚)", desc: "源于西雅图，融合了朋克和重金属，充满颓废与愤怒（如 Nirvana）。" },
                { name: "Post-Rock (后摇滚)", desc: "主要为器乐，使用摇滚乐器创造氛围和纹理，而非传统歌曲结构。" },
                { name: "Glam Rock (华丽摇滚)", desc: "70年代风格，强调夸张的服饰、妆容和戏剧性（如 David Bowie）。" },
                { name: "Hard Rock (硬摇滚)", desc: "比传统摇滚更重，但比金属乐更有布鲁斯根源（如 AC/DC）。" }
            ]
        },
        "民谣 (Folk)": {
            desc: "注重叙事与原声乐器，强调音乐的根源性和人文色彩。",
            bpms: "70-100 (Relaxed)",
            instruments: ["原声吉他 (Acoustic Guitar)", "口琴 (Harmonica)", "班卓琴 (Banjo)", "小提琴 (Fiddle)", "曼陀林 (Mandolin)"],
            sub: [
                { name: "Traditional Folk (传统民谣)", desc: "口耳相传的古老歌曲，通常无明确作者。" },
                { name: "Folk Rock (民谣摇滚)", desc: "使用电吉他和摇滚节奏演绎民谣（如 Bob Dylan 转型期）。" },
                { name: "Indie Folk (独立民谣)", desc: "现代民谣，通常带有原声吉他，但编曲更现代、文艺。" },
                { name: "Americana (美式根源音乐)", desc: "美国民谣、乡村、蓝调的综合体。" },
                { name: "Celtic Folk (凯尔特民谣)", desc: "源自爱尔兰、苏格兰，使用风笛、竖琴等乐器。" },
                { name: "Anti-Folk (反民谣)", desc: "起源于纽约，以此反讽传统民谣的严肃性。" },
                { name: "Freak Folk / Psychedelic Folk", desc: "加入迷幻元素，结构怪诞。" },
                { name: "Neofolk (新民谣)", desc: "通常带有欧洲黑暗、神秘主义色彩。" },
                { name: "Singer-Songwriter (唱作人)", desc: "一把吉他/钢琴自弹自唱的风格。" },
                { name: "Contemporary Folk (当代民谣)", desc: "在这个时代创作的，反映当下生活的民谣音乐。" }
            ]
        },
        "嘻哈 (Hip-Hop)": {
            desc: "不仅仅是音乐，更是一种文化，核心是 Beat（节拍）和 Flow（说唱技巧）。",
            bpms: "80-100 (Groovy/Bounce)",
            instruments: ["人声 (Vocals/Rap)", "鼓机/808 (Drum Machine)", "唱机 (Turntables)", "MPC (采样打击垫)"],
            sub: [
                { name: "Old School (老派嘻哈)", desc: "70-80年代早期风格，节奏简单，注重派对氛围。" },
                { name: "Gangsta Rap (帮匪说唱)", desc: "90年代西海岸盛行，歌词描绘街头暴力与犯罪生活。" },
                { name: "Trap (陷阱音乐)", desc: "滚奏的 Hi-hats、重低音 808 鼓机。" },
                { name: "Jazz Rap (爵士说唱)", desc: "采样爵士乐片段，歌词通常更有诗意和内涵（如 Nujabes）。" },
                { name: "Conscious Hip-Hop (意识说唱)", desc: "关注政治、社会问题、种族平权等深刻议题。" },
                { name: "Lo-Fi Hip-Hop (低保真嘻哈)", desc: "强调粗糙的音质、底噪，常作为学习/放松背景音乐。" },
                { name: "Drill", desc: "歌词黑暗，节奏阴冷、滑动贝斯是特色。" },
                { name: "Grime", desc: "源于英国，速度快（140 BPM），受电子舞曲影响。" },
                { name: "Cloud Rap (云端说唱)", desc: "伴奏空灵、梦幻，人声通常含糊不清。" },
                { name: "Alternative Hip-Hop (另类嘻哈)", desc: "不遵循传统商业嘻哈框架，风格实验性强。" }
            ]
        },
        "电子音乐 (Electronic)": {
            desc: "完全依赖电子乐器制作，是现代舞曲文化的基础。",
            bpms: "120-140 (Dance)",
            instruments: ["合成器 (Synthesizer)", "鼓机 (Drum Machine)", "采样器 (Sampler)", "DAW (数字音频工作站)", "MIDI 控制器"],
            sub: [
                { name: "House (浩室)", desc: "4/4拍，重低音，源于芝加哥，俱乐部音乐基石。" },
                { name: "Techno (工业/科技舞曲)", desc: "机械感强，重复性高，氛围冰冷。" },
                { name: "Trance (恍惚/传思)", desc: "注重旋律推进和情绪铺垫，BPM 较快。" },
                { name: "Dubstep", desc: "沉重的低音（Wobble Bass）和切分节奏。" },
                { name: "Drum and Bass (DnB)", desc: "极快碎拍（160-180 BPM）配合重低音。" },
                { name: "Ambient (氛围音乐)", desc: "无明显节奏，强调空间感和环境声。" },
                { name: "IDM (智能舞曲)", desc: "不适合跳舞，更适合聆听，结构复杂实验性强。" },
                { name: "Synthwave (合成器波)", desc: "复古未来主义，致敬80年代风格。" },
                { name: "Garage (车库舞曲)", desc: "切分节奏明显，人声采样多。" },
                { name: "Hardstyle", desc: "极硬的底鼓（Kick）和失真音色，节奏极快。" }
            ]
        },
        "古典音乐 (Classical)": {
            desc: "历史悠久，结构严谨，强调器乐编制与演奏技巧。",
            bpms: "Variable (Largo to Presto)",
            instruments: ["弦乐组 (Strings)", "木管组 (Woodwinds)", "铜管组 (Brass)", "定音鼓 (Timpani)", "钢琴 (Piano)"],
            sub: [
                { name: "Baroque (巴洛克时期)", desc: "华丽、繁复，代表人物：巴赫、维瓦尔第。" },
                { name: "Classical Period (古典主义)", desc: "结构严谨、平衡，代表人物：莫扎特、海顿。" },
                { name: "Romantic (浪漫主义)", desc: "强调情感表达、宏大叙事。" },
                { name: "Impressionist (印象派)", desc: "强调音色和氛围，朦胧感。" },
                { name: "Minimalism (极简主义)", desc: "重复简短的乐句，缓慢变化。" },
                { name: "Opera (歌剧)", desc: "结合戏剧、声乐和管弦乐的综合艺术形式。" },
                { name: "Chamber Music (室内乐)", desc: "小型编制，如弦乐四重奏。" },
                { name: "Symphony (交响乐)", desc: "由大型管弦乐队演奏的宏大乐章。" },
                { name: "Gregorian Chant (圣咏)", desc: "中世纪单声部宗教歌曲，纯人声。" },
                { name: "Avant-Garde (先锋派)", desc: "探索无调性、十二音列等实验音乐。" }
            ]
        },
        "爵士乐 (Jazz)": {
            desc: "强调即兴演奏（Improvisation）和复杂的和声。",
            bpms: "80-140 (Swing)",
            instruments: ["萨克斯风 (Saxophone)", "小号 (Trumpet)", "低音提琴 (Double Bass)", "钢琴 (Piano)", "爵士鼓 (Jazz Drums)", "空心电吉他"],
            sub: [
                { name: "Swing (摇摆乐)", desc: "30-40年代大乐队时期，适合跳舞，节奏摇摆感强。" },
                { name: "Bebop (比波普)", desc: "速度快、和声复杂，转向艺术聆听。" },
                { name: "Cool Jazz (酷派爵士)", desc: "情绪内敛、柔和、理性。" },
                { name: "Hard Bop (硬波普)", desc: "融入 R&B 和福音元素，节奏更强烈。" },
                { name: "Free Jazz (自由爵士)", desc: "打破和声与节奏规则，极度即兴。" },
                { name: "Jazz Fusion (爵士融合)", desc: "爵士与摇滚、放克的结合，使用电声乐器。" },
                { name: "Latin Jazz (拉丁爵士)", desc: "融合古巴或巴西节奏。" },
                { name: "Modal Jazz (调式爵士)", desc: "基于调式而非和弦进行即兴。" },
                { name: "Smooth Jazz (平滑爵士)", desc: "商业化、流行化的爵士。" },
                { name: "Acid Jazz (酸性爵士)", desc: "融合了爵士、灵魂乐、放克和嘻哈律动。" }
            ]
        },
        "节奏布鲁斯 (R&B)": {
            desc: "从早期的跳舞音乐演变为强调人声技巧和情感的都市音乐。",
            bpms: "60-100 (Soulful)",
            instruments: ["电钢琴 (Electric Piano)", "贝斯 (Bass)", "铜管组 (Horn Section)", "哈蒙德风琴 (Organ)"],
            sub: [
                { name: "Soul (灵魂乐)", desc: "50-60年代，深受福音音乐影响，情感浓烈。" },
                { name: "Motown (摩动之声)", desc: "60年代底特律的流行化 Soul，制作精良。" },
                { name: "Funk (放克)", desc: "强调贝斯线条和切分节奏（Groove）。" },
                { name: "Disco (迪斯科)", desc: "四四拍，舞厅专用。" },
                { name: "Neo-Soul (新灵魂乐)", desc: "回归 70 年代 Soul 的根源，融合爵士和嘻哈。" },
                { name: "Contemporary R&B", desc: "80年代后加入电子制作，更流行化。" },
                { name: "New Jack Swing", desc: "融合嘻哈节奏和 R&B 旋律。" },
                { name: "Doo-Wop", desc: "强调多声部和声重唱。" },
                { name: "Alternative R&B", desc: "风格阴暗、迷幻、前卫。" },
                { name: "Gospel (福音音乐)", desc: "教会音乐，强调合唱与赞美。" }
            ]
        },
        "世界音乐 (World Music)": {
            desc: "指非英美主流流行音乐体系之外的各民族传统或融合音乐。",
            bpms: "Variable",
            instruments: ["康加鼓 (Congas)", "风笛 (Bagpipes)", "西塔琴 (Sitar)", "古筝/琵琶", "吉他 (Guitar)"],
            sub: [
                { name: "Reggae (雷鬼)", desc: "源于牙买加，反拍节奏明显，慵懒放松。" },
                { name: "Afrobeat (非洲节拍)", desc: "源于尼日利亚，融合爵士、放克和传统节奏。" },
                { name: "Flamenco (弗拉门戈)", desc: "源于西班牙，吉他、拍手和激情歌唱。" },
                { name: "Bossa Nova (波萨诺瓦)", desc: "源于巴西，桑巴与爵士的结合，慵懒优雅。" },
                { name: "Salsa (莎莎)", desc: "源于古巴/波多黎各，节奏复杂热烈。" },
                { name: "Celtic (凯尔特音乐)", desc: "爱尔兰、苏格兰传统音乐。" },
                { name: "Tango (探戈)", desc: "源于阿根廷，手风琴是灵魂。" },
                { name: "Indian Classical", desc: "分为北印度和南印度，使用西塔琴等。" },
                { name: "Klezmer (克莱兹默)", desc: "东欧犹太世俗音乐，模拟人声哭泣笑闹。" },
                { name: "Andean Music", desc: "南美安第斯山脉音乐，排箫是标志。" }
            ]
        }
    };

    // --- 主对象 ---
    const STMusic = {
        panelLoaded: false,
        currentView: 'player',

        // 状态
        state: {
            charName: "",
            vocalRange: "",
            voiceTimbre: "",
            aiGender: "",
            mainGenre: "",
            subGenre: "",
            subGenreDesc: "",
            instrument: [],
            customInstrument: "",
            lyricMode: "custom",
            lyricKeywords: "",
            lyricLanguage: "",
            customLang: "",
            rhymeScheme: "",
            otherRequirements: ""
        },

        // 播放器状态
        player: {
            playlist: [],
            currentTrackIndex: null,
            isPlaying: false
        },

        // 捕捉到的创作笔记
        capturedNotes: {
            title: "",
            lyrics: "",
            style: "",
            citations: []
        },

        // --- 初始化 ---
        async init() {
            console.log("🎵 [ST Music] 插件正在启动...");
            this.injectToggleButton();
            await this.loadHTML();
            if (this.panelLoaded) {
                this.bindViewportEvents();
                // 加载独立 API 模块
                try {
                    await loadStMusicRuntimeScripts();
                    this.initSettingsPage();
                } catch (e) {
                    console.warn("🎵 [ST Music] 独立 API 模块加载失败，生成与设置功能可能不可用:", e);
                }
                this.bindEvents();
                this.renderVocalButtons();
                this.renderVoiceTimbreButtons();
                this.renderGenreButtons();
                this.renderLyricsLanguageButtons();
                this.renderLyricModeButtons();
                this.renderRhymeSchemeButtons();
                this.loadPlaylist(); // Load persistent playlist
            }
        },

        // 初始化设置页面
        initSettingsPage() {
            const settingsView = window.STMusicApiSettings || window.MusicSettings;
            if (!settingsView) return;
            const settingsPage = document.getElementById("stm-page-settings");
            if (settingsPage) {
                settingsPage.innerHTML = "";
                const content = settingsView.createSettingsPage();
                settingsPage.appendChild(content);
                settingsView.bindSettingsEvents();
            }
        },

        // 注入悬浮切换按钮
        injectToggleButton() {
            if (document.getElementById("st-music-toggle-btn")) return;

            const btn = document.createElement("button");
            btn.type = "button";
            btn.id = "st-music-toggle-btn";
            btn.innerHTML = '<i class="fa-solid fa-music" style="font-size:18px;"></i>';
            btn.title = "打开 ST Music Creator";
            btn.setAttribute('aria-label', '打开或关闭音乐面板；按住可拖动');
            btn.setAttribute('aria-controls', 'st-music-panel');
            btn.setAttribute('aria-expanded', 'false');
            document.body.appendChild(btn);

            this.bindPointerDrag(btn, btn, {
                onFinish: () => this.saveTogglePosition(btn),
            });
            btn.addEventListener("click", () => this.togglePanel());
            this.restoreTogglePosition(btn);
        },

        getViewportBounds() {
            const viewport = window.visualViewport;
            return {
                left: viewport?.offsetLeft || 0,
                top: viewport?.offsetTop || 0,
                width: viewport?.width || window.innerWidth,
                height: viewport?.height || window.innerHeight,
            };
        },

        getDragBounds(element) {
            const viewport = this.getViewportBounds();
            const style = getComputedStyle(element);
            const safe = side => parseFloat(style.getPropertyValue(`--stm-safe-${side}`)) || 0;
            const rect = element.getBoundingClientRect();
            const left = viewport.left + safe('left') + 8;
            const top = viewport.top + safe('top') + 8;
            return {
                left, top,
                right: Math.max(left, viewport.left + viewport.width - safe('right') - rect.width - 8),
                bottom: Math.max(top, viewport.top + viewport.height - safe('bottom') - rect.height - 8),
            };
        },

        positionDraggable(element, left, top) {
            const bounds = this.getDragBounds(element);
            element.style.left = `${Math.min(bounds.right, Math.max(bounds.left, left))}px`;
            element.style.top = `${Math.min(bounds.bottom, Math.max(bounds.top, top))}px`;
            element.style.transform = 'none';
        },

        // Pointer Events cover mouse, touch and pen without a host jQuery dependency.
        bindPointerDrag(element, handle, { canStart = () => true, onFinish = () => {} } = {}) {
            let gesture = null;
            let suppressClick = false;
            handle.addEventListener('pointerdown', event => {
                if (gesture || event.isPrimary === false || event.button !== 0 || !canStart()) return;
                if (handle !== element && event.target.closest('button, input, select, textarea, a')) return;
                suppressClick = false;
                const rect = element.getBoundingClientRect();
                gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top, moved: false };
                handle.setPointerCapture(event.pointerId);
            });
            handle.addEventListener('pointermove', event => {
                if (!gesture || gesture.id !== event.pointerId) return;
                const dx = event.clientX - gesture.x;
                const dy = event.clientY - gesture.y;
                if (!gesture.moved && Math.hypot(dx, dy) < 6) return;
                gesture.moved = true;
                element.classList.add('stm-dragging');
                event.preventDefault();
                this.positionDraggable(element, gesture.left + dx, gesture.top + dy);
            });
            const finish = event => {
                if (!gesture || gesture.id !== event.pointerId) return;
                const moved = gesture.moved;
                gesture = null;
                element.classList.remove('stm-dragging');
                if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
                if (moved) {
                    suppressClick = true;
                    onFinish();
                }
            };
            handle.addEventListener('pointerup', finish);
            handle.addEventListener('pointercancel', finish);
            handle.addEventListener('lostpointercapture', finish);
            handle.addEventListener('click', event => {
                if (!suppressClick || event.detail === 0) return;
                suppressClick = false;
                event.preventDefault();
                event.stopImmediatePropagation();
            }, true);
        },

        saveTogglePosition(btn) {
            const bounds = this.getDragBounds(btn);
            const rect = btn.getBoundingClientRect();
            try {
                localStorage.setItem('ST_Music_Toggle_Position_v1', JSON.stringify({
                    x: (rect.left - bounds.left) / (bounds.right - bounds.left || 1),
                    y: (rect.top - bounds.top) / (bounds.bottom - bounds.top || 1),
                }));
            } catch { /* Dragging remains usable when browser storage is unavailable. */ }
        },

        restoreTogglePosition(btn) {
            const bounds = this.getDragBounds(btn);
            let position;
            try { position = JSON.parse(localStorage.getItem('ST_Music_Toggle_Position_v1')); } catch { /* Optional preference. */ }
            if (position && Number.isFinite(position.x) && Number.isFinite(position.y)) {
                this.positionDraggable(btn, bounds.left + position.x * (bounds.right - bounds.left), bounds.top + position.y * (bounds.bottom - bounds.top));
            } else {
                this.positionDraggable(btn, (bounds.left + bounds.right) / 2, bounds.top);
            }
        },

        bindViewportEvents() {
            const sync = () => {
                const viewport = this.getViewportBounds();
                const root = document.getElementById('st-music-root');
                const btn = document.getElementById('st-music-toggle-btn');
                [root, btn].filter(Boolean).forEach(element => {
                    for (const [name, value] of Object.entries(viewport)) {
                        element.style.setProperty(`--stm-viewport-${name}`, `${value}px`);
                    }
                });
                root?.classList.toggle('stm-short-viewport', viewport.height < 360);
                if (btn) {
                    const rect = btn.getBoundingClientRect();
                    this.positionDraggable(btn, rect.left, rect.top);
                }
                this.resetPanelPosition();
                const focused = document.activeElement;
                if (root?.contains(focused) && focused.matches('input, textarea, select')) {
                    focused.scrollIntoView({ block: 'nearest', inline: 'nearest' });
                }
            };
            let frame;
            const schedule = () => {
                cancelAnimationFrame(frame);
                frame = requestAnimationFrame(sync);
            };
            window.addEventListener('resize', schedule);
            window.visualViewport?.addEventListener('resize', schedule);
            window.visualViewport?.addEventListener('scroll', schedule);
            sync();
        },

        // 加载 HTML
        async loadHTML() {
            try {
                const panelUrl = new URL('./music.html', import.meta.url).href;
                const response = await fetch(panelUrl);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const html = await response.text();
                const container = document.createElement("div");
                container.innerHTML = html;
                document.body.appendChild(container.firstElementChild);
                this.panelLoaded = true;
                console.log("🎵 [ST Music] HTML 加载成功");
            } catch (e) {
                console.error("❌ [ST Music] HTML 加载失败:", e);
            }
        },

        // 检测是否为移动端
        isMobile() {
            return window.matchMedia('(max-width: 768px)').matches;
        },

        // 显示/隐藏面板
        togglePanel() {
            const panel = document.getElementById("st-music-panel");
            if (!panel) return;

            if (panel.classList.contains("active")) {
                this.closeLinkModal();
                panel.classList.remove("active");
                panel.style.display = "none";
                document.getElementById('st-music-toggle-btn')?.setAttribute('aria-expanded', 'false');
            } else {
                panel.style.display = "flex";
                this.resetPanelPosition();
                panel.classList.add("active");
                document.getElementById('st-music-toggle-btn')?.setAttribute('aria-expanded', 'true');
                this.captureCreationNotes(); // 每次打开时尝试捕捉
            }
        },

        // Layout and breakpoints are owned by CSS; viewport dimensions are shared above.
        centerPanelMobile() {
            this.resetPanelPosition();
        },

        // 切换页面 (播放器/创作/成果/设置)
        toggleView(viewName) {
            this.currentView = viewName;

            const panel = document.getElementById("st-music-panel");
            const contentSection = document.querySelector(".stm-content-section");
            const createPage = document.getElementById("stm-page-create");
            const resultsPage = document.getElementById("stm-page-results");
            const settingsPage = document.getElementById("stm-page-settings");
            const tabPlayer = document.getElementById("stm-tab-player");
            const tabCreate = document.getElementById("stm-tab-create");
            const tabResults = document.getElementById("stm-tab-results");
            const tabSettings = document.getElementById("stm-tab-settings");

            // 重置所有标签状态
            [tabPlayer, tabCreate, tabResults, tabSettings].forEach(t => t && t.classList.remove('active'));

            // 隐藏所有内容页面
            if (createPage) createPage.style.display = 'none';
            if (resultsPage) resultsPage.style.display = 'none';
            if (settingsPage) settingsPage.style.display = 'none';

            if (viewName === 'player') {
                // 紧凑播放器模式
                if (panel) {
                    panel.classList.add('stm-compact');
                    // 移动端强制定位
                    if (this.isMobile()) {
                        this.centerPanelMobile(panel);
                    }
                }
                if (contentSection) contentSection.style.display = 'none';
                if (tabPlayer) tabPlayer.classList.add('active');
            } else {
                // 完整界面模式
                if (panel) panel.classList.remove('stm-compact');
                if (contentSection) contentSection.style.display = 'flex';

                // 重置面板位置到屏幕中央
                if (this.isMobile()) {
                    this.centerPanelMobile(panel);
                } else {
                    this.resetPanelPosition();
                }

                if (viewName === 'create') {
                    if (createPage) createPage.style.display = 'flex';
                    if (tabCreate) tabCreate.classList.add('active');
                } else if (viewName === 'results') {
                    if (resultsPage) resultsPage.style.display = 'flex';
                    if (tabResults) tabResults.classList.add('active');
                    this.captureCreationNotes();
                } else if (viewName === 'settings') {
                    if (settingsPage) settingsPage.style.display = 'flex';
                    if (tabSettings) tabSettings.classList.add('active');
                }
            }
        },

        // Clear drag coordinates so CSS can adapt to orientation and keyboard changes.
        resetPanelPosition() {
            const panel = document.getElementById("st-music-panel");
            if (panel) {
                ['position', 'top', 'left', 'bottom', 'right', 'width', 'transform', 'border-radius', 'padding-bottom'].forEach(name => panel.style.removeProperty(name));
            }
        },

        // --- 事件绑定 ---
        bindEvents() {
            // 关闭按钮
            const closeBtn = document.getElementById("stm-btn-close");
            if (closeBtn) closeBtn.onclick = () => this.togglePanel();

            // 页面切换
            const tabPlayer = document.getElementById("stm-tab-player");
            const tabCreate = document.getElementById("stm-tab-create");
            const tabResults = document.getElementById("stm-tab-results");
            const tabSettings = document.getElementById("stm-tab-settings");
            if (tabPlayer) tabPlayer.onclick = () => this.toggleView('player');
            if (tabCreate) tabCreate.onclick = () => this.toggleView('create');
            if (tabResults) tabResults.onclick = () => this.toggleView('results');
            if (tabSettings) tabSettings.onclick = () => this.toggleView('settings');

            // 初始化为播放器视图
            this.toggleView('player');

            // Keep desktop panel dragging available without jQuery UI.
            const panel = document.getElementById("st-music-panel");
            const header = panel?.querySelector('.stm-header');
            if (panel && header) {
                this.bindPointerDrag(panel, header, {
                    canStart: () => !this.isMobile(),
                });
            }

            // 角色名输入
            const charInput = document.getElementById("stm-char-name");
            if (charInput) charInput.oninput = (e) => { this.state.charName = e.target.value; };

            // 性别按钮
            document.querySelectorAll(".stm-gender-btn").forEach(btn => {
                btn.onclick = () => {
                    document.querySelectorAll(".stm-gender-btn").forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    this.state.aiGender = btn.dataset.gender;
                };
            });

            // 自定义语言输入
            const langCustomInput = document.getElementById("stm-lang-custom");
            if (langCustomInput) {
                langCustomInput.oninput = (e) => {
                    this.state.customLang = e.target.value;
                    if (e.target.value) {
                        this.state.lyricLanguage = "";
                        document.querySelectorAll("#stm-lang-btns .stm-toggle-btn").forEach(b => b.classList.remove("active"));
                    }
                };
                langCustomInput.onclick = () => {
                    this.state.lyricLanguage = "";
                    document.querySelectorAll("#stm-lang-btns .stm-toggle-btn").forEach(b => b.classList.remove("active"));
                };
            }

            // 歌词关键词输入
            const lyricInput = document.getElementById("stm-lyric-keywords");
            if (lyricInput) lyricInput.oninput = (e) => { this.state.lyricKeywords = e.target.value; };

            // Other Requirements 输入
            const otherReqInput = document.getElementById("stm-other-requirements");
            if (otherReqInput) otherReqInput.oninput = (e) => { this.state.otherRequirements = e.target.value; };

            // Other Requirements 骰子按钮
            const diceBtn = document.getElementById("stm-btn-dice-req");
            if (diceBtn) {
                diceBtn.onclick = () => {
                    const presets = ["Piano Solo Intro", "Vocals Start Immediately", "Cinematic Intro", "Acappella Intro", "Ethereal Ambient Intro", "Dark & Tense Intro", "Dreamy Lo-fi Intro", "Acoustic Guitar Strumming", "Heavy Drum Fill Intro", "Orchestral Swell Intro", "Synthesizer Arpeggio Intro", "Melodic Violin Solo Intro", "Silence then Impact"];
                    const picked = presets[Math.floor(Math.random() * presets.length)];
                    if (otherReqInput) {
                        otherReqInput.value = picked;
                        this.state.otherRequirements = picked;
                    }
                };
            }


            // 生成按钮
            const genBtn = document.getElementById("stm-btn-generate");
            if (genBtn) genBtn.onclick = () => this.generateAndInject();

            // 独立 API 生成按钮
            const genNoteBtn = document.getElementById("stm-btn-generate-note");
            if (genNoteBtn) genNoteBtn.onclick = () => this.generateNoteOnly();

            // 刷新捕捉按钮
            const refreshBtn = document.getElementById("stm-btn-refresh-notes");
            if (refreshBtn) refreshBtn.onclick = () => this.captureCreationNotes();

            // 历史记录按钮
            const historyBtn = document.getElementById("stm-btn-history");
            if (historyBtn) historyBtn.onclick = () => this.toggleHistory(true);
            const historyCloseBtn = document.getElementById("stm-history-close");
            if (historyCloseBtn) historyCloseBtn.onclick = () => this.toggleHistory(false);

            // 预览面板按钮
            const previewCloseBtn = document.getElementById("stm-preview-close");
            if (previewCloseBtn) previewCloseBtn.onclick = () => this.hidePreview();
            const previewConfirmBtn = document.getElementById("stm-preview-confirm");
            if (previewConfirmBtn) previewConfirmBtn.onclick = () => this.confirmPreview();

            // 复制按钮
            const copyLyricsBtn = document.getElementById("stm-copy-lyrics");
            const copyStyleBtn = document.getElementById("stm-copy-style");
            if (copyLyricsBtn) copyLyricsBtn.onclick = () => this.copyToClipboard(this.capturedNotes.lyrics, copyLyricsBtn);
            if (copyStyleBtn) copyStyleBtn.onclick = () => this.copyToClipboard(this.capturedNotes.style, copyStyleBtn);

            // 播放器事件
            this.bindPlayerEvents();
        },

        // 播放器事件绑定
        bindPlayerEvents() {
            const uploadBtn = document.getElementById("stm-btn-upload");
            const fileInput = document.getElementById("stm-file-input");
            const linkBtn = document.getElementById("stm-btn-link"); // New Link Button
            const playBtn = document.getElementById("stm-btn-play");
            const prevBtn = document.getElementById("stm-btn-prev");
            const nextBtn = document.getElementById("stm-btn-next");
            const audioPlayer = document.getElementById("stm-audio-player");

            if (uploadBtn && fileInput) {
                uploadBtn.onclick = () => fileInput.click();
                fileInput.onchange = (e) => this.handleFileUpload(e);
            }

            if (linkBtn) {
                linkBtn.onclick = () => this.openLinkModal();
            }

            // Modal Events
            const modalCancel = document.getElementById("stm-modal-cancel");
            const modalConfirm = document.getElementById("stm-modal-confirm");

            if (modalCancel) modalCancel.onclick = () => this.closeLinkModal();
            if (modalConfirm) modalConfirm.onclick = () => this.confirmAddLink();
            const modal = document.getElementById('stm-link-modal');
            if (modal) {
                modal.addEventListener('click', event => {
                    if (event.target === modal) this.closeLinkModal();
                });
                modal.addEventListener('keydown', event => {
                    if (event.key === 'Escape') {
                        event.preventDefault();
                        event.stopPropagation();
                        this.closeLinkModal();
                    } else if (event.key === 'Tab') {
                        const controls = [...modal.querySelectorAll('input, button')].filter(el => !el.disabled);
                        const first = controls[0];
                        const last = controls[controls.length - 1];
                        if (event.shiftKey && document.activeElement === first) {
                            event.preventDefault();
                            last?.focus();
                        } else if (!event.shiftKey && document.activeElement === last) {
                            event.preventDefault();
                            first?.focus();
                        }
                    }
                });
            }

            if (playBtn) playBtn.onclick = () => this.togglePlay();
            if (prevBtn) prevBtn.onclick = () => this.prevTrack();
            if (nextBtn) nextBtn.onclick = () => this.nextTrack();

            if (audioPlayer) {
                audioPlayer.onended = () => this.nextTrack();
                audioPlayer.onplay = () => {
                    this.player.isPlaying = true;
                    this.updatePlayIcon(true);
                };
                audioPlayer.onpause = audioPlayer.onerror = () => {
                    this.player.isPlaying = false;
                    this.updatePlayIcon(false);
                };
            }
        },

        // --- 渲染函数 ---
        renderVocalButtons() {
            const container = document.getElementById("stm-vocal-btns");
            if (!container) return;

            container.innerHTML = "";
            VOCAL_RANGES.forEach(range => {
                const btn = document.createElement("button");
                btn.className = "stm-toggle-btn" + (range.includes("根据人设") ? " full-width" : "");
                btn.textContent = range.split(' ')[0];
                btn.onclick = () => this.selectVocalRange(range, btn);
                container.appendChild(btn);
            });
        },

        selectVocalRange(range, btn) {
            document.querySelectorAll("#stm-vocal-btns .stm-toggle-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            this.state.vocalRange = range;

            const genderSelector = document.getElementById("stm-gender-selector");
            if (genderSelector) {
                genderSelector.style.display = range.includes("根据人设") ? "flex" : "none";
            }
            if (!range.includes("根据人设")) {
                this.state.aiGender = "";
            }
        },

        // 渲染声部音色按钮
        renderVoiceTimbreButtons() {
            const container = document.getElementById("stm-timbre-btns");
            if (!container) return;

            container.innerHTML = "";
            VOICE_TIMBRES.forEach(timbre => {
                const btn = document.createElement("button");
                btn.className = "stm-toggle-btn" + (timbre.includes("Auto") ? " full-width" : "");
                btn.textContent = timbre;
                btn.onclick = () => this.selectVoiceTimbre(timbre, btn);
                container.appendChild(btn);
            });
        },

        selectVoiceTimbre(timbre, btn) {
            document.querySelectorAll("#stm-timbre-btns .stm-toggle-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            this.state.voiceTimbre = timbre;
        },

        renderGenreButtons() {
            const container = document.getElementById("stm-genre-btns");
            if (!container) return;

            container.innerHTML = "";
            Object.keys(GENRE_DATA).forEach(genre => {
                const btn = document.createElement("button");
                btn.className = "stm-toggle-btn";
                btn.innerHTML = `<span>${genre.split(' ')[0]}</span>`;
                btn.onclick = () => this.selectMainGenre(genre, btn);
                container.appendChild(btn);
            });
        },

        selectMainGenre(genre, btn) {
            document.querySelectorAll("#stm-genre-btns .stm-toggle-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            this.state.mainGenre = genre;
            this.state.subGenre = "";
            this.state.subGenreDesc = "";
            this.state.instrument = [];

            this.renderSubGenres(genre);
            this.renderInstruments(genre);
        },

        renderSubGenres(mainGenre) {
            const panel = document.getElementById("stm-subgenre-panel");
            const container = document.getElementById("stm-subgenre-btns");
            const descEl = document.getElementById("stm-genre-desc");

            if (!panel || !container) return;

            const genreData = GENRE_DATA[mainGenre];
            if (!genreData) return;

            panel.style.display = "block";
            descEl.textContent = genreData.desc;

            container.innerHTML = "";
            genreData.sub.forEach(sub => {
                const wrapper = document.createElement("div");
                wrapper.className = "stm-subgenre-wrapper";

                const btn = document.createElement("button");
                btn.className = "stm-toggle-btn";
                const nameParts = sub.name.split(' (');
                btn.innerHTML = `<span>${nameParts[0]} <span style="font-size:10px;color:#999;">(${nameParts[1] || ''}</span></span>`;
                btn.onclick = () => this.selectSubGenre(sub, btn);

                wrapper.appendChild(btn);
                container.appendChild(wrapper);
            });
        },

        selectSubGenre(sub, btn) {
            document.querySelectorAll("#stm-subgenre-btns .stm-toggle-btn").forEach(b => {
                b.classList.remove("active");
                const descEl = b.parentElement.querySelector(".stm-toggle-desc");
                if (descEl) descEl.remove();
            });

            btn.classList.add("active");
            this.state.subGenre = sub.name;
            this.state.subGenreDesc = sub.desc;

            // 显示描述
            const descEl = document.createElement("p");
            descEl.className = "stm-toggle-desc";
            descEl.textContent = sub.desc;
            btn.parentElement.appendChild(descEl);
        },

        // 渲染歌词语言按钮
        renderLyricsLanguageButtons() {
            const container = document.getElementById("stm-lang-btns");
            if (!container) return;

            container.innerHTML = "";
            const languages = ["中文", "英文"];
            languages.forEach(lang => {
                const btn = document.createElement("button");
                btn.className = "stm-toggle-btn";
                btn.textContent = lang;
                btn.onclick = () => this.selectLyricsLanguage(lang, btn);
                container.appendChild(btn);
            });
        },

        selectLyricsLanguage(lang, btn) {
            document.querySelectorAll("#stm-lang-btns .stm-toggle-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            this.state.lyricLanguage = lang;
            this.state.customLang = "";
            const customInput = document.getElementById("stm-lang-custom");
            if (customInput) customInput.value = "";
        },

        // 渲染歌词创作模式按钮
        renderLyricModeButtons() {
            const container = document.getElementById("stm-lyric-mode-btns");
            if (!container) return;

            container.innerHTML = "";
            const modes = [
                { value: "custom", label: "自定义关键词" },
                { value: "plot", label: "根据剧情回忆创作" }
            ];
            modes.forEach(mode => {
                const btn = document.createElement("button");
                btn.className = "stm-toggle-btn" + (mode.value === "custom" ? " active" : "");
                btn.textContent = mode.label;
                btn.dataset.mode = mode.value;
                btn.onclick = () => this.selectLyricMode(mode.value, btn);
                container.appendChild(btn);
            });
        },

        selectLyricMode(mode, btn) {
            document.querySelectorAll("#stm-lyric-mode-btns .stm-toggle-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            this.state.lyricMode = mode;

            const keywordsInput = document.getElementById("stm-lyric-keywords");
            if (keywordsInput) {
                keywordsInput.style.display = mode === "custom" ? "block" : "none";
            }
        },

        // 渲染韵脚方案按钮
        renderRhymeSchemeButtons() {
            const container = document.getElementById("stm-rhyme-btns");
            if (!container) return;

            container.innerHTML = "";
            RHYME_SCHEMES.forEach(scheme => {
                const wrapper = document.createElement("div");
                wrapper.className = "stm-rhyme-wrapper";

                const btn = document.createElement("button");
                btn.className = "stm-toggle-btn";
                btn.textContent = scheme.name;
                btn.onclick = () => this.selectRhymeScheme(scheme, btn);

                wrapper.appendChild(btn);
                container.appendChild(wrapper);
            });
        },

        selectRhymeScheme(scheme, btn) {
            // 移除所有选中状态和描述
            document.querySelectorAll("#stm-rhyme-btns .stm-toggle-btn").forEach(b => {
                b.classList.remove("active");
                const descEl = b.parentElement.querySelector(".stm-toggle-desc");
                if (descEl) descEl.remove();
            });

            btn.classList.add("active");
            this.state.rhymeScheme = scheme.name;

            // 如果有描述则显示
            if (scheme.desc) {
                const descEl = document.createElement("p");
                descEl.className = "stm-toggle-desc";
                descEl.textContent = scheme.desc;
                btn.parentElement.appendChild(descEl);
            }
        },

        renderInstruments(mainGenre) {
            const group = document.getElementById("stm-instrument-group");
            const container = document.getElementById("stm-instrument-btns");

            if (!group || !container) return;

            const genreData = GENRE_DATA[mainGenre];
            if (!genreData) return;

            group.style.display = "block";
            container.innerHTML = "";

            // 乐器按钮
            genreData.instruments.forEach(inst => {
                const btn = document.createElement("button");
                btn.className = "stm-instrument-btn";
                btn.textContent = inst.split(' ')[0];
                btn.onclick = () => this.selectInstrument(inst, btn);
                container.appendChild(btn);
            });

            // AI推荐按钮
            const recBtn = document.createElement("button");
            recBtn.className = "stm-instrument-btn recommend";
            recBtn.innerHTML = `<i class="fa-solid fa-rotate"></i> 随机/AI推荐`;
            recBtn.onclick = () => this.selectInstrument("recommend", recBtn);
            container.appendChild(recBtn);

            // 自定义输入
            const wrapper = document.createElement("div");
            wrapper.className = "stm-instrument-wrapper";

            const customInput = document.createElement("input");
            customInput.type = "text";
            customInput.className = "stm-instrument-input";
            customInput.placeholder = "自定义乐器...";
            customInput.oninput = (e) => {
                this.state.customInstrument = e.target.value;
                if (e.target.value) {
                    this.state.instrument = [];
                    document.querySelectorAll("#stm-instrument-btns .stm-instrument-btn").forEach(b => b.classList.remove("active"));
                }
            };
            customInput.onclick = () => {
                this.state.instrument = [];
                document.querySelectorAll("#stm-instrument-btns .stm-instrument-btn").forEach(b => b.classList.remove("active"));
            };

            wrapper.appendChild(customInput);
            container.appendChild(wrapper);
        },

        selectInstrument(inst, btn) {
            // 多选逻辑：切换选中状态
            if (inst === "recommend") {
                // AI推荐是独占选项
                document.querySelectorAll("#stm-instrument-btns .stm-instrument-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.state.instrument = ["recommend"];
            } else {
                // 取消 AI推荐 的选中状态
                const recBtn = document.querySelector("#stm-instrument-btns .stm-instrument-btn.recommend");
                if (recBtn) recBtn.classList.remove("active");
                this.state.instrument = this.state.instrument.filter(i => i !== "recommend");

                // 切换当前乐器
                if (btn.classList.contains("active")) {
                    btn.classList.remove("active");
                    this.state.instrument = this.state.instrument.filter(i => i !== inst);
                } else {
                    btn.classList.add("active");
                    this.state.instrument.push(inst);
                }
            }

            const customInput = document.querySelector(".stm-instrument-input");
            if (customInput && inst !== "custom") customInput.value = "";
        },

        // --- 生成并注入 ---
        generateAndInject() {
            if (!this.state.charName) {
                if (typeof toastr !== "undefined") toastr.warning("请输入创作者角色名称");
                else alert("请输入创作者角色名称");
                return;
            }
            if (!this.state.mainGenre || !this.state.subGenre) {
                if (typeof toastr !== "undefined") toastr.warning("请选择完整的音乐流派");
                else alert("请选择完整的音乐流派");
                return;
            }
            if (this.state.vocalRange === "根据人设推断合适的人声音域" && !this.state.aiGender) {
                if (typeof toastr !== "undefined") toastr.warning("请选择性别（男/女）以辅助人设推断");
                else alert("请选择性别（男/女）以辅助人设推断");
                return;
            }

            // 构建提示词
            let finalInstruments = this.state.instrument;
            let instrumentText = "";

            if (finalInstruments.length === 0 && this.state.customInstrument) {
                instrumentText = this.state.customInstrument;
            } else if (finalInstruments.includes("recommend")) {
                instrumentText = "推荐合适的乐器";
            } else if (finalInstruments.length > 0) {
                instrumentText = finalInstruments.map(i => i.split(' ')[0]).join(' + ');
            } else {
                instrumentText = "未指定";
            }

            const finalVocal = this.state.vocalRange || "AI 推断";
            const bpm = GENRE_DATA[this.state.mainGenre]?.bpms || "Variable";
            const mainGenreName = this.state.mainGenre.split(' ')[0];
            const subGenreName = this.state.subGenre.split(' (')[0];

            let keywordText = "（无）";
            if (this.state.lyricMode === 'custom' && this.state.lyricKeywords) {
                keywordText = `（${this.state.lyricKeywords}）`;
            } else if (this.state.lyricMode === 'plot') {
                keywordText = "（根据剧情及回忆自动生成）";
            }

            // 歌词语言文本
            let langText = "";
            if (this.state.customLang) {
                langText = `；语言：${this.state.customLang}`;
            } else if (this.state.lyricLanguage) {
                langText = `；语言：${this.state.lyricLanguage}`;
            }

            let genderChar = "";
            if (this.state.vocalRange === "根据人设推断合适的人声音域") {
                genderChar = this.state.aiGender;
            } else {
                genderChar = finalVocal.charAt(0);
            }

            // 韵脚方案文本
            let rhymeText = "";
            if (this.state.rhymeScheme && this.state.rhymeScheme !== "不押韵") {
                rhymeText = `；韵脚方案：${this.state.rhymeScheme}`;
            }

            // 声部音色文本
            let timbreText = "";
            if (this.state.voiceTimbre) {
                if (this.state.voiceTimbre.includes("Auto")) {
                    timbreText = " | 音色：根据角色人设推断合理的音色";
                } else {
                    timbreText = ` | 音色：${this.state.voiceTimbre}`;
                }
            }

            // Base music note template
            const musicNoteTemplate = `<music>
一、歌名
二、歌词结构：
[Verse]
[Pre-Chorus]
[Chorus]
[Verse]
[Chorus]
[Bridge]
[Final Chorus]
要求：
每段2-4行；副歌一定要重复关键词；不要一整段长句；关键词${keywordText}${langText}${rhymeText}
三、风格
1.公式：[${mainGenreName}] + [${subGenreName}] + [${instrumentText}] + [角色的情绪]
2.BPM (i*/): ${bpm}
3.人声指定：${genderChar} ${finalVocal}${timbreText}
${this.state.otherRequirements ? this.state.otherRequirements + '\n' : ''}不仅要列出乐器，还要描述它在"做什么"。句式：The instrumentation features [Instrument] playing [Action]...
</music>`;

            let fullText = `（根据当前故事及过往回忆，以${this.state.charName}的视角写一个音乐创作笔记，包含歌名、歌词、风格）
严格遵循以下格式及要求输出回复：
${musicNoteTemplate}
（注意：必须用music与/music标签包裹这部分输出内容，并将其放在回复的最末尾，不要放在正文中。歌名、歌词结构、风格，三个模块连贯输出，中间不要断开）`;

            // 注入到 SillyTavern 输入框
            const textarea = document.getElementById('send_textarea');
            if (textarea) {
                textarea.value = fullText;
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                textarea.focus();

                this.togglePanel();
                if (typeof toastr !== "undefined") toastr.success("音乐创作提示词已注入输入框");
            } else {
                // 回退：复制到剪贴板
                this.writeClipboardText(fullText).then(copied => {
                    if (copied && typeof toastr !== "undefined") toastr.info("未找到输入框，提示词已复制到剪贴板");
                });
            }
        },

        // --- 构建提示词（复用 generateAndInject 的逻辑） ---
        buildMusicPrompt() {
            if (!this.state.charName) {
                if (typeof toastr !== "undefined") toastr.warning("请输入创作者角色名称");
                else alert("请输入创作者角色名称");
                return null;
            }
            if (!this.state.mainGenre || !this.state.subGenre) {
                if (typeof toastr !== "undefined") toastr.warning("请选择完整的音乐流派");
                else alert("请选择完整的音乐流派");
                return null;
            }
            if (this.state.vocalRange === "根据人设推断合适的人声音域" && !this.state.aiGender) {
                if (typeof toastr !== "undefined") toastr.warning("请选择性别（男/女）以辅助人设推断");
                else alert("请选择性别（男/女）以辅助人设推断");
                return null;
            }

            let finalInstruments = this.state.instrument;
            let instrumentText = "";
            if (finalInstruments.length === 0 && this.state.customInstrument) {
                instrumentText = this.state.customInstrument;
            } else if (finalInstruments.includes("recommend")) {
                instrumentText = "推荐合适的乐器";
            } else if (finalInstruments.length > 0) {
                instrumentText = finalInstruments.map(i => i.split(' ')[0]).join(' + ');
            } else {
                instrumentText = "未指定";
            }

            const finalVocal = this.state.vocalRange || "AI 推断";
            const bpm = GENRE_DATA[this.state.mainGenre]?.bpms || "Variable";
            const mainGenreName = this.state.mainGenre.split(' ')[0];
            const subGenreName = this.state.subGenre.split(' (')[0];

            let keywordText = "（无）";
            if (this.state.lyricMode === 'custom' && this.state.lyricKeywords) {
                keywordText = `（${this.state.lyricKeywords}）`;
            } else if (this.state.lyricMode === 'plot') {
                keywordText = "（根据补充信息、角色设定与创作者视角自动生成）";
            }

            let langText = "";
            if (this.state.customLang) {
                langText = `；语言：${this.state.customLang}`;
            } else if (this.state.lyricLanguage) {
                langText = `；语言：${this.state.lyricLanguage}`;
            }

            let genderChar = "";
            if (this.state.vocalRange === "根据人设推断合适的人声音域") {
                genderChar = this.state.aiGender;
            } else {
                genderChar = finalVocal.charAt(0);
            }

            let rhymeText = "";
            if (this.state.rhymeScheme && this.state.rhymeScheme !== "不押韵") {
                rhymeText = `；韵脚方案：${this.state.rhymeScheme}`;
            }

            let timbreText = "";
            if (this.state.voiceTimbre) {
                if (this.state.voiceTimbre.includes("Auto")) {
                    timbreText = " | 音色：根据角色人设推断合理的音色";
                } else {
                    timbreText = ` | 音色：${this.state.voiceTimbre}`;
                }
            }

            return `以${this.state.charName}的视角写一个音乐创作笔记，只输出笔记内容。
严格遵循以下格式及要求：
<music>
一、歌名
二、歌词结构：
[Verse]
[Pre-Chorus]
[Chorus]
[Verse]
[Chorus]
[Bridge]
[Final Chorus]
要求：
每段2-4行；副歌一定要重复关键词；不要一整段长句；关键词${keywordText}${langText}${rhymeText}
三、风格
1.公式：[${mainGenreName}] + [${subGenreName}] + [${instrumentText}] + [角色的情绪]
2.BPM (i*/): ${bpm}
3.人声指定：${genderChar} ${finalVocal}${timbreText}
${this.state.otherRequirements ? this.state.otherRequirements + '\n' : ''}不仅要列出乐器，还要描述它在"做什么"。句式：The instrumentation features [Instrument] playing [Action]...
</music>
（注意：只输出music与/music标签内的创作笔记，不要有其他内容）`;
        },

        // --- 使用独立 API 生成创作笔记 ---

        // 暂存待发送的提示词
        _pendingPrompt: null,

        /**
         * 点击羽毛按钮 → 显示预览面板
         */
        generateNoteOnly() {
            const api = window.STMusicApi || window.MusicApiService;
            if (!api) {
                if (typeof toastr !== "undefined") toastr.error("独立 API 模块未加载，请刷新页面重试");
                else alert("独立 API 模块未加载，请刷新页面重试");
                return;
            }

            const promptText = this.buildMusicPrompt();
            if (!promptText) return;

            // 切换到成果页面并展示预览
            this.toggleView('results');
            this._pendingPrompt = promptText;
            this.showPreview(promptText);
        },

        /**
         * 显示预览面板，渲染固定系统提示词、补充信息和用户参数提示词
         */
        showPreview(promptText) {
            const overlay = document.getElementById('stm-preview-overlay');
            const listEl = document.getElementById('stm-preview-list');
            if (!overlay || !listEl) return;

            const api = window.STMusicApi || window.MusicApiService;
            const systemPrompt = api.getSystemPrompt();

            listEl.innerHTML = '';

            this._renderPreviewSection(listEl, {
                icon: '<i class="fa-solid fa-robot"></i>',
                title: 'System Prompt',
                badge: '固定',
                content: systemPrompt
            });

            this._renderPreviewTextarea(listEl, {
                icon: '<i class="fa-solid fa-book-open"></i>',
                title: '补充信息（可选）',
                badge: '可编辑',
                placeholder: '建议手动从世界书内复制该角色的人设等信息作为创作补充信息'
            });

            this._renderPreviewMemoryDepth(listEl, {
                icon: '<i class="fa-solid fa-layer-group"></i>',
                title: '读取记忆楼层深度',
                badge: '自填空'
            });

            this._renderPreviewSection(listEl, {
                icon: '<i class="fa-solid fa-feather-pointed"></i>',
                title: 'User Prompt（含所有参数）',
                badge: '动态',
                content: promptText,
                defaultOpen: true
            });

            overlay.style.display = 'flex';

            this._bindPreviewDraftInputs(systemPrompt, promptText);
            this._updatePreviewTokenCount(systemPrompt, promptText);
        },

        /**
         * 估算并显示 Token 数
         */
        _updateTokenCount(...texts) {
            const totalChars = texts.reduce((sum, text) => sum + (text || '').length, 0);
            // 粗略估算：中文约 1.5 token/字，英文约 0.25 token/字符，平均约 0.75
            const estimatedTokens = Math.round(totalChars * 0.75);
            const tokenEl = document.getElementById('stm-token-count-value');
            if (tokenEl) tokenEl.textContent = `≈${estimatedTokens}`;
        },

        _bindPreviewDraftInputs(systemPrompt, promptText) {
            const update = () => this._updatePreviewTokenCount(systemPrompt, promptText);
            document.getElementById('stm-preview-extra-info')?.addEventListener('input', update);
            document.getElementById('stm-preview-memory-depth')?.addEventListener('input', update);
        },

        _updatePreviewTokenCount(systemPrompt, promptText) {
            const extraInfo = this._readPreviewExtraInfo();
            const memoryLayers = this._readPreviewMemoryLayers();
            this._updateMemoryDepthStatus(memoryLayers);
            this._updateTokenCount(systemPrompt, extraInfo, memoryLayers.text, promptText);
        },

        /**
         * 渲染补充信息条目（含可编辑文本框）
         */
        _renderPreviewTextarea(container, { icon, title, badge, placeholder }) {
            const entry = document.createElement('div');
            entry.className = 'stm-history-entry';

            const header = document.createElement('div');
            header.className = 'stm-history-entry-header';
            header.innerHTML = `
                <span class="stm-history-source">${icon}</span>
                <span class="stm-history-entry-title">${title}</span>
                <span class="stm-preview-badge stm-preview-badge-edit">${badge}</span>
                <i class="fa-solid fa-chevron-down stm-history-chevron"></i>
            `;

            const detail = document.createElement('div');
            detail.className = 'stm-history-detail';
            detail.style.display = 'none';
            detail.innerHTML = `<textarea class="stm-preview-textarea" id="stm-preview-extra-info" placeholder="${placeholder}"></textarea>`;

            header.onclick = () => {
                const isOpen = detail.style.display !== 'none';
                detail.style.display = isOpen ? 'none' : 'block';
                const chevron = header.querySelector('.stm-history-chevron');
                if (chevron) {
                    chevron.classList.toggle('fa-chevron-down', isOpen);
                    chevron.classList.toggle('fa-chevron-up', !isOpen);
                }
                if (!isOpen) {
                    // 展开时自动聚焦文本框
                    const textarea = detail.querySelector('textarea');
                    if (textarea) setTimeout(() => textarea.focus(), 100);
                }
            };

            entry.appendChild(header);
            entry.appendChild(detail);
            container.appendChild(entry);
        },

        _renderPreviewMemoryDepth(container, { icon, title, badge }) {
            const entry = document.createElement('div');
            entry.className = 'stm-history-entry';

            const header = document.createElement('div');
            header.className = 'stm-history-entry-header';
            header.innerHTML = `
                <span class="stm-history-source">${icon}</span>
                <span class="stm-history-entry-title">${title}</span>
                <span class="stm-preview-badge stm-preview-badge-edit">${badge}</span>
                <i class="fa-solid fa-chevron-down stm-history-chevron"></i>
            `;

            const detail = document.createElement('div');
            detail.className = 'stm-history-detail';
            detail.style.display = 'none';
            detail.innerHTML = `
                <div class="stm-preview-depth-row">
                    <input class="stm-input stm-preview-depth-input" id="stm-preview-memory-depth" type="number" min="0" step="1" inputmode="numeric" placeholder="0">
                    <span class="stm-preview-depth-unit">层</span>
                </div>
                <div class="stm-preview-depth-status" id="stm-preview-memory-depth-status"></div>
            `;

            header.onclick = () => {
                const isOpen = detail.style.display !== 'none';
                detail.style.display = isOpen ? 'none' : 'block';
                const chevron = header.querySelector('.stm-history-chevron');
                if (chevron) {
                    chevron.classList.toggle('fa-chevron-down', isOpen);
                    chevron.classList.toggle('fa-chevron-up', !isOpen);
                }
                if (!isOpen) {
                    const input = detail.querySelector('input');
                    if (input) setTimeout(() => input.focus(), 100);
                }
            };

            entry.appendChild(header);
            entry.appendChild(detail);
            container.appendChild(entry);
        },

        _readPreviewExtraInfo() {
            const extraInfoEl = document.getElementById('stm-preview-extra-info');
            return extraInfoEl ? extraInfoEl.value.trim() : '';
        },

        _readPreviewMemoryDepth() {
            const depthEl = document.getElementById('stm-preview-memory-depth');
            const depth = Number.parseInt(depthEl?.value, 10);
            return Number.isFinite(depth) && depth > 0 ? depth : 0;
        },

        _readPreviewMemoryLayers() {
            const depth = this._readPreviewMemoryDepth();
            return this._readRecentChatLayers(depth);
        },

        _getSillyTavernChatContext() {
            let context = null;

            try {
                if (typeof window.SillyTavern !== 'undefined' && typeof window.SillyTavern.getContext === 'function') {
                    context = window.SillyTavern.getContext();
                } else if (
                    typeof window.parent !== 'undefined'
                    && window.parent.SillyTavern
                    && typeof window.parent.SillyTavern.getContext === 'function'
                ) {
                    context = window.parent.SillyTavern.getContext();
                }
            } catch (e) {
                console.log("[ST Music] 无法访问 SillyTavern 上下文");
            }

            return Array.isArray(context?.chat) ? context.chat : [];
        },

        _cleanChatLayerText(text) {
            return `${text || ''}`
                .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                .replace(/<disclaimer>[\s\S]*?<\/disclaimer>/gi, '')
                .replace(/<finish>[\s\S]*?<\/finish>/gi, '')
                .trim();
        },

        _formatChatLayer(layer) {
            const speaker = layer.msg?.name || (layer.msg?.is_user ? '用户' : '角色');
            return `#${layer.index + 1} ${speaker}\n${layer.text}`;
        },

        _readRecentChatLayers(depth) {
            if (!depth) return { depth: 0, count: 0, text: '' };

            const layers = this._getSillyTavernChatContext()
                .map((msg, index) => ({
                    msg,
                    index,
                    text: this._cleanChatLayerText(msg?.mes || msg?.message || msg?.content || '')
                }))
                .filter((layer) => layer.text);

            const selected = layers.slice(Math.max(0, layers.length - depth));
            return {
                depth,
                count: selected.length,
                text: selected.map((layer) => this._formatChatLayer(layer)).join('\n\n')
            };
        },

        _updateMemoryDepthStatus(memoryLayers) {
            const statusEl = document.getElementById('stm-preview-memory-depth-status');
            if (!statusEl) return;

            statusEl.classList.remove('is-active', 'is-warning');
            if (!memoryLayers.depth) {
                statusEl.textContent = '未读取正文楼层';
                return;
            }

            if (!memoryLayers.count) {
                statusEl.textContent = '未读取到 SillyTavern 正文';
                statusEl.classList.add('is-warning');
                return;
            }

            statusEl.textContent = `将读取最近 ${memoryLayers.count}/${memoryLayers.depth} 层正文`;
            statusEl.classList.add('is-active');
        },

        /**
         * 渲染预览中的一个可展开条目
         */
        _renderPreviewSection(container, { icon, title, badge, content, defaultOpen }) {
            const entry = document.createElement('div');
            entry.className = 'stm-history-entry';

            const header = document.createElement('div');
            header.className = 'stm-history-entry-header';
            header.innerHTML = `
                <span class="stm-history-source">${icon}</span>
                <span class="stm-history-entry-title">${title}</span>
                <span class="stm-preview-badge">${badge}</span>
                <i class="fa-solid ${defaultOpen ? 'fa-chevron-up' : 'fa-chevron-down'} stm-history-chevron"></i>
            `;

            const detail = document.createElement('div');
            detail.className = 'stm-history-detail';
            detail.style.display = defaultOpen ? 'block' : 'none';
            detail.innerHTML = `<div class="stm-preview-content">${this.escapeHtml(content)}</div>`;

            header.onclick = () => {
                const isOpen = detail.style.display !== 'none';
                detail.style.display = isOpen ? 'none' : 'block';
                const chevron = header.querySelector('.stm-history-chevron');
                if (chevron) {
                    chevron.classList.toggle('fa-chevron-down', isOpen);
                    chevron.classList.toggle('fa-chevron-up', !isOpen);
                }
            };

            entry.appendChild(header);
            entry.appendChild(detail);
            container.appendChild(entry);
        },

        /**
         * 隐藏预览面板
         */
        hidePreview() {
            const overlay = document.getElementById('stm-preview-overlay');
            if (overlay) overlay.style.display = 'none';
            this._pendingPrompt = null;
        },

        /**
         * 确认发送 → 关闭预览，执行独立 API 生成
         */
        async confirmPreview() {
            let promptText = this._pendingPrompt;
            if (!promptText) return;

            // 读取补充信息
            const extraInfo = this._readPreviewExtraInfo();
            const memoryLayers = this._readPreviewMemoryLayers();
            const promptParts = [];

            if (extraInfo) {
                promptParts.push(`补充信息（角色人设等背景资料）：\n${extraInfo}`);
            }
            if (memoryLayers.text) {
                promptParts.push(`最近 ${memoryLayers.count} 层 SillyTavern 正文（按时间顺序）：\n${memoryLayers.text}`);
            } else if (memoryLayers.depth > 0 && typeof toastr !== "undefined") {
                toastr.warning("未读取到 SillyTavern 正文楼层，将继续发送当前提示词");
            }
            promptParts.push(promptText);
            promptText = promptParts.join('\n\n');

            this.hidePreview();

            const loadingIndicator = document.getElementById("stm-loading-indicator");
            const genNoteBtn = document.getElementById("stm-btn-generate-note");

            if (loadingIndicator) loadingIndicator.style.display = 'block';
            if (genNoteBtn) genNoteBtn.disabled = true;

            // 清空旧结果
            this.capturedNotes = { title: "", lyrics: "", style: "", citations: [] };
            this.updateResultsDisplay();

            try {
                console.info("🎵 [ST Music] 调用独立 API 生成创作笔记...");
                const api = window.STMusicApi || window.MusicApiService;
                const result = await api.callMusicNoteApi(promptText);

                if (result.success) {
                    const match = result.content.match(/<music>([\s\S]*?)<\/music>/i);
                    if (match) {
                        this.parseCreationNotes(match[1].trim(), result.citations);
                    } else {
                        this.parseCreationNotes(result.content.trim(), result.citations);
                    }
                    this.updateResultsDisplay();
                    if (typeof toastr !== "undefined") toastr.success("创作笔记生成成功！");
                    this.saveNoteToHistory(this.capturedNotes, 'generate');
                } else {
                    if (typeof toastr !== "undefined") toastr.error("生成失败: " + result.error);
                    else alert("生成失败: " + result.error);
                }
            } catch (error) {
                console.error("🎵 [ST Music] 独立 API 调用异常:", error);
                if (typeof toastr !== "undefined") toastr.error("调用异常: " + error.message);
            } finally {
                if (loadingIndicator) loadingIndicator.style.display = 'none';
                if (genNoteBtn) genNoteBtn.disabled = false;
            }
        },

        // --- 捕捉创作笔记 ---
        captureCreationNotes() {
            let chatContext = [];
            let captured = false;

            try {
                if (typeof window.SillyTavern !== 'undefined') {
                    chatContext = window.SillyTavern.getContext().chat;
                } else if (typeof window.parent !== 'undefined' && window.parent.SillyTavern) {
                    chatContext = window.parent.SillyTavern.getContext().chat;
                }
            } catch (e) {
                console.log("[ST Music] 无法访问 SillyTavern 上下文");
            }

            if (!chatContext || chatContext.length === 0) {
                this.updateResultsDisplay();
                return;
            }

            // 从最新消息开始查找 <music> 标签
            for (let i = chatContext.length - 1; i >= 0; i--) {
                const mes = chatContext[i].mes || "";
                const match = mes.match(/<music>([\s\S]*?)<\/music>/i);

                if (match) {
                    const content = match[1].trim();
                    this.parseCreationNotes(content);
                    captured = true;
                    break;
                }
            }

            this.updateResultsDisplay();

            // 如果捕捉到了内容，保存到历史记录
            if (captured && (this.capturedNotes.title || this.capturedNotes.lyrics || this.capturedNotes.style)) {
                this.saveNoteToHistory(this.capturedNotes, 'capture');
            }
        },

        parseCreationNotes(content, citations = []) {
            this.capturedNotes.citations = this.normalizeCitations(citations);

            // 解析歌名
            const titleMatch = content.match(/一、歌名[：:\s]*(.*?)(?=\n|二、|$)/i);
            this.capturedNotes.title = titleMatch ? titleMatch[1].trim() : "";

            // 解析歌词
            const lyricsMatch = content.match(/二、歌词结构[：:\s]*([\s\S]*?)(?=三、|$)/i);
            this.capturedNotes.lyrics = lyricsMatch ? lyricsMatch[1].trim() : "";

            // 解析风格
            const styleMatch = content.match(/三、风格[：:\s]*([\s\S]*?)$/i);
            this.capturedNotes.style = styleMatch ? styleMatch[1].trim() : "";
        },

        normalizeCitations(citations) {
            if (!Array.isArray(citations)) return [];
            const seen = new Set();
            return citations.flatMap(citation => {
                if (!citation || typeof citation.url !== 'string') return [];
                try {
                    const url = new URL(citation.url);
                    if (!['http:', 'https:'].includes(url.protocol) || seen.has(url.href)) return [];
                    seen.add(url.href);
                    return [{
                        url: url.href,
                        title: typeof citation.title === 'string' && citation.title.trim()
                            ? citation.title.trim()
                            : url.hostname,
                    }];
                } catch (error) {
                    return [];
                }
            });
        },

        renderCitationLinks(listEl, citations) {
            if (!listEl) return 0;
            listEl.textContent = '';
            const safeCitations = this.normalizeCitations(citations);
            safeCitations.forEach(citation => {
                const item = document.createElement('li');
                const link = document.createElement('a');
                link.href = citation.url;
                link.textContent = citation.title;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                item.appendChild(link);
                listEl.appendChild(item);
            });
            return safeCitations.length;
        },

        updateResultsDisplay() {
            const titleEl = document.getElementById("stm-result-title");
            const lyricsEl = document.getElementById("stm-result-lyrics");
            const styleEl = document.getElementById("stm-result-style");
            const sourcesEl = document.getElementById("stm-result-sources");
            const sourcesList = document.getElementById("stm-result-sources-list");

            for (const [element, value] of [
                [titleEl, this.capturedNotes.title],
                [lyricsEl, this.capturedNotes.lyrics],
                [styleEl, this.capturedNotes.style],
            ]) {
                if (!element) continue;
                element.textContent = value || '';
                if (!value) {
                    const placeholder = document.createElement('span');
                    placeholder.className = 'stm-placeholder';
                    placeholder.textContent = '等待 LLM 返回创作笔记...';
                    element.appendChild(placeholder);
                }
            }

            const sourceCount = this.renderCitationLinks(sourcesList, this.capturedNotes.citations);
            if (sourcesEl) sourcesEl.hidden = sourceCount === 0;
        },

        // --- 历史记录管理 ---

        /**
         * 保存创作笔记到历史记录
         * @param {Object} notes - { title, lyrics, style, citations }
         * @param {string} source - 'generate' | 'capture'
         */
        saveNoteToHistory(notes, source) {
            if (!notes.title && !notes.lyrics && !notes.style) return;

            const history = this.loadNoteHistory();

            // 检查是否已存在相同的记录（根据歌名去重）
            const existingIndex = history.findIndex(h => h.title === notes.title && h.title);
            if (existingIndex !== -1) {
                // 更新已有记录的时间戳
                history[existingIndex].timestamp = Date.now();
                history[existingIndex].lyrics = notes.lyrics;
                history[existingIndex].style = notes.style;
                history[existingIndex].source = source;
                history[existingIndex].citations = this.normalizeCitations(notes.citations);
            } else {
                // 添加新记录
                history.unshift({
                    title: notes.title || "未命名",
                    lyrics: notes.lyrics || "",
                    style: notes.style || "",
                    citations: this.normalizeCitations(notes.citations),
                    source: source,
                    timestamp: Date.now()
                });
            }

            // 只保留最近 8 条
            while (history.length > 8) history.pop();

            try {
                localStorage.setItem('st_music_note_history', JSON.stringify(history));
            } catch (e) {
                console.error('[ST Music] 保存历史记录失败:', e);
            }
        },

        /**
         * 加载历史记录
         * @returns {Array}
         */
        loadNoteHistory() {
            try {
                const stored = localStorage.getItem('st_music_note_history');
                const history = stored ? JSON.parse(stored) : [];
                if (!Array.isArray(history)) return [];
                return history.filter(item => item && typeof item === 'object').map(item => ({
                    ...item,
                    citations: this.normalizeCitations(item.citations),
                }));
            } catch (e) {
                return [];
            }
        },

        /**
         * 切换历史面板显示/隐藏
         * @param {boolean} show
         */
        toggleHistory(show) {
            const overlay = document.getElementById('stm-history-overlay');
            if (!overlay) return;

            if (show) {
                this.renderHistoryList();
                overlay.style.display = 'block';
            } else {
                overlay.style.display = 'none';
            }
        },

        /**
         * 渲染历史记录列表
         */
        renderHistoryList() {
            const listEl = document.getElementById('stm-history-list');
            if (!listEl) return;

            const history = this.loadNoteHistory();

            if (history.length === 0) {
                listEl.innerHTML = '<div class="stm-history-empty">暂无历史记录</div>';
                return;
            }

            listEl.innerHTML = '';
            history.forEach((item, index) => {
                const entry = document.createElement('div');
                entry.className = 'stm-history-entry';

                const sourceIcon = item.source === 'api' || item.source === 'generate'
                    ? '<i class="fa-solid fa-feather-pointed"></i>'
                    : '<i class="fa-solid fa-comments"></i>';

                const timeStr = new Date(item.timestamp).toLocaleString('zh-CN', {
                    month: 'numeric', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });

                // 歌名行（可点击展开）
                const header = document.createElement('div');
                header.className = 'stm-history-entry-header';
                header.innerHTML = `
                    <span class="stm-history-source">${sourceIcon}</span>
                    <span class="stm-history-entry-title">${this.escapeHtml(item.title)}</span>
                    <span class="stm-history-time">${timeStr}</span>
                    <i class="fa-solid fa-chevron-down stm-history-chevron"></i>
                `;

                // 详情内容（默认隐藏）
                const detail = document.createElement('div');
                detail.className = 'stm-history-detail';
                detail.style.display = 'none';
                detail.innerHTML = `
                    <div class="stm-history-detail-section">
                        <div class="stm-history-detail-label">二、歌词结构</div>
                        <div class="stm-history-detail-content">${this.escapeHtml(item.lyrics) || '<span class="stm-placeholder">无</span>'}</div>
                    </div>
                    <div class="stm-history-detail-section">
                        <div class="stm-history-detail-label">三、风格</div>
                        <div class="stm-history-detail-content">${this.escapeHtml(item.style) || '<span class="stm-placeholder">无</span>'}</div>
                    </div>
                    <div class="stm-history-detail-actions">
                        <button class="stm-toggle-btn stm-history-load-btn" data-index="${index}">
                            <i class="fa-solid fa-arrow-rotate-left"></i> 加载到成果面板
                        </button>
                    </div>
                `;

                const citations = this.normalizeCitations(item.citations);
                if (citations.length) {
                    const sources = document.createElement('div');
                    sources.className = 'stm-history-detail-section';
                    const label = document.createElement('div');
                    label.className = 'stm-history-detail-label';
                    label.textContent = '参考来源';
                    const links = document.createElement('ol');
                    links.className = 'stm-citation-list';
                    this.renderCitationLinks(links, citations);
                    sources.appendChild(label);
                    sources.appendChild(links);
                    detail.insertBefore(sources, detail.querySelector('.stm-history-detail-actions'));
                }

                // 点击歌名展开/收起
                header.onclick = () => {
                    const isOpen = detail.style.display !== 'none';
                    detail.style.display = isOpen ? 'none' : 'block';
                    const chevron = header.querySelector('.stm-history-chevron');
                    if (chevron) {
                        chevron.classList.toggle('fa-chevron-down', isOpen);
                        chevron.classList.toggle('fa-chevron-up', !isOpen);
                    }
                };

                entry.appendChild(header);
                entry.appendChild(detail);
                listEl.appendChild(entry);

                // 绑定"加载到成果面板"按钮
                const loadBtn = detail.querySelector('.stm-history-load-btn');
                if (loadBtn) {
                    loadBtn.onclick = (e) => {
                        e.stopPropagation();
                        this.loadHistoryItem(index);
                    };
                }
            });
        },

        /**
         * 加载历史记录到成果面板
         * @param {number} index
         */
        loadHistoryItem(index) {
            const history = this.loadNoteHistory();
            if (index < 0 || index >= history.length) return;

            const item = history[index];
            this.capturedNotes = {
                title: item.title || "",
                lyrics: item.lyrics || "",
                style: item.style || "",
                citations: this.normalizeCitations(item.citations),
            };
            this.updateResultsDisplay();
            this.toggleHistory(false);

            if (typeof toastr !== "undefined") toastr.info(`已加载：${item.title}`);
        },

        /**
         * HTML 转义工具
         */
        escapeHtml(str) {
            if (!str) return '';
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/\n/g, '<br>');
        },

        // --- 复制功能 ---
        async writeClipboardText(text) {
            try {
                if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                    await navigator.clipboard.writeText(text);
                    return true;
                }
            } catch (error) {
                // 局域网 HTTP、权限拒绝或浏览器限制时使用兼容方案。
            }

            const activeElement = document.activeElement;
            const inputSelection = activeElement && typeof activeElement.selectionStart === 'number'
                ? [activeElement.selectionStart, activeElement.selectionEnd, activeElement.selectionDirection]
                : null;
            const selection = window.getSelection();
            const ranges = [];
            if (selection) {
                for (let i = 0; i < selection.rangeCount; i++) ranges.push(selection.getRangeAt(i).cloneRange());
            }

            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.readOnly = true;
            textarea.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;padding:0;border:0;opacity:0;font-size:16px;';
            let copied = false;
            try {
                document.body.appendChild(textarea);
                textarea.focus({ preventScroll: true });
                textarea.select();
                textarea.setSelectionRange(0, text.length);
                copied = typeof document.execCommand === 'function' && document.execCommand('copy');
            } catch (error) {
                copied = false;
            } finally {
                textarea.remove();
                if (activeElement && typeof activeElement.focus === 'function') {
                    try {
                        activeElement.focus({ preventScroll: true });
                        if (inputSelection) activeElement.setSelectionRange(...inputSelection);
                    } catch (error) { /* 已移除或不可聚焦的元素不影响复制结果。 */ }
                }
                if (selection) {
                    try {
                        selection.removeAllRanges();
                        ranges.forEach(range => selection.addRange(range));
                    } catch (error) { /* 原选区可能已被宿主更新。 */ }
                }
            }

            if (!copied) {
                if (typeof toastr !== 'undefined') toastr.warning('自动复制失败，请在弹出的文本框中手动复制');
                try {
                    window.prompt('自动复制失败，请复制下方文字（手机可长按全选后复制）：', text);
                } catch (error) {
                    // 浏览器禁用弹窗时也不产生未处理的异常。
                }
            }
            return Boolean(copied);
        },

        async copyToClipboard(text, btn) {
            if (!text) {
                if (typeof toastr !== "undefined") toastr.warning("没有内容可复制");
                return false;
            }
            // 移除自动清洗格式，以免误删 [风格] 等关键信息
            const cleanText = text.trim();
            if (!cleanText) {
                if (typeof toastr !== "undefined") toastr.warning("没有内容可复制");
                return false;
            }
            const copied = await this.writeClipboardText(cleanText);
            if (!copied) return false;
            if (btn) {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                }, 2000);
            }
            if (typeof toastr !== "undefined") toastr.success("已复制到剪贴板");
            return true;
        },

        // --- 播放器功能 ---
        // --- 播放器功能 ---

        // 加载播放列表 (Playlist.json + LocalStorage)
        async loadPlaylist() {
            this.player.playlist = [];

            // 1. Load Official Playlist.json (Removed)
            // this.player.playlist = []; // Ensure clear start


            // 2. Load User Links from LocalStorage
            try {
                const stored = localStorage.getItem("ST_Music_User_Links");
                if (stored) {
                    const userTracks = JSON.parse(stored);
                    userTracks.forEach(t => {
                        this.player.playlist.push({
                            name: t.name,
                            url: t.url,
                            id: Math.random().toString(36).substr(2, 9),
                            type: 'link'
                        });
                    });
                }
            } catch (e) {
                console.warn("[ST Music] Failed to load LocalStorage playlist", e);
            }

            this.renderPlaylist();
        },

        // 打开添加链接模态框
        openLinkModal() {
            const modal = document.getElementById("stm-link-modal");
            const urlInput = document.getElementById("stm-link-url");
            const nameInput = document.getElementById("stm-link-name");

            if (modal && urlInput && nameInput) {
                this._linkModalReturnFocus = document.activeElement;
                urlInput.value = "";
                nameInput.value = "";
                modal.style.display = "flex";
                urlInput.focus({ preventScroll: true });
                urlInput.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            }
        },

        // 关闭模态框
        closeLinkModal() {
            const modal = document.getElementById("stm-link-modal");
            if (modal) modal.style.display = "none";
            const returnFocus = this._linkModalReturnFocus;
            this._linkModalReturnFocus = null;
            if (returnFocus && returnFocus.isConnected && typeof returnFocus.focus === 'function') {
                returnFocus.focus({ preventScroll: true });
            }
        },

        // 确认添加链接
        confirmAddLink() {
            const urlInput = document.getElementById("stm-link-url");
            const nameInput = document.getElementById("stm-link-name");

            if (!urlInput) return;

            const url = urlInput.value.trim();
            let name = nameInput.value.trim();

            if (!url) {
                if (typeof toastr !== "undefined") toastr.warning("请输入有效的 URL");
                else alert("请输入有效的 URL");
                return;
            }

            // 简单验证
            if (!url.startsWith("http")) {
                if (typeof toastr !== "undefined") toastr.error("请输入以 http/https 开头的链接");
                else alert("请输入以 http/https 开头的链接");
                return;
            }

            // 自动提取文件名
            if (!name) {
                name = "未知歌曲";
                try {
                    const urlObj = new URL(url);
                    const pathName = urlObj.pathname;
                    name = pathName.substring(pathName.lastIndexOf('/') + 1) || "User Link";
                    name = decodeURIComponent(name);
                } catch (e) { }
            }

            const newTrack = { name, url };

            // Save to LocalStorage
            this.saveUserLink(newTrack);

            // Add to runtime
            this.player.playlist.push({
                name: newTrack.name,
                url: newTrack.url,
                id: Math.random().toString(36).substr(2, 9),
                type: 'link'
            });

            if (typeof toastr !== "undefined") toastr.success("已添加并保存！");
            this.renderPlaylist();
            this.closeLinkModal();
        },

        saveUserLink(track) {
            try {
                let current = [];
                const stored = localStorage.getItem("ST_Music_User_Links");
                if (stored) current = JSON.parse(stored);
                current.push(track);
                localStorage.setItem("ST_Music_User_Links", JSON.stringify(current));
            } catch (e) {
                console.error("Storage error:", e);
            }
        },

        // 移除用户链接
        removeUserLink(trackObj) {
            if (trackObj.type === 'official') return; // Cannot remove official

            if (trackObj.type === 'link') {
                try {
                    let current = [];
                    const stored = localStorage.getItem("ST_Music_User_Links");
                    if (stored) current = JSON.parse(stored);
                    // Filter out by url AND name to be safe
                    current = current.filter(t => t.url !== trackObj.url || t.name !== trackObj.name);
                    localStorage.setItem("ST_Music_User_Links", JSON.stringify(current));
                } catch (e) { console.error(e); }
            }

            // Runtime removal handled by render/splice
        },

        handleFileUpload(e) {
            const files = Array.from(e.target.files || []);
            if (files.length === 0) return;

            if (typeof toastr !== "undefined") toastr.info("注意：本地上传仅当前会话有效，刷新后丢失。建议使用外部链接。");

            files.forEach(file => {
                this.player.playlist.push({
                    name: file.name.replace(/\.[^/.]+$/, ""),
                    url: URL.createObjectURL(file),
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'local'
                });
            });
            this.renderPlaylist();

            // Reset input
            e.target.value = '';
        },

        renderPlaylist() {
            const container = document.getElementById("stm-playlist");
            if (!container) return;

            if (this.player.playlist.length === 0) {
                container.innerHTML = `
                    <div class="stm-playlist-empty">
                        <span class="stm-music-icon"><i class="fa-solid fa-music"></i></span>
                        <span class="stm-empty-text">No Tape Loaded</span>
                    </div>
                `;
                return;
            }

            container.innerHTML = "";
            this.player.playlist.forEach((track, idx) => {
                const item = document.createElement("div");
                item.className = "stm-track-item" + (idx === this.player.currentTrackIndex ? " active" : "");

                // Format number: 01, 02...
                const num = (idx + 1).toString().padStart(2, '0');

                let deleteBtn = '';
                if (track.type === 'link' || track.type === 'local') {
                    deleteBtn = `<button class="stm-track-delete" title="Remove"><i class="fa-solid fa-xmark"></i></button>`;
                }

                item.innerHTML = `
                    <div class="stm-track-info">
                        <span class="stm-track-num">${num}</span>
                        <span class="stm-track-name">${track.name}</span>
                    </div>
                    ${deleteBtn}
                `;

                // Click to play
                item.onclick = (e) => {
                    // Prevent play if clicking delete
                    if (e.target.closest('.stm-track-delete')) return;
                    this.playTrack(idx);
                };

                // Delete handler
                const del = item.querySelector('.stm-track-delete');
                if (del) {
                    del.onclick = (e) => {
                        e.stopPropagation();
                        // Remove from playlist
                        this.player.playlist.splice(idx, 1);
                        // Also remove from local storage if link
                        if (track.type === 'link') this.removeUserLink(track);
                        // Stop playing if deleted current
                        if (idx === this.player.currentTrackIndex) {
                            const audio = document.getElementById("stm-audio-player");
                            this.player._playRequestId = (this.player._playRequestId || 0) + 1;
                            if (audio) {
                                audio.pause();
                                audio.removeAttribute('src');
                                audio.load();
                            }
                            this.player.currentTrackIndex = null;
                            this.player.isPlaying = false;
                            this.updatePlayIcon(false);
                        } else if (Number.isInteger(this.player.currentTrackIndex) && idx < this.player.currentTrackIndex) {
                            // Adjust index
                            this.player.currentTrackIndex--;
                        }
                        if (track.type === 'local') URL.revokeObjectURL(track.url);
                        this.renderPlaylist();
                    };
                }

                container.appendChild(item);
            });
        },

        playTrack(index) {
            if (!Number.isInteger(index) || index < 0 || index >= this.player.playlist.length) return;

            this.player.currentTrackIndex = index;
            const track = this.player.playlist[index];
            const audio = document.getElementById("stm-audio-player");

            if (audio) {
                audio.src = track.url;
                this.startAudioPlayback(audio);
            }

            this.renderPlaylist();
        },

        startAudioPlayback(audio) {
            const requestId = (this.player._playRequestId || 0) + 1;
            this.player._playRequestId = requestId;
            this.player.isPlaying = false;
            this.updatePlayIcon(false);
            const onFailure = error => {
                if (requestId !== this.player._playRequestId) return;
                this.player.isPlaying = false;
                this.updatePlayIcon(false);
                if (error && error.name === 'AbortError') return;
                console.error('[ST Music] Play error:', error);
                if (typeof toastr !== 'undefined') toastr.error('播放失败: ' + (error && error.message || '请检查音频链接或文件格式'));
            };
            try {
                // 必须在点击事件内直接调用，保留移动浏览器要求的用户手势。
                const pending = audio.play();
                return Promise.resolve(pending).then(() => {
                    if (requestId !== this.player._playRequestId) return;
                    this.player.isPlaying = !audio.paused && !audio.ended;
                    this.updatePlayIcon(this.player.isPlaying);
                }, onFailure);
            } catch (error) {
                onFailure(error);
            }
        },

        togglePlay() {
            const audio = document.getElementById("stm-audio-player");
            if (!audio) return;

            if (this.player.playlist.length === 0) return;

            const index = this.player.currentTrackIndex;
            if (!Number.isInteger(index) || index < 0 || index >= this.player.playlist.length) {
                this.playTrack(0);
                return;
            }
            if (!audio.getAttribute('src')) {
                this.playTrack(index);
                return;
            }

            if (audio.paused) {
                this.startAudioPlayback(audio);
            } else {
                this.player._playRequestId = (this.player._playRequestId || 0) + 1;
                audio.pause();
                this.player.isPlaying = false;
                this.updatePlayIcon(false);
            }
        },

        prevTrack() {
            if (this.player.playlist.length === 0) return;
            const index = this.player.currentTrackIndex;
            const newIndex = Number.isInteger(index) && index >= 0 && index < this.player.playlist.length
                ? (index - 1 + this.player.playlist.length) % this.player.playlist.length
                : 0;
            this.playTrack(newIndex);
        },

        nextTrack() {
            if (this.player.playlist.length === 0) return;
            const index = this.player.currentTrackIndex;
            const newIndex = Number.isInteger(index) && index >= 0 && index < this.player.playlist.length
                ? (index + 1) % this.player.playlist.length
                : 0;
            this.playTrack(newIndex);
        },

        updatePlayIcon(isPlaying) {
            const btn = document.getElementById("stm-btn-play");
            if (btn) {
                btn.innerHTML = isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
            }
        }
    };

    // 启动
    window.STMusic = STMusic;
    STMusic.init();
}
