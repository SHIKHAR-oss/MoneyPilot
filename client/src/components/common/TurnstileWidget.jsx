import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';

const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export default function TurnstileWidget({ onVerify, onError, onExpire, resetTrigger }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [scriptReady, setScriptReady] = useState(Boolean(typeof window !== 'undefined' && window.turnstile));
  const [loadError, setLoadError] = useState(null);

  // Preserve callback references across re-renders to prevent widget teardown on user typing
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onErrorRef.current = onError;
    onExpireRef.current = onExpire;
  });

  // 1. Resolve sitekey: strictly from import.meta.env.VITE_TURNSTILE_SITE_KEY in production
  const rawKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const isProduction = import.meta.env.PROD || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');
  
  // In production, NEVER use any hardcoded test key. In local dev only, fallback to Cloudflare test key if unconfigured.
  const siteKey = (rawKey && typeof rawKey === 'string' && rawKey.trim())
    ? rawKey.trim()
    : (!isProduction ? '1x00000000000000000000AA' : '');

  // 2. Ensure Turnstile script is loaded in document head
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.turnstile) {
      setScriptReady(true);
      return;
    }

    // Check if script tag already exists in the document
    const existingScript = document.querySelector(`script[src*="turnstile/v0/api.js"]`);
    if (existingScript) {
      const pollInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(pollInterval);
          setScriptReady(true);
        }
      }, 50);

      existingScript.addEventListener('load', () => {
        clearInterval(pollInterval);
        setScriptReady(true);
      });

      return () => clearInterval(pollInterval);
    }

    // Create and inject script dynamically if missing from index.html
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const pollInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(pollInterval);
          setScriptReady(true);
        }
      }, 50);
    };
    script.onerror = () => {
      console.error('[TurnstileWidget] Failed to load Cloudflare Turnstile script.');
      setLoadError('Failed to load bot protection script. Please check your connection.');
      onErrorRef.current?.();
    };
    document.head.appendChild(script);
  }, []);

  // 3. Render Turnstile widget via turnstile.ready() when script & container are mounted
  useEffect(() => {
    if (!scriptReady || !containerRef.current || !window.turnstile || !siteKey) return;

    let isMounted = true;

    window.turnstile.ready(() => {
      if (!isMounted || !containerRef.current) return;

      // Remove any prior widget in the container
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // ignore stale instance
        }
        widgetIdRef.current = null;
      }

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light',
          size: 'normal',
          callback: (token) => {
            if (isMounted) onVerifyRef.current?.(token);
          },
          'error-callback': (code) => {
            console.warn('[TurnstileWidget] Challenge error code:', code);
            if (isMounted) onErrorRef.current?.(code);
          },
          'expired-callback': () => {
            if (isMounted) onExpireRef.current?.();
          }
        });
      } catch (err) {
        console.error('[TurnstileWidget] Render error:', err);
      }
    });

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [scriptReady, siteKey]);

  // 4. Handle widget reset triggered by parent (e.g. on failed login attempt)
  useEffect(() => {
    if (resetTrigger && widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch (err) {
        console.warn('[TurnstileWidget] Reset error:', err);
      }
    }
  }, [resetTrigger]);

  // 5. Diagnostics if environment variable is missing in production (do NOT silently fail)
  if (!siteKey) {
    return (
      <div className="p-3 my-2 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#991B1B]">
          <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
          <span>Security Verification Not Configured</span>
        </div>
        <p className="text-[11px] text-[#7F1D1D] leading-tight">
          Missing <code className="bg-[#FEE2E2] px-1 py-0.5 rounded font-mono text-[10px]">VITE_TURNSTILE_SITE_KEY</code> in production build environment.
        </p>
      </div>
    );
  }

  // 6. Error state if script network request failed
  if (loadError) {
    return (
      <div className="p-3 my-2 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#991B1B]">
          <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
          <span>Security Check Error</span>
        </div>
        <p className="text-[11px] text-[#7F1D1D]">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center my-2 space-y-1">
      <div ref={containerRef} className="min-h-[65px] flex items-center justify-center">
        {!scriptReady && (
          <div className="flex items-center gap-2 text-xs text-[#859188] py-4">
            <Loader2 className="w-4 h-4 animate-spin text-[#087F5B]" />
            <span>Loading security check...</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-[#859188]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#087F5B]" />
        <span>Protected by Cloudflare Turnstile</span>
      </div>
    </div>
  );
}
