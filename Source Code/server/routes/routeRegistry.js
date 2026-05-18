/**
 * Route Registry System - Enterprise Scalable Architecture
 * Centralized route management, metadata, and discovery
 */

const { APP } = require('../config');

class RouteRegistry {
  constructor() {
    this.routes = new Map();
    this.groups = new Map();
    this.metadata = new Map();
    this.dependencies = new Map();
    this.middleware = new Map();
    this.versions = new Map();
  }

  /**
   * Register a route with metadata
   */
  register(routePath, routeConfig) {
    const route = {
      path: routePath,
      method: routeConfig.method || 'GET',
      handler: routeConfig.handler,
      group: routeConfig.group || 'default',
      version: routeConfig.version || 'v1',
      priority: routeConfig.priority || 0,
      metadata: routeConfig.metadata || {},
      middleware: routeConfig.middleware || [],
      dependencies: routeConfig.dependencies || [],
      permissions: routeConfig.permissions || [],
      rateLimit: routeConfig.rateLimit,
      cache: routeConfig.cache,
      validation: routeConfig.validation,
      documentation: routeConfig.documentation,
      deprecated: routeConfig.deprecated || false,
      deprecatedMessage: routeConfig.deprecatedMessage,
      alternativeRoute: routeConfig.alternativeRoute,
      tags: routeConfig.tags || [],
      ...routeConfig,
    };

    // Store route
    this.routes.set(routePath, route);

    // Group routes
    if (!this.groups.has(route.group)) {
      this.groups.set(route.group, []);
    }
    this.groups.get(route.group).push(route);

    // Version management
    if (!this.versions.has(route.version)) {
      this.versions.set(route.version, []);
    }
    this.versions.get(route.version).push(route);

    // Middleware mapping
    route.middleware.forEach(mw => {
      if (!this.middleware.has(mw.name || mw)) {
        this.middleware.set(mw.name || mw, []);
      }
      this.middleware.get(mw.name || mw).push(route);
    });

    // Dependency tracking
    route.dependencies.forEach(dep => {
      if (!this.dependencies.has(dep)) {
        this.dependencies.set(dep, []);
      }
      this.dependencies.get(dep).push(route);
    });

    // Metadata indexing
    this.metadata.set(routePath, route.metadata);

    return route;
  }

  /**
   * Unregister a route
   */
  unregister(routePath) {
    const route = this.routes.get(routePath);
    if (!route) return false;

    // Remove from groups
    const groupRoutes = this.groups.get(route.group) || [];
    const index = groupRoutes.findIndex(r => r.path === routePath);
    if (index > -1) {
      groupRoutes.splice(index, 1);
    }

    // Remove from versions
    const versionRoutes = this.versions.get(route.version) || [];
    const versionIndex = versionRoutes.findIndex(r => r.path === routePath);
    if (versionIndex > -1) {
      versionRoutes.splice(versionIndex, 1);
    }

    // Remove from middleware mapping
    route.middleware.forEach(mw => {
      const mwRoutes = this.middleware.get(mw.name || mw) || [];
      const mwIndex = mwRoutes.findIndex(r => r.path === routePath);
      if (mwIndex > -1) {
        mwRoutes.splice(mwIndex, 1);
      }
    });

    // Remove from dependencies
    route.dependencies.forEach(dep => {
      const depRoutes = this.dependencies.get(dep) || [];
      const depIndex = depRoutes.findIndex(r => r.path === routePath);
      if (depIndex > -1) {
        depRoutes.splice(depIndex, 1);
      }
    });

    // Remove route and metadata
    this.routes.delete(routePath);
    this.metadata.delete(routePath);

    return true;
  }

  /**
   * Get route by path
   */
  getRoute(routePath) {
    return this.routes.get(routePath);
  }

  /**
   * Get routes by group
   */
  getRoutesByGroup(groupName) {
    return this.groups.get(groupName) || [];
  }

  /**
   * Get routes by version
   */
  getRoutesByVersion(version) {
    return this.versions.get(version) || [];
  }

  /**
   * Get routes by tag
   */
  getRoutesByTag(tag) {
    return Array.from(this.routes.values()).filter(route =>
      route.tags && route.tags.includes(tag)
    );
  }

  /**
   * Get routes by middleware
   */
  getRoutesByMiddleware(middlewareName) {
    return this.middleware.get(middlewareName) || [];
  }

  /**
   * Get routes by dependency
   */
  getRoutesByDependency(dependency) {
    return this.dependencies.get(dependency) || [];
  }

  /**
   * Get deprecated routes
   */
  getDeprecatedRoutes() {
    return Array.from(this.routes.values()).filter(route => route.deprecated);
  }

