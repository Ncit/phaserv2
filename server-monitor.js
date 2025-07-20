#!/usr/bin/env node

/**
 * Server Performance Monitor
 * Monitors server resources during load testing
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

class ServerMonitor {
    constructor() {
        this.monitoring = false;
        this.interval = null;
        this.logFile = null;
        this.stats = {
            startTime: null,
            samples: [],
            maxConnections: 0,
            maxMemoryUsage: 0,
            maxCpuUsage: 0
        };
    }

    start(logFile = null) {
        this.monitoring = true;
        this.stats.startTime = Date.now();
        this.logFile = logFile || `server-monitor-${Date.now()}.log`;
        
        console.log(`🔍 Starting server monitoring...`);
        console.log(`📊 Log file: ${this.logFile}`);
        
        // Write header to log file
        const header = `Timestamp,CPU_Usage(%),Memory_Usage(MB),Memory_Total(MB),Load_Avg,Network_Connections,Free_Memory(MB)\n`;
        fs.writeFileSync(this.logFile, header);
        
        this.interval = setInterval(() => {
            this.collectSample();
        }, 1000); // Collect sample every second
    }

    stop() {
        if (this.monitoring) {
            this.monitoring = false;
            clearInterval(this.interval);
            
            const duration = Date.now() - this.stats.startTime;
            this.printSummary(duration);
            
            console.log(`📊 Monitoring stopped. Results saved to: ${this.logFile}`);
        }
    }

    collectSample() {
        const sample = {
            timestamp: Date.now(),
            cpuUsage: this.getCpuUsage(),
            memoryUsage: this.getMemoryUsage(),
            loadAverage: this.getLoadAverage(),
            networkConnections: this.getNetworkConnections(),
            freeMemory: this.getFreeMemory()
        };

        this.stats.samples.push(sample);
        
        // Update max values
        this.stats.maxCpuUsage = Math.max(this.stats.maxCpuUsage, sample.cpuUsage);
        this.stats.maxMemoryUsage = Math.max(this.stats.maxMemoryUsage, sample.memoryUsage.mb);
        this.stats.maxConnections = Math.max(this.stats.maxConnections, sample.networkConnections);

        // Log to file
        const logLine = `${sample.timestamp},${sample.cpuUsage.toFixed(2)},${sample.memoryUsage.mb.toFixed(2)},${sample.memoryUsage.total.toFixed(2)},${sample.loadAverage.toFixed(2)},${sample.networkConnections},${sample.freeMemory.toFixed(2)}\n`;
        fs.appendFileSync(this.logFile, logLine);

        // Print current status every 10 seconds
        if (this.stats.samples.length % 10 === 0) {
            this.printCurrentStatus(sample);
        }
    }

    getCpuUsage() {
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;

        cpus.forEach(cpu => {
            for (const type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });

        return 100 - (totalIdle / totalTick * 100);
    }

    getMemoryUsage() {
        const total = os.totalmem();
        const free = os.freemem();
        const used = total - free;
        
        return {
            total: total / 1024 / 1024, // MB
            used: used / 1024 / 1024,   // MB
            free: free / 1024 / 1024,   // MB
            mb: used / 1024 / 1024      // MB
        };
    }

    getLoadAverage() {
        const loadAvg = os.loadavg();
        return loadAvg[0]; // 1-minute load average
    }

    getNetworkConnections() {
        try {
            // This is a simplified approach - in production you might want to use netstat
            const connections = fs.readFileSync('/proc/net/sockstat', 'utf8');
            const match = connections.match(/TCP:\s+(\d+)/);
            return match ? parseInt(match[1]) : 0;
        } catch (error) {
            // Fallback for non-Linux systems
            return 0;
        }
    }

    getFreeMemory() {
        return os.freemem() / 1024 / 1024; // MB
    }

    printCurrentStatus(sample) {
        const memory = sample.memoryUsage;
        console.log(`📊 [${new Date(sample.timestamp).toLocaleTimeString()}] CPU: ${sample.cpuUsage.toFixed(1)}% | Memory: ${memory.mb.toFixed(0)}MB/${memory.total.toFixed(0)}MB | Load: ${sample.loadAverage.toFixed(2)} | Connections: ${sample.networkConnections}`);
    }

    printSummary(duration) {
        const samples = this.stats.samples;
        if (samples.length === 0) return;

        const avgCpu = samples.reduce((sum, s) => sum + s.cpuUsage, 0) / samples.length;
        const avgMemory = samples.reduce((sum, s) => sum + s.memoryUsage.mb, 0) / samples.length;
        const avgLoad = samples.reduce((sum, s) => sum + s.loadAverage, 0) / samples.length;

        console.log('\n' + '='.repeat(60));
        console.log('📊 SERVER MONITORING SUMMARY');
        console.log('='.repeat(60));
        
        console.log(`\n⏱️  Monitoring Duration: ${(duration / 1000).toFixed(1)}s`);
        console.log(`📈 Samples Collected: ${samples.length}`);
        
        console.log('\n🚀 PERFORMANCE METRICS:');
        console.log(`   Average CPU Usage: ${avgCpu.toFixed(2)}%`);
        console.log(`   Maximum CPU Usage: ${this.stats.maxCpuUsage.toFixed(2)}%`);
        console.log(`   Average Memory Usage: ${avgMemory.toFixed(2)}MB`);
        console.log(`   Maximum Memory Usage: ${this.stats.maxMemoryUsage.toFixed(2)}MB`);
        console.log(`   Average Load: ${avgLoad.toFixed(2)}`);
        console.log(`   Maximum Connections: ${this.stats.maxConnections}`);
        
        // Performance assessment
        this.assessPerformance(avgCpu, avgMemory, avgLoad);
    }

    assessPerformance(avgCpu, avgMemory, avgLoad) {
        console.log('\n📊 PERFORMANCE ASSESSMENT:');
        
        let cpuStatus = '🔴';
        let memoryStatus = '🔴';
        let loadStatus = '🔴';
        
        if (avgCpu < 50) cpuStatus = '🟢';
        else if (avgCpu < 80) cpuStatus = '🟡';
        
        if (avgMemory < 1024) memoryStatus = '🟢'; // Less than 1GB
        else if (avgMemory < 2048) memoryStatus = '🟡'; // Less than 2GB
        else memoryStatus = '🔴';
        
        if (avgLoad < 1) loadStatus = '🟢';
        else if (avgLoad < 5) loadStatus = '🟡';
        else loadStatus = '🔴';
        
        console.log(`   CPU Usage: ${cpuStatus} ${avgCpu.toFixed(1)}%`);
        console.log(`   Memory Usage: ${memoryStatus} ${avgMemory.toFixed(0)}MB`);
        console.log(`   System Load: ${loadStatus} ${avgLoad.toFixed(2)}`);
        
        console.log('\n💡 RECOMMENDATIONS:');
        
        if (avgCpu > 80) {
            console.log('   - CPU usage is high, consider scaling up or optimizing');
        }
        
        if (avgMemory > 2048) {
            console.log('   - Memory usage is high, check for memory leaks');
        }
        
        if (avgLoad > 5) {
            console.log('   - System load is high, consider load balancing');
        }
        
        if (avgCpu < 30 && avgMemory < 1024 && avgLoad < 1) {
            console.log('   - Server is performing well under current load');
        }
    }

    // Generate CSV report
    generateReport() {
        const reportFile = this.logFile.replace('.log', '-report.csv');
        const header = 'Timestamp,CPU_Usage(%),Memory_Usage(MB),Load_Avg,Network_Connections\n';
        
        let csv = header;
        this.stats.samples.forEach(sample => {
            csv += `${sample.timestamp},${sample.cpuUsage.toFixed(2)},${sample.memoryUsage.mb.toFixed(2)},${sample.loadAverage.toFixed(2)},${sample.networkConnections}\n`;
        });
        
        fs.writeFileSync(reportFile, csv);
        console.log(`📄 Report generated: ${reportFile}`);
    }
}

// CLI interface
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🔍 Server Performance Monitor');
console.log('=============================\n');

// Parse command line arguments
const args = process.argv.slice(2);
let logFile = null;

args.forEach(arg => {
    if (arg.startsWith('--log=')) {
        logFile = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
        console.log('\nUsage: node server-monitor.js [options]');
        console.log('\nOptions:');
        console.log('  --log=<file>         Log file path (default: auto-generated)');
        console.log('  --help, -h           Show this help message');
        console.log('\nExamples:');
        console.log('  node server-monitor.js');
        console.log('  node server-monitor.js --log=server-stats.log');
        process.exit(0);
    }
});

const monitor = new ServerMonitor();

console.log('Configuration:');
console.log(`  Log file: ${logFile || 'auto-generated'}`);
console.log(`  Sample interval: 1 second`);

rl.question('\nPress Enter to start monitoring (or Ctrl+C to cancel)...', () => {
    monitor.start(logFile);
    
    console.log('\nMonitoring started. Press Ctrl+C to stop...\n');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\n🛑 Stopping monitoring...');
        monitor.stop();
        monitor.generateReport();
        rl.close();
        process.exit(0);
    });
});

module.exports = { ServerMonitor }; 