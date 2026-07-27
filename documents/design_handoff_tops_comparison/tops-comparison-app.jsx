function TOPSComparisonApp() {
  const [tweaks, setTweak] = window.useTweaks(window.TWEAK_DEFAULTS);
  return React.createElement(React.Fragment, null,
    React.createElement(window.SceneStage, {
      width: 1920, height: 1080, scenes: window.OM_SCENES, bg: '#111', playback: window.OM_PLAYBACK,
    }, { Compare: window.CompareScene }),
    React.createElement(window.TweaksPanel, null,
      React.createElement(window.TweakText, { label: 'Old label', value: tweaks.oldLabel, onChange: v => setTweak('oldLabel', v) }),
      React.createElement(window.TweakText, { label: 'New label', value: tweaks.newLabel, onChange: v => setTweak('newLabel', v) })
    )
  );
}
window.TOPSComparisonApp = TOPSComparisonApp;
