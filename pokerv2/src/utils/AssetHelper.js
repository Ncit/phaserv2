// Asset Helper - Utility for efficient asset loading and management
import { AssetConfig } from '../config/AssetConfig.js';

export class AssetHelper {
    constructor(scene) {
        this.scene = scene;
        this.isDebug = window.isDebug || false;
        this.loadedAssets = new Set();
        this.failedAssets = new Set();
    }

    // Load a single asset by config path (e.g., 'buttons.call')
    loadAsset(configPath) {
        const asset = AssetConfig.helpers.getAsset(configPath);
        if (!asset) {
            console.warn(`AssetHelper: Asset not found at path '${configPath}'`);
            return false;
        }

        return this.loadAssetDirect(asset.key, asset.path);
    }

    // Load asset directly with key and path
    loadAssetDirect(key, path) {
        try {
            this.scene.load.image(key, path);
            this.loadedAssets.add(key);
            
            if (this.isDebug) {
                console.log(`AssetHelper: Loaded asset '${key}' from '${path}'`);
            }
            return true;
        } catch (error) {
            console.error(`AssetHelper: Failed to load asset '${key}':`, error);
            this.failedAssets.add(key);
            return false;
        }
    }

    // Load an entire asset group
    loadAssetGroup(groupName) {
        const assets = AssetConfig.helpers.getLoadingGroup(groupName);
        if (!assets.length) {
            console.warn(`AssetHelper: No assets found in group '${groupName}'`);
            return 0;
        }

        let loadedCount = 0;
        assets.forEach(asset => {
            if (this.loadAssetDirect(asset.key, asset.path)) {
                loadedCount++;
            }
        });

        if (this.isDebug) {
            console.log(`AssetHelper: Loaded ${loadedCount}/${assets.length} assets from group '${groupName}'`);
        }

        return loadedCount;
    }

    // Load all playing cards dynamically
    loadAllCards() {
        let loadedCount = 0;
        const { suits, values } = AssetConfig.cards;

        suits.forEach(suit => {
            values.forEach(value => {
                const key = AssetConfig.cards.getCardKey(value, suit);
                const path = AssetConfig.cards.getCardPath(value, suit);
                
                if (this.loadAssetDirect(key, path)) {
                    loadedCount++;
                }
            });
        });

        if (this.isDebug) {
            console.log(`AssetHelper: Loaded ${loadedCount} playing cards`);
        }

        return loadedCount;
    }

    // Load dynamic assets (like user photos)
    loadDynamicAssets() {
        const { userPhoto } = AssetConfig.dynamic;
        
        try {
            // Load user photo from window.appData
            this.scene.load.image(userPhoto.key, eval(userPhoto.source));
            this.loadedAssets.add(userPhoto.key);
            
            if (this.isDebug) {
                console.log(`AssetHelper: Loaded dynamic asset '${userPhoto.key}'`);
            }
            return true;
        } catch (error) {
            console.error('AssetHelper: Failed to load dynamic assets:', error);
            this.failedAssets.add(userPhoto.key);
            return false;
        }
    }

    // Check if an asset is loaded
    isAssetLoaded(key) {
        return this.scene.textures.exists(key);
    }

    // Get asset loading statistics
    getLoadingStats() {
        return {
            loaded: this.loadedAssets.size,
            failed: this.failedAssets.size,
            loadedAssets: Array.from(this.loadedAssets),
            failedAssets: Array.from(this.failedAssets),
        };
    }

    // Validate that all required assets are loaded
    validateAssets(requiredAssets = []) {
        const missing = requiredAssets.filter(key => !this.isAssetLoaded(key));
        
        if (missing.length > 0) {
            console.warn('AssetHelper: Missing required assets:', missing);
            return false;
        }
        
        if (this.isDebug) {
            console.log('AssetHelper: All required assets validated successfully');
        }
        return true;
    }

    // Preload assets with progress callback
    preloadAssets(assetList, onProgress = null, onComplete = null) {
        let loadedCount = 0;
        const totalCount = assetList.length;

        const checkProgress = () => {
            loadedCount++;
            
            if (onProgress) {
                onProgress(loadedCount, totalCount, loadedCount / totalCount);
            }
            
            if (loadedCount === totalCount && onComplete) {
                onComplete();
            }
        };

        // Set up load event listeners
        this.scene.load.on('filecomplete', checkProgress);
        
        // Load all assets
        assetList.forEach(asset => {
            if (typeof asset === 'string') {
                this.loadAsset(asset);
            } else {
                this.loadAssetDirect(asset.key, asset.path);
            }
        });

        // Start loading
        this.scene.load.start();
    }

    // Clean up resources
    cleanup() {
        this.loadedAssets.clear();
        this.failedAssets.clear();
        
        if (this.isDebug) {
            console.log('AssetHelper: Cleaned up resources');
        }
    }
} 