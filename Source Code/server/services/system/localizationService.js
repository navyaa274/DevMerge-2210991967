const fs = require('fs');
const path = require('path');
const cacheManager = require('../../utils/cacheManager');

class LocalizationService {
    constructor() {
        this.localesPath = path.join(__dirname, '..', '..', 'locales');
        this.supportedLanguages = ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'fr', 'es', 'de'];
        this.defaultLanguage = 'en';

        if (!fs.existsSync(this.localesPath)) {
            fs.mkdirSync(this.localesPath, { recursive: true });
        }
    }

    /**
     * Get translation for a specific key
     */
    async getTranslation(lang, key, params = {}) {
        const language = this.supportedLanguages.includes(lang) ? lang : this.defaultLanguage;
        const cacheKey = `translation_${language}`;

        let translations = await cacheManager.get(cacheKey);

        if (!translations) {
            translations = this.loadLocaleFile(language);
            await cacheManager.set(cacheKey, translations, 3600);
        }

        let value = translations[key] || key;

        // Replace params
        Object.keys(params).forEach(param => {
            value = value.replace(`{${param}}`, params[param]);
        });

        return value;
    }

    /**
     * Load locale file from disk
     */
    loadLocaleFile(lang) {
        const filePath = path.join(this.localesPath, `${lang}.json`);
        if (fs.existsSync(filePath)) {
            try {
                return JSON.parse(fs.readFileSync(filePath, 'utf8'));
            } catch (e) {
                console.error(`Error parsing locale file for ${lang}`, e);
                return {};
            }
        }

        // Create default file if not exists for English
        if (lang === 'en') {
            const defaultContent = {
                "welcome": "Welcome to DevMerge University",
                "login_success": "Successfully logged in as {name}",
                "error_generic": "An unexpected error occurred. Please try again later.",
                "course_enrolled": "You have successfully enrolled in {courseName}"
            };
            fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2));
            return defaultContent;
        }

        return {};
    }

    /**
     * Update translations in real-time
     */
    async updateTranslation(lang, key, value) {
        if (!this.supportedLanguages.includes(lang)) return false;

        const translations = this.loadLocaleFile(lang);
        translations[key] = value;

        const filePath = path.join(this.localesPath, `${lang}.json`);
        fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));

        await cacheManager.invalidate(`translation_${lang}`);
        return true;
    }

    /**
     * Middleware to detect language
     */
    middleware() {
        return (req, res, next) => {
            const lang = req.headers['accept-language']?.split(',')[0]?.split('-')[0] ||
                req.query.lang ||
                this.defaultLanguage;

            req.language = this.supportedLanguages.includes(lang) ? lang : this.defaultLanguage;

            // Helper for translate inside controllers
            req.t = (key, params) => this.getTranslation(req.language, key, params);

            next();
        };
    }
}

module.exports = new LocalizationService();
