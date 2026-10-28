function CompareScene({ scene }) {
  const { localTime, dur } = window.useScene();
  const tweaks = window.useTweaks ? window.useTweaks(window.TWEAK_DEFAULTS)[0] : {};
  const containerRef = React.useRef(null);
  const [manualFrac, setManualFrac] = React.useState(null);
  const [dragging, setDragging] = React.useState(false);

  const autoSettled = localTime >= dur - 0.001;
  const isManualPhase = autoSettled || manualFrac !== null;

  const k = 1.6;
  const envelope = Math.max(0, 1 - localTime / dur);
  const autoFrac = 0.5 + 0.48 * envelope * Math.sin((2 * Math.PI * k * localTime) / dur);
  const dividerFrac = isManualPhase ? (manualFrac !== null ? manualFrac : 0.5) : autoFrac;

  const hintEarlyIn = window.clamp((localTime - 0.4) / 0.5, 0, 1);
  const hintEarlyHold = localTime > 0.9 && localTime < 2.4;
  const hintEarlyOut = 1 - window.clamp((localTime - 2.4) / 0.6, 0, 1);
  const hintEarlyOpacity = localTime < 0.9 ? hintEarlyIn : (hintEarlyHold ? 1 : Math.max(0, hintEarlyOut));
  const hintManualOpacity = isManualPhase && manualFrac === null ? 1 : 0;
  const hintOpacity = Math.max(hintEarlyOpacity, hintManualOpacity);

  const updateFromClientX = (clientX) => {
    const rect = containerRef.current.getBoundingClientRect();
    const frac = window.clamp((clientX - rect.left) / rect.width, 0.02, 0.98);
    setManualFrac(frac);
  };
  const onPointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    setDragging(true);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    updateFromClientX(e.clientX);
  };
  const onPointerUp = () => setDragging(false);

  const winW = 1100, winH = 700, barH = 44;
  const imgH = winH - barH;
  const bezel = 22;
  const oldLabel = tweaks.oldLabel || scene.oldLabel || 'Before';
  const newLabel = tweaks.newLabel || scene.newLabel || 'After';
  const oldLabelOpacity = window.clamp((dividerFrac - 0.03) / 0.05, 0, 1);
  const newLabelOpacity = window.clamp((0.97 - dividerFrac) / 0.05, 0, 1);

  return (
    <div style={{
      width: '100%', height: '100%', background: 'oklch(0.24 0.01 90)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Helvetica, Arial, sans-serif',
    }}>
      <div style={{
        position: 'relative', width: winW + bezel * 2, height: winH + bezel * 2 + 26, borderRadius: 36,
        background: '#1c1c1e', boxShadow: '0 40px 100px rgba(0,0,0,0.5)', padding: bezel,
        boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        transform: `scale(${1 + 0.01 * (0.5 + 0.5 * Math.sin((2 * Math.PI * k * localTime) / dur))})`,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3a3a3c' }} />
        <div style={{
          position: 'relative', width: winW, height: winH, borderRadius: 12, overflow: 'hidden',
          background: '#fff',
        }}>
          <div style={{
            height: barH, background: '#ececec', display: 'flex', alignItems: 'center',
            gap: 8, padding: '0 16px', borderBottom: '1px solid #ddd',
          }}>
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
            <div style={{
              marginLeft: 16, flex: 1, height: 24, borderRadius: 6, background: '#fff',
              display: 'flex', alignItems: 'center', padding: '0 12px', color: '#888', fontSize: 12,
            }}>topspersoneel.nl</div>
          </div>
          <div ref={containerRef} style={{ position: 'relative', width: winW, height: imgH, overflow: 'hidden', background: '#fff' }}>
            <img src="uploads/Screenshot 2026-07-24 at 16.09.19.png" alt="new design" style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              objectFit: 'contain', objectPosition: 'top',
            }} />
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              clipPath: `inset(0 calc(${100 - dividerFrac * 100}% - 2px) 0 0)`,
            }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#e8a63c' }}>
              <img src="uploads/tops_old hero.png" alt="old design" style={{
                width: '150%', height: 'auto', display: 'block', objectFit: 'contain', objectPosition: 'top',
                marginLeft: '-25%',
              }} />
            </div>
            </div>


            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              style={{
                position: 'absolute', top: 0, bottom: 0, left: `${dividerFrac * 100}%`,
                width: 36, marginLeft: -18, cursor: isManualPhase ? 'ew-resize' : 'default',
              }}
            />

            <div style={{
              position: 'absolute', top: '50%', left: `${dividerFrac * 100}%`,
              transform: `translate(-50%, -50%) scale(${1 + (dragging ? 0.12 : 0.06 * hintOpacity)})`,
              width: 40, height: 40, borderRadius: '50%', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)', pointerEvents: 'none',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#c9c9c9' }} />
            </div>

            <div style={{
              position: 'absolute', bottom: 14, left: 18, padding: '8px 16px', borderRadius: 999,
              background: 'rgba(120,120,120,0.5)', color: '#fff', fontSize: 13, fontWeight: 600, letterSpacing: 0.2,
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(14px) saturate(160%)', WebkitBackdropFilter: 'blur(14px) saturate(160%)',
              textTransform: 'uppercase',
              opacity: oldLabelOpacity, transition: 'opacity 0.1s linear',
            }}>{oldLabel}</div>
            <div style={{
              position: 'absolute', bottom: 14, right: 18, padding: '8px 16px', borderRadius: 999,
              background: 'rgba(213,255,145,0.55)', color: '#1c1c1e', fontSize: 13, fontWeight: 600, letterSpacing: 0.2,
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.35)',
              backdropFilter: 'blur(14px) saturate(160%)', WebkitBackdropFilter: 'blur(14px) saturate(160%)',
              textTransform: 'uppercase',
              opacity: newLabelOpacity, transition: 'opacity 0.1s linear',
            }}>{newLabel}</div>

            <div style={{
              position: 'absolute', left: '50%', bottom: 66, transform: 'translateX(-50%)',
              opacity: hintOpacity, padding: '9px 18px', borderRadius: 22,
              background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 15, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', pointerEvents: 'none',
            }}>
              <span>{'\u2190'}</span><span>Drag to compare</span><span>{'\u2192'}</span>
            </div>
          </div>
        </div>
        <div style={{ width: 90, height: 5, borderRadius: 3, background: '#3a3a3c' }} />
      </div>
    </div>
  );
}
window.CompareScene = CompareScene;
