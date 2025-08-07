/**
 * Network Diagnostics Utility
 * Helps troubleshoot WebSocket connection issues
 */
export class NetworkDiagnostics {
    constructor() {
        this.diagnostics = {
            serverStatus: null,
            networkInfo: null,
            connectionTests: [],
            errors: []
        };
    }

    /**
     * Run comprehensive network diagnostics
     */
    async runDiagnostics() {
        console.log('🔍 Starting network diagnostics...');
        
        this.diagnostics = {
            serverStatus: null,
            networkInfo: null,
            connectionTests: [],
            errors: [],
            timestamp: new Date().toISOString()
        };

        try {
            // Test 1: Basic connectivity
            await this.testBasicConnectivity();
            
            // Test 2: Server status
            await this.testServerStatus();
            
            // Test 3: WebSocket endpoint
            await this.testWebSocketEndpoint();
            
            // Test 4: DNS resolution
            await this.testDNSResolution();
            
            // Test 5: Network information
            await this.getNetworkInfo();
            
            // Test 6: Browser capabilities
            await this.testBrowserCapabilities();
            
            console.log('🔍 Network diagnostics completed');
            this.printDiagnosticReport();
            
        } catch (error) {
            console.error('🔍 Diagnostic error:', error);
            this.diagnostics.errors.push({
                test: 'general',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }

        return this.diagnostics;
    }

    /**
     * Test basic internet connectivity
     */
    async testBasicConnectivity() {
        const test = {
            name: 'Basic Connectivity',
            status: 'pending',
            details: {}
        };

        try {
            // Test 1: Google DNS
            const dnsStart = performance.now();
            const dnsResponse = await fetch('https://8.8.8.8/resolve?name=google.com', {
                method: 'GET',
                mode: 'no-cors'
            }).catch(() => null);
            const dnsTime = performance.now() - dnsStart;
            
            // Test 2: Google.com
            const googleStart = performance.now();
            const googleResponse = await fetch('https://www.google.com', {
                method: 'HEAD',
                mode: 'no-cors'
            }).catch(() => null);
            const googleTime = performance.now() - googleStart;

            test.status = 'success';
            test.details = {
                dnsResponse: dnsResponse ? 'success' : 'failed',
                dnsTime: dnsTime.toFixed(2) + 'ms',
                googleResponse: googleResponse ? 'success' : 'failed',
                googleTime: googleTime.toFixed(2) + 'ms'
            };

        } catch (error) {
            test.status = 'failed';
            test.error = error.message;
        }

        this.diagnostics.connectionTests.push(test);
    }

    /**
     * Test server status
     */
    async testServerStatus() {
        const test = {
            name: 'Server Status',
            status: 'pending',
            details: {}
        };

        try {
            const serverUrl = 'https://nikmobdev.ru';
            
            // Test HTTP status
            const start = performance.now();
            const response = await fetch(serverUrl, {
                method: 'HEAD',
                mode: 'cors'
            });
            const time = performance.now() - start;

            test.status = 'success';
            test.details = {
                status: response.status,
                statusText: response.statusText,
                responseTime: time.toFixed(2) + 'ms',
                headers: {
                    'content-type': response.headers.get('content-type'),
                    'server': response.headers.get('server'),
                    'access-control-allow-origin': response.headers.get('access-control-allow-origin')
                }
            };

            this.diagnostics.serverStatus = {
                url: serverUrl,
                status: response.status,
                responseTime: time,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            test.status = 'failed';
            test.error = error.message;
            this.diagnostics.errors.push({
                test: 'server_status',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }

        this.diagnostics.connectionTests.push(test);
    }

    /**
     * Test WebSocket endpoint
     */
    async testWebSocketEndpoint() {
        const test = {
            name: 'WebSocket Endpoint',
            status: 'pending',
            details: {}
        };

        try {
            const wsUrl = 'wss://nikmobdev.ru/pokerserver/socket.io/';
            
            return new Promise((resolve) => {
                const ws = new WebSocket(wsUrl);
                const start = performance.now();
                
                ws.onopen = () => {
                    const time = performance.now() - start;
                    test.status = 'success';
                    test.details = {
                        connectionTime: time.toFixed(2) + 'ms',
                        protocol: ws.protocol,
                        readyState: ws.readyState
                    };
                    ws.close();
                    this.diagnostics.connectionTests.push(test);
                    resolve();
                };
                
                ws.onerror = (error) => {
                    const time = performance.now() - start;
                    test.status = 'failed';
                    test.error = 'WebSocket connection failed';
                    test.details = {
                        connectionTime: time.toFixed(2) + 'ms',
                        error: error
                    };
                    this.diagnostics.connectionTests.push(test);
                    resolve();
                };
                
                // Timeout after 10 seconds
                setTimeout(() => {
                    if (test.status === 'pending') {
                        test.status = 'timeout';
                        test.error = 'Connection timeout';
                        this.diagnostics.connectionTests.push(test);
                        resolve();
                    }
                }, 10000);
            });

        } catch (error) {
            test.status = 'failed';
            test.error = error.message;
            this.diagnostics.connectionTests.push(test);
        }
    }

    /**
     * Test DNS resolution
     */
    async testDNSResolution() {
        const test = {
            name: 'DNS Resolution',
            status: 'pending',
            details: {}
        };

        try {
            const hostname = 'nikmobdev.ru';
            
            // Try to resolve the hostname
            const start = performance.now();
            const response = await fetch(`https://${hostname}`, {
                method: 'HEAD',
                mode: 'no-cors'
            }).catch(() => null);
            const time = performance.now() - start;

            test.status = response ? 'success' : 'failed';
            test.details = {
                hostname: hostname,
                resolutionTime: time.toFixed(2) + 'ms',
                resolved: response !== null
            };

        } catch (error) {
            test.status = 'failed';
            test.error = error.message;
        }

        this.diagnostics.connectionTests.push(test);
    }

    /**
     * Get network information
     */
    async getNetworkInfo() {
        const test = {
            name: 'Network Information',
            status: 'success',
            details: {}
        };

        try {
            // Basic network info
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            
            test.details = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
                connection: connection ? {
                    effectiveType: connection.effectiveType,
                    downlink: connection.downlink,
                    rtt: connection.rtt,
                    saveData: connection.saveData
                } : 'Not available',
                screen: {
                    width: screen.width,
                    height: screen.height,
                    colorDepth: screen.colorDepth
                },
                window: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            };

            this.diagnostics.networkInfo = test.details;

        } catch (error) {
            test.status = 'failed';
            test.error = error.message;
        }

        this.diagnostics.connectionTests.push(test);
    }

    /**
     * Test browser capabilities
     */
    async testBrowserCapabilities() {
        const test = {
            name: 'Browser Capabilities',
            status: 'success',
            details: {}
        };

        try {
            test.details = {
                webSocket: typeof WebSocket !== 'undefined',
                fetch: typeof fetch !== 'undefined',
                localStorage: typeof localStorage !== 'undefined',
                sessionStorage: typeof sessionStorage !== 'undefined',
                indexedDB: typeof indexedDB !== 'undefined',
                serviceWorker: 'serviceWorker' in navigator,
                pushManager: 'PushManager' in window,
                webGL: this.testWebGL(),
                webRTC: this.testWebRTC(),
                cors: this.testCORS(),
                https: window.location.protocol === 'https:'
            };

        } catch (error) {
            test.status = 'failed';
            test.error = error.message;
        }

        this.diagnostics.connectionTests.push(test);
    }

    /**
     * Test WebGL support
     */
    testWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                     (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    /**
     * Test WebRTC support
     */
    testWebRTC() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    /**
     * Test CORS support
     */
    testCORS() {
        return 'withCredentials' in new XMLHttpRequest();
    }

    /**
     * Print diagnostic report
     */
    printDiagnosticReport() {
        console.group('🔍 Network Diagnostic Report');
        console.log('Timestamp:', this.diagnostics.timestamp);
        
        console.group('📊 Connection Tests');
        this.diagnostics.connectionTests.forEach(test => {
            const status = test.status === 'success' ? '✅' : 
                          test.status === 'failed' ? '❌' : 
                          test.status === 'timeout' ? '⏰' : '⏳';
            console.log(`${status} ${test.name}:`, test.details);
            if (test.error) {
                console.error('   Error:', test.error);
            }
        });
        console.groupEnd();
        
        if (this.diagnostics.errors.length > 0) {
            console.group('❌ Errors');
            this.diagnostics.errors.forEach(error => {
                console.error(`${error.test}:`, error.error);
            });
            console.groupEnd();
        }
        
        console.groupEnd();
    }

    /**
     * Get diagnostic summary
     */
    getSummary() {
        const totalTests = this.diagnostics.connectionTests.length;
        const successfulTests = this.diagnostics.connectionTests.filter(t => t.status === 'success').length;
        const failedTests = this.diagnostics.connectionTests.filter(t => t.status === 'failed').length;
        const timeoutTests = this.diagnostics.connectionTests.filter(t => t.status === 'timeout').length;

        return {
            total: totalTests,
            successful: successfulTests,
            failed: failedTests,
            timeout: timeoutTests,
            successRate: totalTests > 0 ? (successfulTests / totalTests * 100).toFixed(1) + '%' : '0%',
            hasErrors: this.diagnostics.errors.length > 0,
            serverStatus: this.diagnostics.serverStatus,
            networkInfo: this.diagnostics.networkInfo
        };
    }

    /**
     * Export diagnostics as JSON
     */
    exportDiagnostics() {
        const data = {
            ...this.diagnostics,
            summary: this.getSummary()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `network-diagnostics-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * Quick connection test
     */
    async quickTest() {
        console.log('🔍 Running quick connection test...');
        
        try {
            // Test server response
            const start = performance.now();
            const response = await fetch('https://nikmobdev.ru', {
                method: 'HEAD',
                mode: 'cors'
            });
            const time = performance.now() - start;

            const result = {
                serverReachable: response.ok,
                responseTime: time.toFixed(2) + 'ms',
                status: response.status,
                timestamp: new Date().toISOString()
            };

            console.log('🔍 Quick test result:', result);
            return result;

        } catch (error) {
            const result = {
                serverReachable: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
            
            console.error('🔍 Quick test failed:', result);
            return result;
        }
    }
}

// Create and export singleton instance
const networkDiagnostics = new NetworkDiagnostics();
export default networkDiagnostics; 