  /**
   * Search routes by criteria
   */
  searchRoutes(criteria = {}) {
    let routes = Array.from(this.routes.values());

    if (criteria.group) {
      routes = routes.filter(route => route.group === criteria.group);
    }

    if (criteria.version) {
      routes = routes.filter(route => route.version === criteria.version);
    }

    if (criteria.method) {
      routes = routes.filter(route => route.method === criteria.method);
    }

    if (criteria.tag) {
      routes = routes.filter(route => route.tags && route.tags.includes(criteria.tag));
    }

    if (criteria.deprecated !== undefined) {
      routes = routes.filter(route => route.deprecated === criteria.deprecated);
    }

    if (criteria.path) {
      routes = routes.filter(route => route.path.includes(criteria.path));
    }

    if (criteria.hasMiddleware) {
      routes = routes.filter(route => route.middleware && route.middleware.length > 0);
    }

    if (criteria.hasPermissions) {
      routes = routes.filter(route => route.permissions && route.permissions.length > 0);
    }

    return routes;
  }

  /**
   * Get route statistics
   */
  getStatistics() {
    const routes = Array.from(this.routes.values());

    return {
      totalRoutes: routes.length,
      totalGroups: this.groups.size,
      totalVersions: this.versions.size,
      routesByGroup: Object.fromEntries(
        Array.from(this.groups.entries()).map(([group, groupRoutes]) => [group, groupRoutes.length])
      ),
      routesByVersion: Object.fromEntries(
        Array.from(this.versions.entries()).map(([version, versionRoutes]) => [version, versionRoutes.length])
      ),
      routesByMethod: routes.reduce((acc, route) => {
        acc[route.method] = (acc[route.method] || 0) + 1;
        return acc;
      }, {}),
      deprecatedRoutes: routes.filter(r => r.deprecated).length,
      routesWithMiddleware: routes.filter(r => r.middleware && r.middleware.length > 0).length,
      routesWithPermissions: routes.filter(r => r.permissions && r.permissions.length > 0).length,
      routesWithCache: routes.filter(r => r.cache).length,
      routesWithValidation: routes.filter(r => r.validation).length,
    };
  }

  /**
   * Validate route dependencies
   */
  validateDependencies() {
    const issues = [];

    for (const [dep, routes] of this.dependencies) {
      // Check if dependency exists (this would integrate with service registry)
      if (!this.isDependencyAvailable(dep)) {
        routes.forEach(route => {
          issues.push({
            type: 'missing_dependency',
            route: route.path,
            dependency: dep,
            severity: 'error',
            message: `Route ${route.path} depends on unavailable service: ${dep}`,
          });
        });
      }
    }

    return issues;
  }

  /**
   * Check if dependency is available (placeholder - integrate with service discovery)
   */
  isDependencyAvailable(dependency) {
    // This would integrate with service discovery/health checks
    const availableServices = [
      'database', 'redis', 'ai-service', 'code-executor',
      'email-service', 'file-storage', 'notification-service'
    ];

    return availableServices.includes(dependency);
  }

  /**
   * Generate API documentation
   */
  generateAPIDocs(options = {}) {
    const { version = 'v1', format = 'json' } = options;
    const routes = this.getRoutesByVersion(version);

    const docs = {
      version,
      generatedAt: new Date().toISOString(),
      totalRoutes: routes.length,
      routes: routes.map(route => ({
        path: route.path,
        method: route.method,
        group: route.group,
        description: route.metadata.description || '',
        parameters: route.metadata.parameters || [],
        responses: route.metadata.responses || {},
        permissions: route.permissions,
        deprecated: route.deprecated,
        tags: route.tags,
        examples: route.metadata.examples || [],
      })),
      statistics: this.getStatistics(),
    };

    return format === 'json' ? docs : JSON.stringify(docs, null, 2);
  }

  /**
   * Export routes for external systems (monitoring, API gateway, etc.)
   */
  exportRoutes(format = 'json') {
    const routes = Array.from(this.routes.values()).map(route => ({
      path: route.path,
      method: route.method,
      group: route.group,
      version: route.version,
      permissions: route.permissions,
      deprecated: route.deprecated,
      tags: route.tags,
      rateLimit: route.rateLimit,
      cache: route.cache,
    }));

    if (format === 'json') return routes;
    if (format === 'csv') {
      const csv = routes.map(route =>
        `${route.path},${route.method},${route.group},${route.version},${route.permissions.join(';')},${route.deprecated}`
      ).join('\n');
      return `path,method,group,version,permissions,deprecated\n${csv}`;
    }

    return routes;
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    const stats = this.getStatistics();
    const dependencyIssues = this.validateDependencies();

    return {
      status: dependencyIssues.length === 0 ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      statistics: stats,
      issues: dependencyIssues,
      uptime: process.uptime(),
    };
  }

  /**
   * Clear all registries (for testing)
   */
  clear() {
    this.routes.clear();
    this.groups.clear();
    this.metadata.clear();
    this.dependencies.clear();
    this.middleware.clear();
    this.versions.clear();
  }
}

module.exports = RouteRegistry;
