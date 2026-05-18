/**
 * Dynamic Route Loader - Enterprise Scalable Architecture
 * Automatically discovers, loads, and manages routes from organized folder structure
 */

const fs = require('fs');
const path = require('path');
const { APP } = require('../config');

class DynamicRouteLoader {
  constructor(options = {}) {
    this.routesPath = options.routesPath || path.join(__dirname, '..', 'routes');
    this.cache = new Map();
    this.loadedRoutes = new Map();
    this.routeRegistry = new Map();
    this.middlewareRegistry = new Map();

    // Route loading configuration
    this.config = {
      filePattern: options.filePattern || /\.js$/,
      indexFiles: options.indexFiles || ['index.js'],
      excludePatterns: options.excludePatterns || [/^\./, /test/, /spec/],
      autoReload: options.autoReload || false,
      ...options,
    };
  }

  /**
   * Load all routes from organized folder structure
   * @param {Object} app - Express app instance
   * @param {Object} options - Loading options
   */
  async loadAllRoutes(app, options = {}) {
    console.log('🔄 Loading routes dynamically from organized structure...');

    const startTime = Date.now();
    const routeGroups = await this.discoverRouteGroups();

    for (const [groupName, groupConfig] of Object.entries(routeGroups)) {
      if (this.shouldLoadRouteGroup(groupName, options)) {
        await this.loadRouteGroup(app, groupName, groupConfig, options);
      }
    }

    const loadTime = Date.now() - startTime;
    console.log(`✅ Loaded ${this.loadedRoutes.size} routes in ${loadTime}ms`);
    console.log(`📊 Route groups: ${Object.keys(routeGroups).join(', ')}`);

    return {
      loadedRoutes: this.loadedRoutes.size,
      routeGroups: Object.keys(routeGroups),
      loadTime,
    };
  }

  /**
   * Discover route groups from folder structure
   */
  async discoverRouteGroups() {
    const routeGroups = {};

    try {
      const folders = await fs.promises.readdir(this.routesPath);

      for (const folder of folders) {
        const folderPath = path.join(this.routesPath, folder);
        const stats = await fs.promises.stat(folderPath);

        if (stats.isDirectory() && !this.isExcludedFolder(folder)) {
          const routeGroup = await this.analyzeRouteGroup(folder, folderPath);
          if (routeGroup) {
            routeGroups[folder] = routeGroup;
          }
        }
      }
    } catch (error) {
      console.error('❌ Error discovering route groups:', error);
    }

    return routeGroups;
  }

  /**
   * Analyze a route group folder
   */
  async analyzeRouteGroup(groupName, folderPath) {
    const routeGroup = {
      name: groupName,
      path: folderPath,
      routes: [],
      middleware: [],
      config: {},
    };

    try {
      const files = await fs.promises.readdir(folderPath);

      for (const file of files) {
        const filePath = path.join(folderPath, file);

        if (this.isRouteFile(file)) {
          const routeInfo = await this.analyzeRouteFile(file, filePath, groupName);
          if (routeInfo) {
            routeGroup.routes.push(routeInfo);
          }
        } else if (file === 'middleware.js') {
          routeGroup.middleware = require(filePath);
        } else if (file === 'config.json') {
          routeGroup.config = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));
        }
      }

