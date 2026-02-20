/**
 * ST Music Creator 设置面板
 * 作为第 4 个 Tab 嵌入面板，复用现有 CSS 类
 */

(function () {
    "use strict";

    /**
     * 创建设置页面 DOM
     * @returns {HTMLElement} 设置页面的内容容器
     */
    function createSettingsPage() {
        const config = window.MusicApiService.getApiConfig();
        const contextCount = window.MusicApiService.getContextCount();
        const geminiConfig = window.MusicApiService.getGeminiConfig();

        const container = document.createElement("div");
        container.className = "stm-form-scroll";

        container.innerHTML = `
      <!-- Gemini API 配置 -->
      <div class="stm-form-group">
        <label class="stm-label">01 / Gemini API</label>
        <div class="stm-settings-card">
          <div class="stm-settings-field">
            <span class="stm-settings-field-label">API 密钥</span>
            <input type="password" id="stm-gemini-key"
                   class="stm-input"
                   value="${escapeHtml(geminiConfig.key)}"
                   placeholder="AIza...">
          </div>
          <div class="stm-settings-field">
            <span class="stm-settings-field-label">模型</span>
            <select id="stm-gemini-model" class="stm-input stm-select">
              ${getGeminiModelOptions(geminiConfig.model)}
            </select>
          </div>
          <div class="stm-settings-btn-row">
            <button class="stm-toggle-btn stm-settings-save-btn" id="stm-save-gemini">
              <i class="fa-solid fa-check"></i> 保存
            </button>
            <button class="stm-toggle-btn" id="stm-clear-gemini">
              <i class="fa-solid fa-eraser"></i> 清除
            </button>
          </div>
        </div>
      </div>

      <!-- 其他模型 API 配置 -->
      <div class="stm-form-group">
        <label class="stm-label">02 / Other Model</label>
        <div class="stm-settings-card">
          <div class="stm-settings-field">
            <span class="stm-settings-field-label">API 地址</span>
            <input type="text" id="stm-api-url"
                   class="stm-input"
                   value="${escapeHtml(config.url)}"
                   placeholder="https://api.example.com/v1">
            <span class="stm-hint stm-settings-hint">支持自动补全 /v1/chat/completions</span>
          </div>
          <div class="stm-settings-field">
            <span class="stm-settings-field-label">API 密钥</span>
            <input type="password" id="stm-api-key"
                   class="stm-input"
                   value="${escapeHtml(config.key)}"
                   placeholder="sk-...">
          </div>
          <div class="stm-settings-field">
            <span class="stm-settings-field-label">模型名称</span>
            <input type="text" id="stm-api-model"
                   class="stm-input"
                   value="${escapeHtml(config.model)}"
                   placeholder="gpt-4o">
          </div>
          <div class="stm-settings-btn-row">
            <button class="stm-toggle-btn stm-settings-save-btn" id="stm-save-other">
              <i class="fa-solid fa-check"></i> 保存
            </button>
            <button class="stm-toggle-btn" id="stm-clear-other">
              <i class="fa-solid fa-eraser"></i> 清除
            </button>
          </div>
        </div>
      </div>

      <!-- 参数配置 -->
      <div class="stm-form-group">
        <label class="stm-label">03 / Parameters</label>
        <div class="stm-settings-card">
          <div class="stm-settings-row">
            <div class="stm-settings-field stm-settings-half">
              <span class="stm-settings-field-label">Temperature</span>
              <input type="number" id="stm-api-temp"
                     class="stm-input"
                     value="${config.temperature || 0.8}"
                     min="0" max="2" step="0.1">
            </div>
            <div class="stm-settings-field stm-settings-half">
              <span class="stm-settings-field-label">Max Tokens</span>
              <input type="number" id="stm-api-tokens"
                     class="stm-input"
                     value="${config.max_tokens || 3000}"
                     min="100" max="8000" step="100">
            </div>
          </div>
          <div class="stm-settings-field">
            <span class="stm-settings-field-label">上下文消息数量</span>
            <input type="number" id="stm-context-count"
                   class="stm-input"
                   value="${contextCount}"
                   min="0" max="20" step="1">
            <span class="stm-hint stm-settings-hint">读取 SillyTavern 最近 N 条消息作为上下文（0 = 不读取）</span>
          </div>
          <div class="stm-settings-btn-row">
            <button class="stm-toggle-btn stm-settings-save-btn" id="stm-save-params">
              <i class="fa-solid fa-check"></i> 保存参数
            </button>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="stm-form-group">
        <label class="stm-label">04 / Info</label>
        <div class="stm-settings-card stm-settings-info">
          <p>• 优先使用 Gemini API（若已配置 Key）</p>
          <p>• 否则使用 Other Model 的 OpenAI 兼容接口</p>
          <p>• 点击创作页底部的 <i class="fa-solid fa-feather-pointed"></i> 按钮直接调用独立 API</p>
          <p>• 生成结果将直接显示在「成果」页面</p>
          <p>• API 需支持浏览器跨域（CORS）请求</p>
        </div>
      </div>
    `;

        return container;
    }

    /**
     * 绑定设置页面事件
     */
    function bindSettingsEvents() {
        // 保存 Gemini 配置
        const saveGeminiBtn = document.getElementById("stm-save-gemini");
        if (saveGeminiBtn) {
            saveGeminiBtn.onclick = () => {
                const geminiConfig = {
                    key: document.getElementById("stm-gemini-key").value.trim(),
                    model: document.getElementById("stm-gemini-model").value,
                };
                // 同时保存 temperature / max_tokens
                saveParamsConfig();
                if (window.MusicApiService.saveGeminiConfig(geminiConfig)) {
                    showSettingsToast("Gemini 配置已保存");
                }
            };
        }

        // 清除 Gemini 配置
        const clearGeminiBtn = document.getElementById("stm-clear-gemini");
        if (clearGeminiBtn) {
            clearGeminiBtn.onclick = () => {
                const keyInput = document.getElementById("stm-gemini-key");
                if (keyInput) keyInput.value = "";
                window.MusicApiService.saveGeminiConfig({
                    key: "",
                    model: document.getElementById("stm-gemini-model").value,
                });
                showSettingsToast("Gemini 设置已清除");
            };
        }

        // 保存其他模型配置
        const saveOtherBtn = document.getElementById("stm-save-other");
        if (saveOtherBtn) {
            saveOtherBtn.onclick = () => {
                const config = {
                    url: document.getElementById("stm-api-url").value.trim(),
                    key: document.getElementById("stm-api-key").value.trim(),
                    model: document.getElementById("stm-api-model").value.trim(),
                    temperature:
                        parseFloat(document.getElementById("stm-api-temp").value) || 0.8,
                    max_tokens:
                        parseInt(document.getElementById("stm-api-tokens").value) || 3000,
                };
                if (window.MusicApiService.saveApiConfig(config)) {
                    showSettingsToast("API 配置已保存");
                }
            };
        }

        // 清除其他模型配置
        const clearOtherBtn = document.getElementById("stm-clear-other");
        if (clearOtherBtn) {
            clearOtherBtn.onclick = () => {
                const urlInput = document.getElementById("stm-api-url");
                const keyInput = document.getElementById("stm-api-key");
                const modelInput = document.getElementById("stm-api-model");
                if (urlInput) urlInput.value = "";
                if (keyInput) keyInput.value = "";
                if (modelInput) modelInput.value = "";
                showSettingsToast("其他模型设置已清除");
            };
        }

        // 保存参数配置
        const saveParamsBtn = document.getElementById("stm-save-params");
        if (saveParamsBtn) {
            saveParamsBtn.onclick = () => {
                saveParamsConfig();
                showSettingsToast("参数配置已保存");
            };
        }
    }

    /**
     * 保存参数配置（Temperature、Max Tokens、上下文数量）
     */
    function saveParamsConfig() {
        const currentConfig = window.MusicApiService.getApiConfig();
        currentConfig.temperature =
            parseFloat(document.getElementById("stm-api-temp").value) || 0.8;
        currentConfig.max_tokens =
            parseInt(document.getElementById("stm-api-tokens").value) || 3000;
        window.MusicApiService.saveApiConfig(currentConfig);

        const count =
            parseInt(document.getElementById("stm-context-count").value) || 0;
        window.MusicApiService.saveContextCount(count);
    }

    /**
     * 显示设置操作提示
     */
    function showSettingsToast(message) {
        if (typeof toastr !== "undefined") {
            toastr.success(message);
        } else {
            alert(message);
        }
    }

    // ========== 工具函数 ==========

    function escapeHtml(str) {
        if (!str) return "";
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getGeminiModelOptions(currentModel) {
        const models = [
            { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
            { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
            { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
        ];
        return models
            .map(
                (m) =>
                    `<option value="${m.value}" ${currentModel === m.value ? "selected" : ""}>${m.label}</option>`
            )
            .join("");
    }

    // ========== 导出到全局 ==========

    window.MusicSettings = {
        createSettingsPage,
        bindSettingsEvents,
    };

    console.info("[Music Settings] 模块已加载");
})();
