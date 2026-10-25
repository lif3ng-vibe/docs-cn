var e={bolder:{id:`bolder`,caption:`怯懦的设计 → 大胆、自信的设计`,before:`
    <div style="text-align: center; padding: var(--spacing-md); max-width: 280px;">
      <div style="font-size: 1.125rem; font-weight: 500; margin-bottom: 8px; color: var(--color-charcoal);">Introducing Our Product</div>
      <div style="font-size: 0.875rem; color: var(--color-ash); margin-bottom: 16px;">A solution for modern teams</div>
      <button style="padding: 8px 16px; background: var(--color-mist); color: var(--color-charcoal); border: none; border-radius: 4px; font-size: 0.875rem;">Learn More</button>
    </div>
  `,after:`
    <div style="text-align: center; padding: var(--spacing-lg); max-width: 320px;">
      <div style="font-family: var(--font-display); font-size: 2.5rem; font-weight: 300; font-style: italic; margin-bottom: 12px; color: var(--color-ink); line-height: 1;">Introducing Our Product</div>
      <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--color-charcoal); margin-bottom: 24px;">A solution for modern teams</div>
      <button style="padding: 14px 32px; background: var(--color-ink); color: var(--color-paper); border: none; font-size: 0.9375rem; font-weight: 500; letter-spacing: 0.02em;">Learn More</button>
    </div>
  `},animate:{id:`animate`,caption:`Static layout → Choreographed entrance`,before:`
    <div style="width: 100%; max-width: 220px; display: flex; flex-direction: column; gap: 8px;">
      <div style="height: 32px; background: #e0e0e0; border-radius: 4px;"></div>
      <div style="height: 12px; background: #e0e0e0; border-radius: 2px; width: 60%;"></div>
      <div style="display: flex; gap: 8px; margin-top: 8px;">
        <div style="flex: 1; height: 64px; background: #e0e0e0; border-radius: 4px;"></div>
        <div style="flex: 1; height: 64px; background: #e0e0e0; border-radius: 4px;"></div>
      </div>
      <div style="height: 10px; background: #e0e0e0; border-radius: 2px; width: 80%; margin-top: 8px;"></div>
      <div style="height: 10px; background: #e0e0e0; border-radius: 2px; width: 65%;"></div>
    </div>
  `,after:`
    <div class="animate-demo-after" style="width: 100%; max-width: 220px; display: flex; flex-direction: column; gap: 8px;">
      <div style="height: 32px; background: var(--color-ink); border-radius: 4px; animation: animDemoFade 0.5s ease-out both;"></div>
      <div style="height: 12px; background: var(--color-ash); border-radius: 2px; width: 60%; animation: animDemoFade 0.5s ease-out 0.1s both;"></div>
      <div style="display: flex; gap: 8px; margin-top: 8px;">
        <div style="flex: 1; height: 64px; background: var(--color-mist); border-radius: 4px; animation: animDemoSlide 0.4s ease-out 0.2s both;"></div>
        <div style="flex: 1; height: 64px; background: var(--color-mist); border-radius: 4px; animation: animDemoSlide 0.4s ease-out 0.3s both;"></div>
      </div>
      <div style="height: 10px; background: var(--color-mist); border-radius: 2px; width: 80%; margin-top: 8px; animation: animDemoFade 0.4s ease-out 0.4s both;"></div>
      <div style="height: 10px; background: var(--color-mist); border-radius: 2px; width: 65%; animation: animDemoFade 0.4s ease-out 0.5s both;"></div>
    </div>
    <style>
      @keyframes animDemoFade {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes animDemoSlide {
        from { opacity: 0; transform: translateY(16px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @media (prefers-reduced-motion: reduce) {
        .animate-demo-after * { animation: none !important; }
      }
    </style>
  `},audit:{id:`audit`,caption:`Hidden issues → Identified problems with recommendations`,before:`
    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 260px;">
      <div style="padding: 12px; background: #f8f8f8; border-radius: 4px;">
        <div style="font-size: 12px; color: #aaa;">Welcome message</div>
        <button style="margin-top: 8px; padding: 4px 8px; font-size: 11px; background: #ddd; border: none; border-radius: 2px; color: #888;">click here</button>
      </div>
      <div style="padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
        <div style="font-size: 15px; color: rgba(255,255,255,0.7);">Featured Item</div>
      </div>
      <div style="display: flex; gap: 4px;">
        <button style="width: 20px; height: 20px; font-size: 10px; background: #eee; border: none;">←</button>
        <button style="width: 20px; height: 20px; font-size: 10px; background: #eee; border: none;">→</button>
      </div>
    </div>
  `,after:`
    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 280px;">
      <div style="padding: 12px; background: #fff8f8; border: 1px solid #ffcccc; border-radius: 4px; position: relative;">
        <div style="position: absolute; top: -8px; right: 8px; background: #ff4444; color: white; font-size: 9px; padding: 2px 6px; border-radius: 8px; font-weight: 600;">CONTRAST</div>
        <div style="font-size: 12px; color: #aaa;">Welcome message</div>
        <button style="margin-top: 8px; padding: 4px 8px; font-size: 11px; background: #ddd; border: none; border-radius: 2px; color: #888;">click here</button>
      </div>
      <div style="padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; border: 2px solid #ff9800; position: relative;">
        <div style="position: absolute; top: -8px; right: 8px; background: #ff9800; color: white; font-size: 9px; padding: 2px 6px; border-radius: 8px; font-weight: 600;">READABILITY</div>
        <div style="font-size: 15px; color: rgba(255,255,255,0.7);">Featured Item</div>
      </div>
      <div style="display: flex; gap: 4px; padding: 4px; background: #fff3e0; border: 1px solid #ffcc80; border-radius: 4px; position: relative;">
        <div style="position: absolute; top: -8px; right: 8px; background: #ff9800; color: white; font-size: 9px; padding: 2px 6px; border-radius: 8px; font-weight: 600;">TOUCH TARGET</div>
        <button style="width: 20px; height: 20px; font-size: 10px; background: #eee; border: none;">←</button>
        <button style="width: 20px; height: 20px; font-size: 10px; background: #eee; border: none;">→</button>
      </div>
    </div>
  `},critique:{id:`critique`,caption:`Confusing design → UX issues identified with fixes`,before:`
    <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 260px; padding: 12px; background: #fafafa; border-radius: 6px;">
      <div style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Dashboard</div>
      <div style="font-size: 11px; color: #666;">Welcome to your dashboard where you can manage things</div>
      <div style="display: flex; gap: 6px;">
        <button style="flex: 1; padding: 8px; font-size: 11px; background: #4F46E5; color: white; border: none; border-radius: 4px; font-weight: 500;">Create</button>
        <button style="flex: 1; padding: 8px; font-size: 11px; background: #4F46E5; color: white; border: none; border-radius: 4px; font-weight: 500;">Import</button>
        <button style="flex: 1; padding: 8px; font-size: 11px; background: #4F46E5; color: white; border: none; border-radius: 4px; font-weight: 500;">Export</button>
        <button style="flex: 1; padding: 8px; font-size: 11px; background: #4F46E5; color: white; border: none; border-radius: 4px; font-weight: 500;">Settings</button>
      </div>
      <div style="padding: 10px; background: white; border: 1px solid #e5e5e5; border-radius: 4px;">
        <div style="font-size: 10px; color: #999;">Recent Activity</div>
        <div style="font-size: 10px; color: #999; margin-top: 4px;">No items to display at this time</div>
      </div>
    </div>
  `,after:`
    <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 280px; padding: 12px; background: #fafafa; border-radius: 6px;">
      <div style="position: relative;">
        <div style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Dashboard</div>
        <div style="position: absolute; top: -6px; right: -4px; background: #7c3aed; color: white; font-size: 8px; padding: 2px 5px; border-radius: 6px; font-weight: 600;">HIERARCHY</div>
      </div>
      <div style="font-size: 11px; color: #666; background: #fef3c7; padding: 4px 6px; border-radius: 3px; position: relative;">
        Welcome to your dashboard where you can manage things
        <div style="position: absolute; top: -6px; right: -4px; background: #d97706; color: white; font-size: 8px; padding: 2px 5px; border-radius: 6px; font-weight: 600;">REDUNDANT</div>
      </div>
      <div style="display: flex; gap: 6px; background: #fee2e2; padding: 6px; border-radius: 4px; position: relative;">
        <div style="position: absolute; top: -6px; right: -4px; background: #dc2626; color: white; font-size: 8px; padding: 2px 5px; border-radius: 6px; font-weight: 600;">NO PRIMARY</div>
        <button style="flex: 1; padding: 8px; font-size: 11px; background: #4F46E5; color: white; border: none; border-radius: 4px; font-weight: 500;">Create</button>
        <button style="flex: 1; padding: 8px; font-size: 11px; background: #4F46E5; color: white; border: none; border-radius: 4px; font-weight: 500;">Import</button>
        <button style="flex: 1; padding: 8px; font-size: 11px; background: #4F46E5; color: white; border: none; border-radius: 4px; font-weight: 500;">Export</button>
        <button style="flex: 1; padding: 8px; font-size: 11px; background: #4F46E5; color: white; border: none; border-radius: 4px; font-weight: 500;">Settings</button>
      </div>
      <div style="padding: 10px; background: white; border: 1px solid #fca5a5; border-radius: 4px; position: relative;">
        <div style="position: absolute; top: -6px; right: -4px; background: #dc2626; color: white; font-size: 8px; padding: 2px 5px; border-radius: 6px; font-weight: 600;">DEAD END</div>
        <div style="font-size: 10px; color: #999;">Recent Activity</div>
        <div style="font-size: 10px; color: #999; margin-top: 4px;">No items to display at this time</div>
      </div>
    </div>
  `},polish:{id:`polish`,caption:`Rough edges → Refined, pixel-perfect details`,before:`
    <div style="width: 100%; max-width: 240px; padding: 16px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px;">
      <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">User Profile</div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <div style="width: 40px; height: 40px; background: #ccc; border-radius: 50%;"></div>
        <div>
          <div style="font-size: 14px;">John Doe</div>
          <div style="font-size: 12px; color: #888;">Developer</div>
        </div>
      </div>
      <button style="width: 100%; padding: 8px; background: #333; color: white; border: none; border-radius: 4px; font-size: 13px;">Edit Profile</button>
    </div>
  `,after:`
    <div style="width: 100%; max-width: 240px; padding: 20px; background: var(--color-paper); border: 1px solid var(--color-mist); border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
      <div style="font-family: var(--font-display); font-size: 1.125rem; font-weight: 400; margin-bottom: 16px; color: var(--color-ink);">User Profile</div>
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <div style="width: 48px; height: 48px; background: var(--color-ink); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--color-paper); font-weight: 600; font-size: 1.125rem;">JD</div>
        <div>
          <div style="font-size: 0.9375rem; font-weight: 500; color: var(--color-ink);">John Doe</div>
          <div style="font-size: 0.75rem; color: var(--color-ash); letter-spacing: 0.02em;">Developer</div>
        </div>
      </div>
      <button style="width: 100%; padding: 10px; background: var(--color-ink); color: var(--color-paper); border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 500; letter-spacing: 0.01em; cursor: pointer;">Edit Profile</button>
    </div>
  `},optimize:{id:`optimize`,caption:`Heavy, slow UI → Lightweight, performant`,before:`
    <div style="width: 100%; max-width: 260px; display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 12px; background: #f5f5f5; border-radius: 6px;">
        <div style="font-size: 11px; color: #999; margin-bottom: 4px;">BUNDLE SIZE</div>
        <div style="height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
          <div style="width: 95%; height: 100%; background: linear-gradient(90deg, #ff6b6b, #ee5a5a);"></div>
        </div>
        <div style="font-size: 12px; color: #ff6b6b; margin-top: 4px; font-weight: 600;">847 KB</div>
      </div>
      <div style="padding: 12px; background: #f5f5f5; border-radius: 6px;">
        <div style="font-size: 11px; color: #999; margin-bottom: 4px;">RENDER TIME</div>
        <div style="height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
          <div style="width: 80%; height: 100%; background: linear-gradient(90deg, #ffa726, #ff9800);"></div>
        </div>
        <div style="font-size: 12px; color: #ff9800; margin-top: 4px; font-weight: 600;">2.4s</div>
      </div>
      <div style="padding: 12px; background: #f5f5f5; border-radius: 6px;">
        <div style="font-size: 11px; color: #999; margin-bottom: 4px;">LAYOUT SHIFTS</div>
        <div style="height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
          <div style="width: 60%; height: 100%; background: linear-gradient(90deg, #ffa726, #ff9800);"></div>
        </div>
        <div style="font-size: 12px; color: #ff9800; margin-top: 4px; font-weight: 600;">CLS: 0.18</div>
      </div>
    </div>
  `,after:`
    <div style="width: 100%; max-width: 260px; display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 12px; background: var(--color-paper); border: 1px solid var(--color-mist); border-radius: 6px;">
        <div style="font-size: 11px; color: var(--color-ash); margin-bottom: 4px;">BUNDLE SIZE</div>
        <div style="height: 8px; background: var(--color-mist); border-radius: 4px; overflow: hidden;">
          <div style="width: 25%; height: 100%; background: linear-gradient(90deg, #22c55e, #16a34a);"></div>
        </div>
        <div style="font-size: 12px; color: #22c55e; margin-top: 4px; font-weight: 600;">124 KB <span style="color: var(--color-ash); font-weight: 400;">(-85%)</span></div>
      </div>
      <div style="padding: 12px; background: var(--color-paper); border: 1px solid var(--color-mist); border-radius: 6px;">
        <div style="font-size: 11px; color: var(--color-ash); margin-bottom: 4px;">RENDER TIME</div>
        <div style="height: 8px; background: var(--color-mist); border-radius: 4px; overflow: hidden;">
          <div style="width: 15%; height: 100%; background: linear-gradient(90deg, #22c55e, #16a34a);"></div>
        </div>
        <div style="font-size: 12px; color: #22c55e; margin-top: 4px; font-weight: 600;">0.3s <span style="color: var(--color-ash); font-weight: 400;">(-88%)</span></div>
      </div>
      <div style="padding: 12px; background: var(--color-paper); border: 1px solid var(--color-mist); border-radius: 6px;">
        <div style="font-size: 11px; color: var(--color-ash); margin-bottom: 4px;">LAYOUT SHIFTS</div>
        <div style="height: 8px; background: var(--color-mist); border-radius: 4px; overflow: hidden;">
          <div style="width: 5%; height: 100%; background: linear-gradient(90deg, #22c55e, #16a34a);"></div>
        </div>
        <div style="font-size: 12px; color: #22c55e; margin-top: 4px; font-weight: 600;">CLS: 0.02 <span style="color: var(--color-ash); font-weight: 400;">(excellent)</span></div>
      </div>
    </div>
  `},harden:{id:`harden`,caption:`Fragile UI → Robust error handling`,before:`
    <div style="width: 100%; max-width: 260px; display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 16px; background: #fff0f0; border-radius: 6px; text-align: center;">
        <div style="font-size: 24px; margin-bottom: 8px;">⚠️</div>
        <div style="font-size: 14px; color: #cc0000; font-weight: 500;">Error</div>
        <div style="font-size: 12px; color: #888; margin-top: 4px;">Something went wrong</div>
        <button style="margin-top: 12px; padding: 6px 12px; background: #ddd; border: none; border-radius: 4px; font-size: 12px; color: #666;">OK</button>
      </div>
      <div style="padding: 12px; background: #f5f5f5; border-radius: 6px;">
        <div style="font-size: 11px; color: #999; margin-bottom: 4px;">Form Input</div>
        <input type="text" value="invalid@" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; box-sizing: border-box;">
      </div>
    </div>
  `,after:`
    <div style="width: 100%; max-width: 260px; display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 14px; background: var(--ks-paper-raised); border: 1px solid var(--ks-rule); border-radius: var(--ks-radius-md);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
          <div style="width: 28px; height: 28px; background: color-mix(in oklab, var(--ks-vermilion) 10%, var(--ks-paper-raised)); color: var(--ks-vermilion); border-radius: var(--ks-radius-pill); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8v4m0 4h.01"/><path d="m10.27 3.9-8.48 14.7A2 2 0 0 0 3.52 21h16.96a2 2 0 0 0 1.73-2.4L13.73 3.9a2 2 0 0 0-3.46 0Z"/></svg>
          </div>
          <div style="font-size: 0.875rem; line-height: 1.35; font-weight: 600; color: var(--ks-ink);">Connection failed</div>
        </div>
        <div style="font-size: 0.8125rem; color: var(--ks-text-muted); line-height: 1.4;">Unable to reach the server. Check your internet connection and try again.</div>
        <button style="width: 100%; min-height: var(--ks-control-lg); margin-top: 12px; padding: 0 14px; background: var(--ks-ink); color: var(--ks-paper-raised); border: none; border-radius: var(--ks-radius-sm); font-size: 0.8125rem; line-height: 1.2; font-weight: 500; cursor: pointer;">Retry Connection</button>
      </div>
      <div style="padding: 10px 12px; background: var(--ks-paper-raised); border: 1px solid var(--ks-rule); border-radius: var(--ks-radius-md);">
        <div style="font-size: 11px; line-height: 1.2; color: var(--ks-text-muted); margin-bottom: 6px;">Email Address</div>
        <input type="text" value="invalid@" style="width: 100%; height: var(--ks-control-md); padding: 8px; border: 1px solid var(--ks-vermilion); border-radius: var(--ks-radius-sm); font-size: 13px; color: var(--ks-ink); box-sizing: border-box; background: var(--ks-paper-raised);">
        <div style="font-size: 11px; line-height: 1.2; color: var(--ks-vermilion); margin-top: 4px;">Please enter a complete email address</div>
      </div>
    </div>
  `},clarify:{id:`clarify`,caption:`Confusing copy → Clear, actionable language`,before:`
    <div style="width: 100%; max-width: 260px; display: flex; flex-direction: column; gap: 12px;">
      <div style="padding: 12px; background: #f5f5f5; border-radius: 6px;">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 4px;">Processing Status</div>
        <div style="font-size: 12px; color: #666;">Your request is being processed. Please wait while we complete the operation. This may take some time depending on various factors.</div>
      </div>
      <div style="padding: 12px; background: #fff8e1; border-radius: 6px;">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 4px;">⚠️ Warning</div>
        <div style="font-size: 12px; color: #666;">Proceeding with this action may result in irreversible consequences to your data and settings configuration.</div>
      </div>
      <button style="padding: 10px; background: #333; color: white; border: none; border-radius: 4px; font-size: 13px;">Submit Request</button>
    </div>
  `,after:`
    <div style="width: 100%; max-width: 260px; display: flex; flex-direction: column; gap: 12px;">
      <div style="padding: 12px; background: var(--color-paper); border: 1px solid var(--color-mist); border-radius: 6px;">
        <div style="font-size: 0.8125rem; font-weight: 600; color: var(--color-ink); margin-bottom: 4px;">Saving changes...</div>
        <div style="font-size: 0.75rem; color: var(--color-ash);">About 10 seconds remaining</div>
        <div style="margin-top: 8px; height: 4px; background: var(--color-mist); border-radius: 2px; overflow: hidden;">
          <div style="width: 60%; height: 100%; background: var(--color-accent);"></div>
        </div>
      </div>
      <div style="padding: 12px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 6px;">
        <div style="font-size: 0.8125rem; font-weight: 600; color: #92400e; margin-bottom: 4px;">Delete this project?</div>
        <div style="font-size: 0.75rem; color: #854d0e; line-height: 1.5;">This will permanently delete 23 files. You can't undo this.</div>
      </div>
      <button style="padding: 10px; background: var(--color-ink); color: var(--color-paper); border: none; border-radius: 6px; font-size: 0.8125rem; font-weight: 500;">Save and Continue →</button>
    </div>
  `},quieter:{id:`quieter`,caption:`Overwhelming design → Calm, focused interface`,before:`
    <div style="width: 100%; max-width: 280px; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; text-align: center;">
      <div style="font-size: 24px; margin-bottom: 8px;">🎉✨🚀</div>
      <div style="font-size: 18px; font-weight: 800; color: #ffeb3b; text-transform: uppercase; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); margin-bottom: 8px;">AMAZING DEAL!</div>
      <div style="font-size: 14px; color: white; margin-bottom: 12px;">Don't miss out on this INCREDIBLE opportunity!!!</div>
      <div style="display: flex; gap: 8px; justify-content: center;">
        <button style="padding: 10px 16px; background: #ff4081; color: white; border: none; border-radius: 20px; font-weight: bold; font-size: 14px; text-transform: uppercase; box-shadow: 0 4px 15px rgba(255,64,129,0.4);">BUY NOW!!</button>
        <button style="padding: 10px 16px; background: #00e676; color: white; border: none; border-radius: 20px; font-weight: bold; font-size: 14px; text-transform: uppercase;">LEARN MORE</button>
      </div>
    </div>
  `,after:`
    <div style="width: 100%; max-width: 280px; padding: 22px; background: var(--ks-paper-raised); border: 1px solid var(--ks-rule); border-radius: var(--ks-radius-md); text-align: center;">
      <div style="font-size: 1.0625rem; line-height: 1.35; font-weight: 600; color: var(--ks-ink); margin-bottom: 8px;">Limited Time Offer</div>
      <div style="font-size: 0.875rem; color: var(--ks-text-muted); margin-bottom: 22px; line-height: 1.5;">Save 20% on annual plans. Offer ends Friday.</div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <button style="width: 100%; min-height: var(--ks-control-lg); padding: 0 22px; background: var(--color-ink); color: var(--ks-paper-raised); border: none; border-radius: var(--ks-radius-sm); font-size: 0.875rem; line-height: 1.2; font-weight: 500;">View Plans</button>
        <button style="width: 100%; min-height: var(--ks-control-md); padding: 0 12px; background: transparent; color: var(--ks-text-muted); border: none; border-radius: var(--ks-radius-sm); font-size: 0.8125rem; line-height: 1.2;">Maybe Later</button>
      </div>
    </div>
  `},distill:{id:`distill`,caption:`Cluttered interface → Essential elements only`,before:`
    <div style="width: 100%; max-width: 280px; padding: 12px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 6px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #ddd;">
        <span style="font-size: 12px; color: #666;">Dashboard</span>
        <div style="display: flex; gap: 4px;">
          <button style="padding: 2px 6px; font-size: 10px; background: #e0e0e0; border: none; border-radius: 2px;">⚙️</button>
          <button style="padding: 2px 6px; font-size: 10px; background: #e0e0e0; border: none; border-radius: 2px;">🔔</button>
          <button style="padding: 2px 6px; font-size: 10px; background: #e0e0e0; border: none; border-radius: 2px;">❓</button>
          <button style="padding: 2px 6px; font-size: 10px; background: #e0e0e0; border: none; border-radius: 2px;">⋮</button>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
        <div style="padding: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 10px; color: #666;">Revenue<br><b>$12,345</b></div>
        <div style="padding: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 10px; color: #666;">Users<br><b>1,234</b></div>
        <div style="padding: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 10px; color: #666;">Growth<br><b>+12%</b></div>
        <div style="padding: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 10px; color: #666;">Bounce<br><b>32%</b></div>
      </div>
      <div style="margin-top: 8px; padding: 8px; background: #e3f2fd; border-radius: 4px; font-size: 10px; color: #1976d2;">📊 View detailed analytics →</div>
      <div style="margin-top: 4px; padding: 8px; background: #fff3e0; border-radius: 4px; font-size: 10px; color: #e65100;">🎯 Set up goals →</div>
    </div>
  `,after:`
    <div style="width: 100%; max-width: 260px; padding: 20px; background: var(--color-paper); border: 1px solid var(--color-mist); border-radius: 8px;">
      <div style="font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-ash); margin-bottom: 16px;">This Month</div>
      <div style="margin-bottom: 20px;">
        <div style="font-family: var(--font-display); font-size: 2.5rem; font-weight: 300; color: var(--color-ink); line-height: 1;">$12,345</div>
        <div style="font-size: 0.8125rem; color: #22c55e; margin-top: 4px;">↑ 12% from last month</div>
      </div>
      <div style="display: flex; gap: 24px;">
        <div>
          <div style="font-size: 1.25rem; font-weight: 500; color: var(--color-ink);">1,234</div>
          <div style="font-size: 0.6875rem; color: var(--color-ash);">Active users</div>
        </div>
        <div>
          <div style="font-size: 1.25rem; font-weight: 500; color: var(--color-ink);">68%</div>
          <div style="font-size: 0.6875rem; color: var(--color-ash);">Retention</div>
        </div>
      </div>
    </div>
  `},colorize:{id:`colorize`,caption:`Monochrome UI → Strategic, harmonious color`,before:`
    <div style="width: 100%; max-width: 240px; padding: 16px; background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 6px;">
      <div style="font-size: 11px; color: #999; margin-bottom: 12px;">TASK OVERVIEW</div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 4px;">
          <div style="width: 8px; height: 8px; background: #ccc; border-radius: 2px;"></div>
          <span style="font-size: 12px; color: #666;">Design review</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 4px;">
          <div style="width: 8px; height: 8px; background: #ccc; border-radius: 2px;"></div>
          <span style="font-size: 12px; color: #666;">Update copy</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 4px;">
          <div style="width: 8px; height: 8px; background: #ccc; border-radius: 2px;"></div>
          <span style="font-size: 12px; color: #666;">Final QA</span>
        </div>
      </div>
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0;">
        <div style="font-size: 11px; color: #999;">Progress: 1 of 3</div>
      </div>
    </div>
  `,after:`
    <div style="width: 100%; max-width: 240px; padding: 16px; background: var(--color-paper); border: 1px solid var(--color-mist); border-radius: 8px;">
      <div style="font-size: 0.6875rem; letter-spacing: 0.08em; color: var(--color-ash); margin-bottom: 12px;">TASK OVERVIEW</div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: color-mix(in oklab, var(--ks-patina-deep) 8%, var(--color-paper)); border: 1px solid color-mix(in oklab, var(--ks-patina-deep) 20%, var(--color-paper)); border-radius: 6px;">
          <div style="width: 18px; height: 18px; background: var(--ks-patina-deep); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--ks-paper-raised); flex-shrink: 0;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg></div>
          <span style="font-size: 0.8125rem; color: var(--ks-patina-deep); text-decoration: line-through;">Design review</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--color-paper); border: 2px solid var(--ks-patina-deep); border-radius: 6px;">
          <div style="width: 18px; height: 18px; border: 2px solid var(--ks-patina-deep); border-radius: 4px; background: var(--ks-paper-raised); flex-shrink: 0;"></div>
          <span style="font-size: 0.8125rem; color: var(--color-ink); font-weight: 500;">Update copy</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--color-paper); border: 1px solid var(--color-mist); border-radius: 6px;">
          <div style="width: 18px; height: 18px; border: 1px solid var(--ks-edge); border-radius: 4px; background: var(--ks-paper-raised); flex-shrink: 0;"></div>
          <span style="font-size: 0.8125rem; color: var(--color-ash);">Final QA</span>
        </div>
      </div>
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--color-mist);">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="flex: 1; height: 4px; background: var(--color-mist); border-radius: 2px; overflow: hidden;">
            <div style="width: 33%; height: 100%; background: var(--ks-patina-deep);"></div>
          </div>
          <span style="font-size: 0.6875rem; color: var(--ks-patina-deep); font-weight: 500;">1/3</span>
        </div>
      </div>
    </div>
  `},delight:{id:`delight`,caption:`Functional feedback → Moment of joy`,before:`
    <div style="width: 100%; max-width: 200px; display: flex; flex-direction: column; align-items: center; gap: 16px;">
      <div style="text-align: center;">
        <div style="font-size: 13px; color: #666; margin-bottom: 8px;">Milestone reached</div>
        <div style="font-size: 24px; font-weight: bold; color: #333;">100</div>
        <div style="font-size: 12px; color: #999;">tasks completed</div>
      </div>
      <button style="padding: 8px 16px; background: #e0e0e0; border: none; border-radius: 4px; font-size: 12px; color: #666;">Dismiss</button>
    </div>
  `,after:`
    <div class="delight-demo-after" style="width: 100%; max-width: 240px; display: flex; flex-direction: column; align-items: center; gap: 16px; position: relative;">
      <div class="delight-demo-confetti" aria-hidden="true" style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); display: flex; gap: 4px;">
        <span style="animation: confettiFall 1s ease-out 0.0s both; display: block; width: 4px; height: 8px; background: var(--ks-patina-deep); border-radius: 1px;"></span>
        <span style="animation: confettiFall 1s ease-out 0.1s both; display: block; width: 4px; height: 8px; background: var(--ks-patina); border-radius: 1px;"></span>
        <span style="animation: confettiFall 1s ease-out 0.2s both; display: block; width: 4px; height: 8px; background: var(--ks-patina-ink); border-radius: 1px;"></span>
        <span style="animation: confettiFall 1s ease-out 0.15s both; display: block; width: 4px; height: 8px; background: var(--ks-patina); border-radius: 1px;"></span>
        <span style="animation: confettiFall 1s ease-out 0.25s both; display: block; width: 4px; height: 8px; background: var(--ks-patina-deep); border-radius: 1px;"></span>
      </div>
      <div style="text-align: center; animation: celebratePop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;">
        <div style="font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ks-patina-deep); margin-bottom: 8px; font-weight: 600;">Milestone unlocked!</div>
        <div style="font-family: var(--font-display); font-size: 3.5rem; font-weight: 300; font-style: italic; color: var(--color-ink); line-height: 1;">100</div>
        <div style="font-size: 0.875rem; color: var(--color-ash); margin-top: 4px;">tasks completed</div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: color-mix(in oklab, var(--ks-patina-deep) 10%, var(--color-paper)); border-radius: 20px; animation: badgeSlide 0.5s ease-out 0.3s both;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="color: var(--ks-patina-deep); flex-shrink: 0;"><path d="M8 3h8v5a4 4 0 0 1-8 0V3ZM8 5H5v2a4 4 0 0 0 4 4m7-6h3v2a4 4 0 0 1-4 4M12 12v5m-4 4h8m-6-4h4v4h-4z"/></svg>
        <span style="font-size: 0.75rem; font-weight: 600; color: var(--ks-patina-deep);">Centurion Badge Earned</span>
      </div>
    </div>
    <style>
      @keyframes confettiFall {
        0% { opacity: 0; transform: translateY(-20px) rotate(0deg); }
        50% { opacity: 1; }
        100% { opacity: 0; transform: translateY(40px) rotate(180deg); }
      }
      @keyframes celebratePop {
        0% { opacity: 0; transform: scale(0.5); }
        70% { transform: scale(1.05); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes badgeSlide {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .delight-demo-after * { animation: none !important; }
        .delight-demo-confetti { display: none !important; }
      }
    </style>
  `},adapt:{id:`adapt`,caption:`Fixed layout → Responsive across devices`,before:`
    <div style="width: 100%; max-width: 280px; display: flex; gap: 12px; align-items: flex-end;">
      <div style="text-align: center;">
        <div style="width: 48px; height: 80px; background: #f5f5f5; border: 2px solid #ddd; border-radius: 6px; padding: 4px; box-sizing: border-box;">
          <div style="height: 100%; display: flex; flex-direction: column; gap: 2px; overflow: hidden;">
            <div style="height: 16px; background: #ccc; border-radius: 2px;"></div>
            <div style="height: 8px; background: #e0e0e0; border-radius: 1px; width: 80%;"></div>
            <div style="height: 8px; background: #e0e0e0; border-radius: 1px; font-size: 6px; color: #999; overflow: hidden;">Text too small...</div>
          </div>
        </div>
        <div style="font-size: 9px; color: #999; margin-top: 4px;">Mobile</div>
        <div style="font-size: 8px; color: #cc0000;">Broken ✗</div>
      </div>
      <div style="text-align: center;">
        <div style="width: 100px; height: 70px; background: #f5f5f5; border: 2px solid #ddd; border-radius: 4px; padding: 6px; box-sizing: border-box;">
          <div style="display: flex; gap: 4px; height: 100%;">
            <div style="width: 25%; background: #ccc; border-radius: 2px;"></div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
              <div style="height: 12px; background: #e0e0e0; border-radius: 2px;"></div>
              <div style="flex: 1; background: #eee; border-radius: 2px;"></div>
            </div>
          </div>
        </div>
        <div style="font-size: 9px; color: #999; margin-top: 4px;">Desktop</div>
        <div style="font-size: 8px; color: #22c55e;">Works ✓</div>
      </div>
    </div>
  `,after:`
    <div style="width: 100%; max-width: 280px; display: flex; gap: 12px; align-items: flex-end;">
      <div style="text-align: center;">
        <div style="width: 48px; height: 80px; background: var(--color-paper); border: 2px solid var(--color-mist); border-radius: 6px; padding: 4px; box-sizing: border-box;">
          <div style="height: 100%; display: flex; flex-direction: column; gap: 3px;">
            <div style="height: 12px; background: var(--color-ink); border-radius: 2px;"></div>
            <div style="flex: 1; background: var(--color-mist); border-radius: 2px;"></div>
            <div style="height: 14px; background: var(--color-accent); border-radius: 2px;"></div>
          </div>
        </div>
        <div style="font-size: 9px; color: var(--color-ash); margin-top: 4px;">Mobile</div>
        <div style="font-size: 8px; color: #22c55e;">Stacked ✓</div>
      </div>
      <div style="text-align: center;">
        <div style="width: 72px; height: 56px; background: var(--color-paper); border: 2px solid var(--color-mist); border-radius: 4px; padding: 4px; box-sizing: border-box;">
          <div style="height: 100%; display: flex; flex-direction: column; gap: 2px;">
            <div style="height: 10px; background: var(--color-ink); border-radius: 2px;"></div>
            <div style="flex: 1; display: flex; gap: 2px;">
              <div style="flex: 1; background: var(--color-mist); border-radius: 2px;"></div>
              <div style="flex: 1; background: var(--color-mist); border-radius: 2px;"></div>
            </div>
          </div>
        </div>
        <div style="font-size: 9px; color: var(--color-ash); margin-top: 4px;">Tablet</div>
        <div style="font-size: 8px; color: #22c55e;">2-col ✓</div>
      </div>
      <div style="text-align: center;">
        <div style="width: 100px; height: 64px; background: var(--color-paper); border: 2px solid var(--color-mist); border-radius: 4px; padding: 4px; box-sizing: border-box;">
          <div style="display: flex; gap: 3px; height: 100%;">
            <div style="width: 20%; background: var(--color-charcoal); border-radius: 2px;"></div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
              <div style="height: 10px; background: var(--color-ink); border-radius: 2px;"></div>
              <div style="flex: 1; display: flex; gap: 2px;">
                <div style="flex: 1; background: var(--color-mist); border-radius: 2px;"></div>
                <div style="flex: 1; background: var(--color-mist); border-radius: 2px;"></div>
                <div style="flex: 1; background: var(--color-mist); border-radius: 2px;"></div>
              </div>
            </div>
          </div>
        </div>
        <div style="font-size: 9px; color: var(--color-ash); margin-top: 4px;">Desktop</div>
        <div style="font-size: 8px; color: #22c55e;">Sidebar ✓</div>
      </div>
    </div>
  `},typeset:{id:`typeset`,caption:`No type hierarchy → Clear, intentional typography`,before:`
    <div style="width: 100%; max-width: 240px; padding: 16px; font-family: Arial, sans-serif;">
      <div style="font-size: 14px; font-weight: bold; color: #444; margin-bottom: 8px;">Project Update</div>
      <div style="font-size: 14px; color: #444; margin-bottom: 8px;">Q1 Design Sprint</div>
      <div style="font-size: 14px; color: #444; line-height: 1.4; margin-bottom: 8px;">The team completed the redesign of the dashboard. All components have been reviewed and approved by stakeholders.</div>
      <div style="font-size: 14px; color: #444;">Updated 2 hours ago</div>
    </div>
  `,after:`
    <div style="width: 100%; max-width: 240px; padding: 16px; font-family: 'Instrument Sans', sans-serif;">
      <div style="font-size: 0.625rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-ash); margin-bottom: 6px;">Project Update</div>
      <div style="font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 600; color: var(--color-ink); line-height: 1.1; margin-bottom: 12px;">Q1 Design Sprint</div>
      <p style="font-size: 0.8125rem; color: color-mix(in oklch, var(--color-ink) 65%, transparent); line-height: 1.65; margin: 0 0 14px; max-width: 30ch;">The team completed the redesign of the dashboard. All components reviewed and approved.</p>
      <div style="font-size: 0.6875rem; color: var(--color-ash); font-variant-numeric: tabular-nums;">Updated 2 hours ago</div>
    </div>
  `},layout:{id:`layout`,caption:`Equal spacing everywhere → Intentional rhythm and hierarchy`,before:`
    <div style="width: 100%; max-width: 240px; padding: 16px;">
      <div style="text-align: center; margin-bottom: 16px;">
        <div style="font-size: 14px; font-weight: bold; color: #333;">Team Members</div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="padding: 16px; background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 8px; text-align: center;">
          <div style="width: 32px; height: 32px; background: #ddd; border-radius: 50%; margin: 0 auto 8px;"></div>
          <div style="font-size: 13px; color: #333;">Alice Chen</div>
          <div style="font-size: 12px; color: #888;">Designer</div>
        </div>
        <div style="padding: 16px; background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 8px; text-align: center;">
          <div style="width: 32px; height: 32px; background: #ddd; border-radius: 50%; margin: 0 auto 8px;"></div>
          <div style="font-size: 13px; color: #333;">Bob Park</div>
          <div style="font-size: 12px; color: #888;">Engineer</div>
        </div>
      </div>
    </div>
  `,after:`
    <div style="width: 100%; max-width: 240px; padding: 16px; font-family: var(--font-body);">
      <div style="font-size: 0.8125rem; font-weight: 600; color: var(--color-ink); margin-bottom: 16px;">Team Members</div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--color-mist);">
          <div style="width: 28px; height: 28px; background: var(--ks-gray); border-radius: 50%; flex-shrink: 0; display: grid; place-items: center; color: var(--ks-text); font-size: 11px; font-weight: 600; line-height: 1; text-align: center;">AC</div>
          <div style="flex: 1;">
            <div style="font-size: 0.8125rem; font-weight: 500; color: var(--color-ink);">Alice Chen</div>
            <div style="font-size: 0.6875rem; color: var(--color-ash);">Designer</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; padding: 10px 0;">
          <div style="width: 28px; height: 28px; background: var(--ks-gray); border-radius: 50%; flex-shrink: 0; display: grid; place-items: center; color: var(--ks-text); font-size: 11px; font-weight: 600; line-height: 1; text-align: center;">BP</div>
          <div style="flex: 1;">
            <div style="font-size: 0.8125rem; font-weight: 500; color: var(--color-ink);">Bob Park</div>
            <div style="font-size: 0.6875rem; color: var(--color-ash);">Engineer</div>
          </div>
        </div>
      </div>
    </div>
  `},overdrive:{id:`overdrive`,caption:`Static flat card → Laser-etched signature effect`,before:`
    <div style="width: 100%; height: 100%; min-height: 200px; display: flex; align-items: center; justify-content: center; background: #f5f5f5; font-family: system-ui, sans-serif;">
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 12px; color: #666; font-style: italic; line-height: 1.6; max-width: 220px; margin-bottom: 16px;">It's time to spark your imagination. Welcome to the Impeccable Community.</div>
        <div style="font-size: 12px; color: #aaa;">Paul Bakaus</div>
      </div>
    </div>
  `,after:`
    <canvas class="od-burn" style="position: absolute; inset: 0; width: 100%; height: 100%; background: #0e0d0b;"></canvas>
    <canvas class="od-sparks" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;"></canvas>
    <div style="position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; pointer-events: none; text-align: center;">
      <p style="font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-style: italic; font-weight: 400; color: rgba(240,230,210,0.85); line-height: 1.5; max-width: 260px; margin: 0 0 24px;">It's time to spark your imagination.<br>Welcome to the Impeccable Community.</p>
    </div>
  `,init(e){let t=e.querySelector(`.od-burn`),n=e.querySelector(`.od-sparks`);if(!t||!n)return;let r=t.parentElement.getBoundingClientRect(),i=Math.min(window.devicePixelRatio||1,2);for(let e of[t,n])e.width=Math.round(r.width*i),e.height=Math.round(r.height*i);let a=t.getContext(`2d`),o=n.getContext(`2d`);a.setTransform(i,0,0,i,0,0),o.setTransform(i,0,0,i,0,0);let s=r.width,c=r.height;a.fillStyle=`#0e0d0b`,a.fillRect(0,0,s,c);function l(){function e(e){let t=[];function n(e,n,r,i,a,o,s,c,l){for(let u=0;u<=l;u++){let d=u/l,f=1-d;t.push({x:f*f*f*e+3*f*f*d*r+3*f*d*d*a+d*d*d*s,y:f*f*f*n+3*f*f*d*i+3*f*d*d*o+d*d*d*c})}}return e(n),t}let t=e(e=>{e(6,44,5,32,4,18,8,8,14),e(8,8,16,5,26,7,26,16,12),e(26,16,26,22,18,26,14,28,10),e(14,28,18,22,23,20,26,22,8),e(26,22,29,24,28,30,24,32,6),e(24,32,28,34,30,30,32,28,5),e(32,28,34,36,38,40,42,32,8),e(42,32,44,26,47,24,48,28,6),e(48,28,49,16,50,6,53,8,10),e(53,8,55,14,56,28,58,32,8)}),n=e(e=>{e(66,44,66,32,67,16,70,8,14),e(70,8,78,4,83,10,79,18,12),e(79,18,84,15,87,24,80,30,12),e(80,30,78,34,80,36,84,32,5),e(84,32,89,24,94,22,97,26,8),e(97,26,99,30,96,34,100,30,5),e(100,30,101,20,102,14,104,16,8),e(104,16,106,24,109,28,107,32,6),e(107,32,105,36,110,36,113,30,6),e(113,30,118,24,122,22,125,28,8),e(125,28,128,36,133,38,137,30,8),e(137,30,139,26,142,24,144,28,5),e(144,28,154,24,170,22,195,28,16)}),r=s*.7/200,i=(s-200*r)/2,a=c*.52,o=e=>({x:e.x*r+i,y:e.y*r*.75+a});return[t.map(o),n.map(o)]}let u=l();function d(e){let t=[],n=0;for(let r=1;r<e.length;r++){let i=e[r].x-e[r-1].x,a=e[r].y-e[r-1].y,o=Math.sqrt(i*i+a*a);t.push(o),n+=o}return{lens:t,total:n}}let f=u.map(e=>{let{lens:t,total:n}=d(e);return{pts:e,lens:t,total:n}});function p(e,t){let n=0;for(let r=0;r<e.lens.length;r++){if(n+e.lens[r]>=t){let i=e.lens[r]>0?(t-n)/e.lens[r]:0,a=e.pts[r],o=e.pts[r+1];return{x:a.x+(o.x-a.x)*i,y:a.y+(o.y-a.y)*i}}n+=e.lens[r]}return e.pts[e.pts.length-1]}let m=f.reduce((e,t)=>e+t.total,0),h=0,g=0,_=m/3,v=u[0][0],y=[],b=`drawing`,x=0,S=0,C=[[],[]];function w(){a.lineCap=`round`,a.lineJoin=`round`;function e(e,t,n){if(!(e.length<2)){a.beginPath(),a.moveTo(e[0].x,e[0].y);for(let t=1;t<e.length-1;t++){let n=(e[t].x+e[t+1].x)/2,r=(e[t].y+e[t+1].y)/2;a.quadraticCurveTo(e[t].x,e[t].y,n,r)}a.lineTo(e[e.length-1].x,e[e.length-1].y),a.strokeStyle=t,a.lineWidth=n,a.stroke()}}for(let t of C)e(t,`rgba(180, 100, 30, 0.12)`,5),e(t,`rgba(220, 140, 50, 0.3)`,2.5),e(t,`rgba(255, 210, 130, 0.7)`,1.2),e(t,`rgba(255, 248, 235, 0.6)`,.4)}function T(e,t,n){for(let r=0;r<n;r++){let n=Math.random()*Math.PI*2,r=50+Math.random()*140;y.push({x:e,y:t,vx:Math.cos(n)*r,vy:Math.sin(n)*r,life:.15+Math.random()*.35,maxLife:.15+Math.random()*.35,size:.3+Math.random()*1,bright:Math.random()>.4})}}function E(e){if(!document.contains(t))return;S||=e;let n=Math.min(.05,(e-S)/1e3);switch(S=e,b){case`drawing`:{let e=f[h];g+=_*n,g>=e.total&&(g=e.total,T(v.x,v.y,6),h<u.length-1?(b=`lifting`,x=0):(b=`holding`,x=0));let t=p(e,g);C[h].push({x:t.x,y:t.y}),v=t,Math.random()<.4&&T(t.x,t.y,1),a.fillStyle=`#0e0d0b`,a.fillRect(0,0,s,c),w();break}case`lifting`:x+=n,x>=.25&&(h++,g=0,v=u[h][0],b=`drawing`,x=0);break;case`holding`:x+=n,x>=3.5&&(b=`fading`,x=0);break;case`fading`:x+=n,a.fillStyle=`rgba(14, 13, 11, 0.04)`,a.fillRect(0,0,s,c),x>=2&&(a.fillStyle=`#0e0d0b`,a.fillRect(0,0,s,c),h=0,g=0,v=u[0][0],y=[],C[0].length=0,C[1].length=0,b=`drawing`,x=0)}for(let e=y.length-1;e>=0;e--){let t=y[e];t.x+=t.vx*n,t.y+=t.vy*n,t.vx*=.94,t.vy*=.94,t.vy+=100*n,t.life-=n,t.life<=0&&y.splice(e,1)}o.clearRect(0,0,s,c);for(let e of y){let t=e.life/e.maxLife,n=e.size*(.3+t*.7),r=Math.sqrt(e.vx*e.vx+e.vy*e.vy);if(r>20){let i=r*.01;o.beginPath(),o.moveTo(e.x,e.y),o.lineTo(e.x-e.vx/r*i,e.y-e.vy/r*i),o.strokeStyle=e.bright?`rgba(255,255,240,${(t*.4).toFixed(3)})`:`rgba(255,180,60,${(t*.3).toFixed(3)})`,o.lineWidth=n*.5,o.lineCap=`round`,o.stroke()}o.beginPath(),o.arc(e.x,e.y,n,0,Math.PI*2),o.fillStyle=e.bright?`rgba(255,255,255,${(t*.85).toFixed(3)})`:`rgba(255,200,80,${(t*.75).toFixed(3)})`,o.fill()}if(b===`drawing`&&g<f[h].total){let e=p(f[h],g),t=.85+Math.random()*.15,n=o.createRadialGradient(e.x,e.y,0,e.x,e.y,35);n.addColorStop(0,`rgba(255,100,20,${.15*t})`),n.addColorStop(.4,`rgba(200,60,10,${.05*t})`),n.addColorStop(1,`rgba(150,40,10,0)`),o.fillStyle=n,o.beginPath(),o.arc(e.x,e.y,35,0,Math.PI*2),o.fill();let r=o.createRadialGradient(e.x,e.y,0,e.x,e.y,16);r.addColorStop(0,`rgba(255,180,60,${.45*t})`),r.addColorStop(.5,`rgba(255,140,40,${.15*t})`),r.addColorStop(1,`rgba(200,80,20,0)`),o.fillStyle=r,o.beginPath(),o.arc(e.x,e.y,16,0,Math.PI*2),o.fill();let i=o.createRadialGradient(e.x,e.y,0,e.x,e.y,6);i.addColorStop(0,`rgba(255,255,255,${.95*t})`),i.addColorStop(.3,`rgba(255,250,240,${.7*t})`),i.addColorStop(.6,`rgba(255,220,160,${.3*t})`),i.addColorStop(1,`rgba(255,180,80,0)`),o.fillStyle=i,o.beginPath(),o.arc(e.x,e.y,6,0,Math.PI*2),o.fill();let a=o.createRadialGradient(e.x,e.y,0,e.x,e.y,2.5);a.addColorStop(0,`rgba(255,255,255,${t})`),a.addColorStop(1,`rgba(255,255,255,0)`),o.fillStyle=a,o.beginPath(),o.arc(e.x,e.y,2.5,0,Math.PI*2),o.fill()}requestAnimationFrame(E)}requestAnimationFrame(E)}}};function t(t){return e[t]||null}function n(e,n){let r=t(e);if(r&&typeof r.init==`function`){let t=n.querySelector(`.split-after .split-content`)||n;console.log(`[initCommandDemo]`,e,`demoArea:`,t),r.init(t)}}function r(e){let n=t(e);return n?`
    <figure class="demo-split-comparison" data-demo="command-${n.id}" style="margin: 0;">
      <div class="split-container" data-impeccable-ignore="codex-grid-background">
        <div class="split-before">
          <div class="split-content" inert aria-hidden="true">${n.before}</div>
        </div>
        <div class="split-after">
          <div class="split-content" inert aria-hidden="true">${n.after||n.before}</div>
        </div>
        <div class="split-divider"></div>
      </div>
      <figcaption class="demo-caption">${n.caption}</figcaption>
    </figure>
  `:e===`impeccable`?`
        <div class="demo-container">
          <div class="demo-viewport" style="padding: var(--spacing-lg); font-size: 13px; line-height: 1.6;">
            <div style="display: flex; flex-direction: column; gap: 16px; color: var(--color-ash);">
              <div style="font-size: 14px; color: var(--color-text); font-weight: 600;">Three ways to use /impeccable</div>
              <div style="display: flex; flex-direction: column; gap: 14px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <code style="font-size: 12px; color: var(--spread-accent, var(--color-accent)); font-weight: 600; white-space: nowrap;">/impeccable</code>
                    <span style="opacity: 0.4; font-size: 11px;">freeform</span>
                  </div>
                  <span style="padding-left: 0; opacity: 0.8;">Use on any task. Loads full design intelligence, anti-patterns, and reference knowledge into the current context.</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <code style="font-size: 12px; color: var(--spread-accent, var(--color-accent)); font-weight: 600; white-space: nowrap;">/impeccable init</code>
                    <span style="opacity: 0.4; font-size: 11px;">one-time setup</span>
                  </div>
                  <span style="padding-left: 0; opacity: 0.8;">Scans your codebase, interviews you about brand and audience, saves a Design Context all other commands use, configures live mode, and points you at what to run next.</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <code style="font-size: 12px; color: var(--spread-accent, var(--color-accent)); font-weight: 600; white-space: nowrap;">/impeccable craft</code>
                    <span style="opacity: 0.4; font-size: 11px;">build a feature</span>
                  </div>
                  <span style="padding-left: 0; opacity: 0.8;">Runs /shape to plan UX first, loads the right references, then builds and iterates visually until the result delights.</span>
                </div>
              </div>
              <div style="font-size: 12px; opacity: 0.5; margin-top: 2px; font-style: italic;">Start with <code style="font-size: 11px;">/impeccable init</code> once per project. Then use the other modes as needed.</div>
            </div>
          </div>
        </div>
      `:e===`craft`?`
        <div class="demo-container">
          <div class="demo-viewport" style="padding: var(--spacing-lg); font-size: 13px; line-height: 1.6;">
            <div style="display: flex; flex-direction: column; gap: 16px; color: var(--color-ash);">
              <div style="font-size: 14px; color: var(--color-text); font-weight: 600;">Shape, reference, build, iterate</div>
              <div style="display: flex; flex-direction: column; gap: 14px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">1. Shape</span>
                  </div>
                  <span style="opacity: 0.8;">Runs <code style="font-size: 11px;">/impeccable shape</code> internally to build a design brief from discovery questions. No code yet.</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">2. Reference</span>
                  </div>
                  <span style="opacity: 0.8;">Loads the right reference files for the feature (spatial design, typography, motion, color) based on what the brief calls for.</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">3. Build</span>
                  </div>
                  <span style="opacity: 0.8;">Implements structure, spacing, type, color, states, motion, responsive. Every decision traces back to the brief.</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">4. Visual iteration</span>
                  </div>
                  <span style="opacity: 0.8;">Opens the result in a browser, checks against the brief and anti-pattern list, refines until the polish bar is high.</span>
                </div>
              </div>
              <div class="demo-craft-note" style="font-size: 12px; opacity: 0.5; margin-top: 2px; font-style: italic;">The full shape-then-build flow in one command. Best for brand-new features.</div>
            </div>
          </div>
        </div>
      `:e===`init`?`
        <div class="demo-container">
          <div class="demo-viewport" style="padding: var(--spacing-lg); font-size: 13px; line-height: 1.6;">
            <div style="display: flex; flex-direction: column; gap: 16px; color: var(--color-ash);">
              <div style="font-size: 14px; color: var(--color-text); font-weight: 600;">One-time project setup</div>
              <div style="display: flex; flex-direction: column; gap: 14px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">1. Explore</span>
                  </div>
                  <span style="opacity: 0.8;">Scans the codebase for brand assets, existing design tokens, typography, components, and documentation.</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">2. Interview</span>
                  </div>
                  <span style="opacity: 0.8;">Asks about audience, brand personality, aesthetic direction, and accessibility needs. Skips anything it can infer from the code.</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">3. Configure</span>
                  </div>
                  <span style="opacity: 0.8;">Writes <code style="font-size: 11px;">PRODUCT.md</code> with users, brand, and design principles, optionally a <code style="font-size: 11px;">DESIGN.md</code> visual spec, and sets up live mode so it just works.</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">4. Recommend</span>
                  </div>
                  <span style="opacity: 0.8;">Points you at the best commands to run next, picked from what the scan found. No more guessing where to start.</span>
                </div>
              </div>
              <div style="font-size: 12px; opacity: 0.5; margin-top: 2px; font-style: italic;">Run once per project. Then forget it exists.</div>
            </div>
          </div>
        </div>
      `:e===`shape`?`
        <div class="demo-container">
          <div class="demo-viewport" style="padding: var(--spacing-lg); font-size: 13px; line-height: 1.6;">
            <div style="display: flex; flex-direction: column; gap: 16px; color: var(--color-ash);">
              <div style="font-size: 14px; color: var(--color-text); font-weight: 600;">Design before you build</div>
              <div style="display: flex; flex-direction: column; gap: 14px;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">1. Discovery</span>
                  </div>
                  <span style="opacity: 0.8;">Interviews you about purpose, audience, content, constraints, and anti-goals. Adapts questions based on your answers.</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">2. Design Brief</span>
                  </div>
                  <span style="opacity: 0.8;">Synthesizes a 9-section brief: feature summary, primary action, design direction, layout strategy, key states, interaction model, content needs, recommended references, and open questions.</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; gap: 8px; align-items: baseline;">
                    <span style="color: var(--spread-accent, var(--color-accent)); font-weight: 600; font-size: 12px;">3. Handoff</span>
                  </div>
                  <span style="opacity: 0.8;">The confirmed brief guides <code style="font-size: 11px;">/impeccable craft</code> or any other implementation approach. No code written, just the thinking that makes code good.</span>
                </div>
              </div>
              <div style="font-size: 12px; opacity: 0.5; margin-top: 2px; font-style: italic;">Use standalone or as the first step of <code style="font-size: 11px;">/impeccable craft</code>.</div>
            </div>
          </div>
        </div>
      `:`
      <div class="demo-container">
        <div class="demo-viewport">
          <div class="demo-placeholder">
            Visual demo for /${e} coming soon
          </div>
        </div>
      </div>
    `}function i(e,t={}){let{defaultPosition:n=70,skewAngle:r=10,lerpSpeed:i=.15,animationThreshold:a=40,onCrossThreshold:o=null}=t,s=e.querySelector(`.split-container`),c=e.querySelector(`.split-after`),l=e.querySelector(`.split-divider`);if(!s||!c||!l)return null;let u=Math.tan(r*Math.PI/180),d=8;function f(){let e=s.getBoundingClientRect();e.width>0&&e.height>0&&(d=50*e.height*u/e.width)}f();let p=new ResizeObserver(f);p.observe(s);let m=-d,h=100+d;t.minPosition!=null&&(m=t.minPosition),t.maxPosition!=null&&(h=t.maxPosition);let g=!1,_=n,v=n,y=null,b=n>a;function x(e){let n=t.minPosition==null?-d:m,r=t.maxPosition==null?100+d:h,i=Math.max(n,Math.min(r,e)),s=i>a;b&&!s&&(S(),o&&o(i)),b=s,c.style.clipPath=`polygon(${i+d}% 0%, 100% 0%, 100% 100%, ${i-d}% 100%)`,l.style.left=`${i}%`}function S(){let e=c.querySelector(`.split-content`);if(e){if(e.querySelector(`canvas, .od-burn, .od-sparks`))e.querySelectorAll(`*`).forEach(e=>{if(e.tagName===`CANVAS`)return;let t=getComputedStyle(e).animationName;t&&t!==`none`&&(e.style.animation=`none`,e.offsetHeight,e.style.animation=``)});else{let t=e.cloneNode(!0);e.parentNode.replaceChild(t,e)}}}function C(){let e=v-_;Math.abs(e)>.1?(_+=e*i,x(_),y=requestAnimationFrame(C)):(_=v,x(_),y=null)}function w(){y||=requestAnimationFrame(C)}function T(){g=!0}function E(){g=!1,v=n,w()}function D(e){if(g){let t=s.getBoundingClientRect(),n=100+2*d;v=(e.clientX-t.left)/t.width*n-d,w()}}let O=0,k=0,A=!1;function j(e){let t=e.touches[0];O=t.clientX,k=t.clientY,A=!1,g=!0}function M(){g=!1,A=!1,v=n,w()}function N(e){let t=e.touches[0],n=Math.abs(t.clientX-O),r=Math.abs(t.clientY-k);if(!A){if(n>10&&n>r)A=!0;else if(r>10)return;else return}if(A){e.preventDefault();let n=s.getBoundingClientRect();v=(t.clientX-n.left)/n.width*100,w()}}let P=s.parentElement||s;return P.addEventListener(`mouseenter`,T),P.addEventListener(`mouseleave`,E),P.addEventListener(`mousemove`,D),s.addEventListener(`touchstart`,j),s.addEventListener(`touchend`,M),s.addEventListener(`touchmove`,N,{passive:!1}),x(n),{destroy(){P.removeEventListener(`mouseenter`,T),P.removeEventListener(`mouseleave`,E),P.removeEventListener(`mousemove`,D),s.removeEventListener(`touchstart`,j),s.removeEventListener(`touchend`,M),s.removeEventListener(`touchmove`,N),y&&cancelAnimationFrame(y),p.disconnect()},setPosition(e){v=e,w()}}}var a=document.querySelector(`.docs-command-demo`);if(a){let e=a.dataset.command;if(t(e)){a.innerHTML=r(e);let t=a.querySelector(`.demo-split-comparison`);t&&i(t,{defaultPosition:50,skewAngle:0,minPosition:10,maxPosition:90}),n(e,a)}else a.remove()}