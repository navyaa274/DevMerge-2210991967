/**
 * CDN Integration Utility
 * Handles CDN integration for static assets
 */

const path = require('path');
const fs = require('fs').promises;

class CDNIntegration {
  constructor(config = {}) {
    this.cdnUrl = config.cdnUrl || process.env.CDN_URL || '';
    this.enabled = config.enabled !== false && !!this.cdnUrl;
    this.assetPrefix = config.assetPrefix || '/assets';
    this.cacheControl = config.cacheControl || 'public, max-age=31536000';
  }

  /**
   * Get CDN URL for asset
   */
  getAssetUrl(assetPath) {
    if (!this.enabled) {
      return assetPath;
    }

    // Remove leading slash if present
    const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
    
    return `${this.cdnUrl}/${cleanPath}`;
  }

  /**
   * Get versioned asset URL
   */
  getVersionedUrl(assetPath, version) {
    const url = this.getAssetUrl(assetPath);
    return `${url}?v=${version}`;
  }

  /**
   * Generate asset manifest
   */
  async generateManifest(assetsDir) {
    const manifest = {};

    try {
      const files = await this.getFilesRecursively(assetsDir);

      for (const file of files) {
        const relativePath = path.relative(assetsDir, file);
        const stats = await fs.stat(file);
        
        manifest[relativePath] = {
          url: this.getAssetUrl(relativePath),
          size: stats.size,
          modified: stats.mtime.toISOString(),
          hash: await this.getFileHash(file)
        };
      }

      return manifest;
    } catch (error) {
      console.error('Error generating asset manifest:', error);
      return {};
    }
  }

  /**
   * Get files recursively
   */
  async getFilesRecursively(dir) {
    const files = [];
    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        files.push(...await this.getFilesRecursively(fullPath));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Get file hash for cache busting
   */
  async getFileHash(filePath) {
    const crypto = require('crypto');
    const content = await fs.readFile(filePath);
    return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
  }

  /**
   * Middleware for serving assets with CDN headers
   */
  middleware() {
    return (req, res, next) => {
      // Set cache control headers for static assets
      if (this.isStaticAsset(req.path)) {
        res.setHeader('Cache-Control', this.cacheControl);
        
        // Add CDN headers
        if (this.enabled) {
          res.setHeader('X-CDN-Enabled', 'true');
          res.setHeader('X-CDN-URL', this.cdnUrl);
        }
      }

      next();
    };
  }

  /**
   * Check if path is a static asset
   */
  isStaticAsset(path) {
    const staticExtensions = [
      '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
      '.woff', '.woff2', '.ttf', '.eot', '.ico', '.webp'
    ];

    return staticExtensions.some(ext => path.endsWith(ext));
  }

  /**
   * Purge CDN cache (placeholder for CDN-specific implementation)
   */
  async purgeCache(paths = []) {
    if (!this.enabled) {
      return { success: false, message: 'CDN not enabled' };
    }

    // This would integrate with specific CDN provider APIs
    // (CloudFlare, AWS CloudFront, Fastly, etc.)
    console.log('Purging CDN cache for paths:', paths);

    return {
      success: true,
      message: 'Cache purge initiated',
      paths
    };
  }

  /**
   * Get CDN statistics (placeholder)
   */
  async getStats() {
    if (!this.enabled) {
      return { enabled: false };
    }

    return {
      enabled: true,
      cdnUrl: this.cdnUrl,
      cacheControl: this.cacheControl,
      // Additional stats would come from CDN provider API
    };
  }

  /**
   * Preload critical assets
   */
  getPreloadHeaders(assets = []) {
    return assets.map(asset => {
      const url = this.getAssetUrl(asset.path);
      const type = this.getAssetType(asset.path);
      return `<${url}>; rel=preload; as=${type}`;
    }).join(', ');
  }

  /**
   * Get asset type for preload
   */
  getAssetType(path) {
    if (path.endsWith('.js')) return 'script';
    if (path.endsWith('.css')) return 'style';
    if (path.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    if (path.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    return 'fetch';
  }

  /**
   * Generate service worker cache list
   */
  async generateCacheList(assetsDir) {
    const manifest = await this.generateManifest(assetsDir);
    return Object.values(manifest).map(asset => asset.url);
  }
}

module.exports = CDNIntegration;
