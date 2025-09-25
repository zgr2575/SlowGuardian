#!/usr/bin/env node
/**
 * Enhanced Service Worker Test Suite
 * Tests SW endpoints, proxy functionality, and system health
 */

import fetch from 'node-fetch';

const base = process.env.TEST_BASE || 'http://localhost:8787';

console.log(`🧪 Testing SlowGuardian service worker at ${base}`);

// Test endpoint helper with better error handling
async function testEndpoint(path, description, options = {}) {
  try {
    console.log(`\n🔍 Testing ${description}: ${path}`);
    const startTime = Date.now();
    
    const response = await fetch(`${base}${path}`, {
      timeout: options.timeout || 10000,
      ...options.fetchOptions
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const contentType = response.headers.get('content-type') || 'unknown';
    let text = '';
    
    try {
      text = await response.text();
    } catch (e) {
      text = `<failed to read body: ${e.message}>`;
    }
    
    console.log(`✅ Status: ${response.status} (${duration}ms)`);
    console.log(`📄 Content-Type: ${contentType}`);
    
    if (text.length > 0) {
      const preview = text.length > 300 ? text.slice(0, 300) + '...' : text;
      console.log(`📝 Response preview: ${preview}`);
      
      // For JSON responses, try to parse and display nicely
      if (contentType.includes('application/json')) {
        try {
          const json = JSON.parse(text);
          console.log(`🔍 JSON structure:`, Object.keys(json));
        } catch (e) {
          console.log(`⚠️ Invalid JSON response`);
        }
      }
    }
    
    return { success: true, status: response.status, text, duration, contentType };
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test that checks if service worker probe endpoints work
async function testServiceWorkerProbes() {
  console.log('\n🔧 Testing Service Worker Probe Endpoints');
  console.log('==========================================');
  
  const probeTests = [
    ['/__sw-probe', 'Service Worker Probe (no params)'],
    ['/__sw-probe?path=/a/https://example.com/', 'SW Probe with UV path'],
    ['/__sw-probe?path=/dy/https://example.com/', 'SW Probe with Dynamic path'],
    ['/__sw-probe?path=/scramjet/https://example.com/', 'SW Probe with Scramjet path'],
    ['/__sw-logs', 'Service Worker Logs'],
    ['/__sw-debug', 'Service Worker Debug Info'],
    ['/__sw-active', 'Active Requests Monitor']
  ];
  
  const results = [];
  
  for (const [path, description] of probeTests) {
    const result = await testEndpoint(path, description, { timeout: 5000 });
    results.push({ path, description, ...result });
  }
  
  return results;
}

// Test basic proxy paths (these should work even if SW isn't active)
async function testProxyPaths() {
  console.log('\n🌐 Testing Proxy Path Availability');
  console.log('==================================');
  
  const proxyTests = [
    ['/a/bundle.js', 'Ultraviolet Bundle'],
    ['/a/config.js', 'Ultraviolet Config'],
    ['/dy/config.js', 'Dynamic Config'],
    ['/dy/worker.js', 'Dynamic Worker'],
    ['/o/', 'Bare Server Endpoint']
  ];
  
  const results = [];
  
  for (const [path, description] of proxyTests) {
    const result = await testEndpoint(path, description, { timeout: 5000 });
    results.push({ path, description, ...result });
  }
  
  return results;
}

// Test core application functionality
async function testCoreEndpoints() {
  console.log('\n📱 Testing Core Application Endpoints');
  console.log('=====================================');
  
  const coreTests = [
    ['/', 'Homepage'],
    ['/test.html', 'Service Worker Test Page'],
    ['/sw.js', 'Service Worker Script'],
    ['/version.json', 'Version Information'],
    ['/apps.html', 'Apps Page'],
    ['/settings.html', 'Settings Page']
  ];
  
  const results = [];
  
  for (const [path, description] of coreTests) {
    const result = await testEndpoint(path, description);
    results.push({ path, description, ...result });
  }
  
  return results;
}

// Main test runner
async function runTests() {
  const startTime = Date.now();
  
  console.log('🚀 Starting SlowGuardian Test Suite');
  console.log('====================================');
  
  const testSuites = [
    ['Core Endpoints', testCoreEndpoints],
    ['Proxy Paths', testProxyPaths],
    ['Service Worker Probes', testServiceWorkerProbes]
  ];
  
  let totalPassed = 0;
  let totalFailed = 0;
  let allResults = [];
  
  for (const [suiteName, testFunc] of testSuites) {
    console.log(`\n📋 Running ${suiteName} test suite...`);
    const results = await testFunc();
    allResults = allResults.concat(results);
    
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    totalPassed += passed;
    totalFailed += failed;
    
    console.log(`\n📊 ${suiteName} Results: ${passed} passed, ${failed} failed`);
  }
  
  const endTime = Date.now();
  const totalDuration = endTime - startTime;
  
  console.log('\n🎯 Final Test Summary');
  console.log('=====================');
  console.log(`⏱️  Total time: ${totalDuration}ms`);
  console.log(`✅ Total passed: ${totalPassed}`);
  console.log(`❌ Total failed: ${totalFailed}`);
  
  // Show failed tests details
  const failedTests = allResults.filter(r => !r.success);
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Tests:');
    for (const test of failedTests) {
      console.log(`   • ${test.description} (${test.path}): ${test.error}`);
    }
  }
  
  // System health assessment
  console.log('\n🏥 System Health Assessment');
  console.log('===========================');
  
  const criticalTests = allResults.filter(r => 
    r.path === '/' || r.path === '/sw.js' || r.path === '/test.html'
  );
  const criticalPassed = criticalTests.filter(r => r.success).length;
  
  if (criticalPassed === criticalTests.length) {
    console.log('✅ Core system: HEALTHY');
  } else {
    console.log('❌ Core system: DEGRADED');
  }
  
  const proxyTests = allResults.filter(r => r.path.startsWith('/a/') || r.path.startsWith('/dy/'));
  const proxyPassed = proxyTests.filter(r => r.success).length;
  
  if (proxyPassed > 0) {
    console.log(`✅ Proxy system: ${proxyPassed}/${proxyTests.length} endpoints available`);
  } else {
    console.log('⚠️  Proxy system: No endpoints responding');
  }
  
  const swTests = allResults.filter(r => r.path.startsWith('/__sw-'));
  const swPassed = swTests.filter(r => r.success && r.status === 200).length;
  
  if (swPassed > 0) {
    console.log(`✅ Service Worker: ${swPassed}/${swTests.length} debug endpoints active`);
  } else {
    console.log('⚠️  Service Worker: Debug endpoints not accessible (may need browser context)');
  }
  
  if (totalFailed > 0) {
    console.log('\n🚨 Some tests failed. Check logs above for details.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed! System is healthy.');
    process.exit(0);
  }
}

runTests().catch(error => {
  console.error('\n💥 Test suite crashed:', error);
  console.error(error.stack);
  process.exit(1);
});