      // Sort routes by priority if specified
      routeGroup.routes.sort((a, b) => (a.priority || 0) - (b.priority || 0));

    } catch (error) {
      console.error(`❌ Error analyzing route group ${groupName}:`, error);
      return null;
    }

    return routeGroup.routes.length > 0 ? routeGroup : null;
  }

  /**
   * Analyze a route file
   */
  async analyzeRouteFile(filename, filePath, groupName) {
    try {
      // Load route module
      const routeModule = require(filePath);

      if (!routeModule || typeof routeModule !== 'function') {
        return null;
      }

      // Extract route metadata
      const routeInfo = {
        filename,
        path: filePath,
        group: groupName,
        module: routeModule,
        metadata: routeModule.metadata || {},
        basePath: this.getRouteBasePath(filename, groupName),
        priority: routeModule.priority || 0,
      };

      // Extract middleware information
      if (routeModule.middleware) {
        routeInfo.middleware = Array.isArray(routeModule.middleware)
          ? routeModule.middleware
          : [routeModule.middleware];
      }

      return routeInfo;

    } catch (error) {
      console.error(`❌ Error analyzing route file ${filename}:`, error);
      return null;
    }
  }

  /**
   * Load a route group into the app
   */
  async loadRouteGroup(app, groupName, groupConfig, options = {}) {
    console.log(`📦 Loading route group: ${groupName}`);

    const { routes, middleware: groupMiddleware, config: groupConfigData } = groupConfig;
    const groupBasePath = this.getGroupBasePath(groupName);

    // Apply group-level middleware
    let router = require('express').Router();
    if (groupMiddleware && groupMiddleware.length > 0) {
      router.use(...groupMiddleware);
    }

    // Load individual routes
    for (const routeInfo of routes) {
      try {
        const routePath = routeInfo.basePath;
        const routeModule = routeInfo.module;

        // Apply route-level middleware
        if (routeInfo.middleware && routeInfo.middleware.length > 0) {
          router.use(routePath, ...routeInfo.middleware, routeModule);
        } else {
          router.use(routePath, routeModule);
        }

        // Register route in global registry
        const fullPath = path.join(groupBasePath, routePath).replace(/\\/g, '/');
        this.loadedRoutes.set(fullPath, routeInfo);
        this.routeRegistry.set(`${groupName}:${routeInfo.filename}`, routeInfo);

        console.log(`  ✅ ${fullPath} (${routeInfo.filename})`);

      } catch (error) {
        console.error(`❌ Error loading route ${routeInfo.filename}:`, error);
      }
    }

    // Mount router on app
    app.use(groupBasePath, router);
  }

  /**
   * Get base path for a route group
   */
  getGroupBasePath(groupName) {
    const basePaths = {
      auth: '/api/auth',
      admin: '/api/admin',
      hod: '/api/hod',
      faculty: '/api/faculty',
      student: '/api/student',
      academic: '/api/academic',
      ai: '/api/ai',
      learning: '/api/learning',
      assessment: '/api/assessment',
      communication: '/api/communication',
      analytics: '/api/analytics',
      system: '/api/system',
      shared: '/api/shared',
    };

    return basePaths[groupName] || `/api/${groupName}`;
  }

  /**
   * Get base path for a route file
   */
  getRouteBasePath(filename, groupName) {
    // Remove extension and 'index' from filename
    const baseName = filename.replace(/\.js$/, '').replace(/^index$/, '');

    if (baseName) {
      return `/${baseName}`;
    }

    return '';
  }

  /**
   * Check if a file is a route file
   */
  isRouteFile(filename) {
    if (!this.config.filePattern.test(filename)) return false;
    if (this.config.excludePatterns.some(pattern => pattern.test(filename))) return false;
    if (this.config.indexFiles.includes(filename)) return true;
    if (filename.includes('controller') || filename.includes('service')) return false;

    return true;
  }

  /**
   * Check if a folder should be excluded
   */
  isExcludedFolder(folderName) {
    return this.config.excludePatterns.some(pattern => pattern.test(folderName));
  }

  /**
   * Check if a route group should be loaded
   */
  shouldLoadRouteGroup(groupName, options) {
    // Check feature flags
    if (options.featureFlags && options.featureFlags[groupName] === false) {
      return false;
    }

    // Check environment restrictions
    if (options.environment && options.environment !== process.env.NODE_ENV) {
      return false;
    }

    return true;
  }

  /**
   * Get loaded routes information
   */
  getLoadedRoutes() {
    return {
      totalRoutes: this.loadedRoutes.size,
      routeGroups: Array.from(new Set(Array.from(this.loadedRoutes.values()).map(r => r.group))),
      routes: Array.from(this.loadedRoutes.entries()).map(([path, info]) => ({
        path,
        group: info.group,
        filename: info.filename,
        priority: info.priority,
      })),
    };
  }

  /**
   * Get route registry information
   */
  getRouteRegistry() {
    return Object.fromEntries(this.routeRegistry);
  }

  /**
   * Reload routes (for development)
   */
  async reloadRoutes() {
    if (!this.config.autoReload) return;

    console.log('🔄 Reloading routes...');

    // Clear require cache for route files
    for (const [path] of this.loadedRoutes) {
      delete require.cache[require.resolve(path)];
    }

    this.cache.clear();
    this.loadedRoutes.clear();
    this.routeRegistry.clear();

    // Note: In a real implementation, you'd restart the app or use a more sophisticated reload mechanism
  }

  /**
   * Get route statistics
   */
  getStatistics() {
    const routesByGroup = {};
    const middlewareByGroup = {};

    for (const [path, info] of this.loadedRoutes) {
      routesByGroup[info.group] = (routesByGroup[info.group] || 0) + 1;

      if (info.middleware) {
        middlewareByGroup[info.group] = (middlewareByGroup[info.group] || 0) + info.middleware.length;
      }
    }

    return {
      totalRoutes: this.loadedRoutes.size,
      totalGroups: Object.keys(routesByGroup).length,
      routesByGroup,
      middlewareByGroup,
      averageRoutesPerGroup: this.loadedRoutes.size / Object.keys(routesByGroup).length,
    };
  }
}

module.exports = DynamicRouteLoader;
