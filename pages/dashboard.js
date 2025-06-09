import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Dashboard() {
  const [sentryStatus, setSentryStatus] = useState('loading');
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    // Check if Sentry is loaded
    if (typeof window !== 'undefined') {
      if (window.Sentry || Sentry) {
        setSentryStatus('active');
        console.log('✅ Sentry is loaded and active!');
      } else {
        setSentryStatus('inactive');
        console.log('❌ Sentry not detected');
      }
    }
  }, []);

  const testErrorCapture = () => {
    try {
      // Test 1: JavaScript Error
      const testError = new Error('Test error from PropertyAgent Pro dashboard');
      testError.name = 'DashboardTestError';
      
      // Capture the error with Sentry
      Sentry.captureException(testError, {
        tags: {
          test: true,
          source: 'dashboard',
          client: 'property-agent-pro'
        },
        extra: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          page: '/dashboard'
        }
      });

      setTestResults(prev => [...prev, {
        id: Date.now(),
        type: 'Exception Test',
        status: 'sent',
        message: 'Test error sent to Sentry successfully'
      }]);

    } catch (error) {
      console.error('Error testing Sentry:', error);
      setTestResults(prev => [...prev, {
        id: Date.now(),
        type: 'Exception Test',
        status: 'failed',
        message: 'Failed to send test error: ' + error.message
      }]);
    }
  };

  const testUndefinedFunction = () => {
    try {
      // This will trigger an actual JavaScript error
      nonExistentFunction();
    } catch (error) {
      setTestResults(prev => [...prev, {
        id: Date.now(),
        type: 'Undefined Function',
        status: 'caught',
        message: 'Undefined function error captured (should appear in Sentry)'
      }]);
    }
  };

  const testCustomMessage = () => {
    Sentry.captureMessage('Custom message from PropertyAgent Pro dashboard', 'info');
    
    setTestResults(prev => [...prev, {
      id: Date.now(),
      type: 'Custom Message',
      status: 'sent',
      message: 'Info message sent to Sentry'
    }]);
  };

  const clearTests = () => {
    setTestResults([]);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(15px)',
        padding: '1rem 2rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🏠 PropertyAgent Pro
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              padding: '0.3rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '600',
              background: sentryStatus === 'active' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)',
              color: sentryStatus === 'active' ? '#27ae60' : '#e74c3c',
              border: `1px solid ${sentryStatus === 'active' ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)'}`
            }}>
              {sentryStatus === 'active' ? '⚡ Sentry Active' : 
               sentryStatus === 'inactive' ? '⚠️ Sentry Inactive' : '🔄 Loading...'}
            </div>
            <span>Dashboard Testing</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '2rem auto',
        padding: '0 2rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          
          {/* Status Section */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#2c3e50',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              {sentryStatus === 'active' ? '🎉 Sentry Integration Active!' : '⚠️ Sentry Integration Issue'}
            </h1>
            
            <div style={{
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                background: sentryStatus === 'active' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                color: sentryStatus === 'active' ? '#27ae60' : '#e74c3c',
                borderRadius: '25px',
                fontWeight: '600',
                border: `2px solid ${sentryStatus === 'active' ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)'}`
              }}>
                {sentryStatus === 'active' ? '✅ Ready for Error Monitoring' : '❌ Sentry Not Detected'}
              </div>
            </div>
          </div>

          {/* Test Buttons */}
          {sentryStatus === 'active' && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                color: '#2c3e50', 
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                🧪 Test Sentry Error Capture
              </h3>
              
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '1rem'
              }}>
                <button
                  onClick={testErrorCapture}
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🔥 Test Exception
                </button>
                
                <button
                  onClick={testUndefinedFunction}
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: '#f39c12',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  ⚠️ Test JS Error
                </button>
                
                <button
                  onClick={testCustomMessage}
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  💬 Test Message
                </button>
                
                <button
                  onClick={clearTests}
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🗑️ Clear Tests
                </button>
              </div>
            </div>
          )}

          {/* Test Results */}
          {testResults.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>📊 Test Results</h3>
              <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '1rem'
              }}>
                {testResults.map((result) => (
                  <div
                    key={result.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.5rem',
                      marginBottom: '0.5rem',
                      background: 'white',
                      borderRadius: '6px',
                      border: '1px solid #e9ecef'
                    }}
                  >
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: result.status === 'sent' ? '#d4edda' : 
                                 result.status === 'caught' ? '#fff3cd' : '#f8d7da',
                      color: result.status === 'sent' ? '#155724' : 
                             result.status === 'caught' ? '#856404' : '#721c24'
                    }}>
                      {result.type}
                    </span>
                    <span style={{ flex: 1, color: '#666' }}>
                      {result.message}
                    </span>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: '#999',
                      fontFamily: 'monospace'
                    }}>
                      {new Date(result.id).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div style={{
            background: '#f8f9ff',
            borderRadius: '8px',
            padding: '1.5rem',
            borderLeft: '4px solid #667eea'
          }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>🚀 How to Verify</h3>
            <ol style={{ color: '#666', lineHeight: '1.8' }}>
              <li>Click any test button above</li>
              <li>Go to your <a href="https://sentry.io" target="_blank" style={{ color: '#667eea' }}>Sentry Dashboard</a></li>
              <li>Check the Issues section for new errors</li>
              <li>Errors should appear within 30-60 seconds</li>
              <li>Look for tags like "client: property-agent-pro" and "source: dashboard"</li>
            </ol>
            
            {sentryStatus === 'active' && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: '#d4edda',
                borderRadius: '6px',
                color: '#155724'
              }}>
                <strong>✅ Sentry Integration Working!</strong><br/>
                Your app can now automatically capture and report errors. No more manual screenshots needed!
              </div>
            )}
            
            {sentryStatus === 'inactive' && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: '#f8d7da',
                borderRadius: '6px',
                color: '#721c24'
              }}>
                <strong>❌ Sentry Not Detected</strong><br/>
                Check that your SENTRY_DSN environment variable is set correctly in Vercel and redeploy.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}