export default function ModelSwitcher({ models, activeId, onSwitch }) {
  return (
    <div style={{
      position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 8, zIndex: 100,
      background: 'rgba(4,14,30,0.85)', border: '1px solid rgba(0,212,255,0.2)',
      borderRadius: 40, padding: '6px 10px',
    }}>
      {models.map((m) => {
        const active = m.id === activeId
        return (
          <button key={m.id} onClick={() => onSwitch(m.id)} title={m.label}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '7px 16px', borderRadius: 30,
              border: active ? '1px solid #00d4ff' : '1px solid rgba(255,255,255,0.1)',
              background: active ? 'rgba(0,212,255,0.15)' : 'transparent',
              color: active ? '#00d4ff' : 'rgba(255,255,255,0.45)',
              cursor: 'pointer', fontSize: 12, fontFamily: 'monospace',
              fontWeight: active ? 700 : 400, transition: 'all 0.2s',
              boxShadow: active ? '0 0 14px rgba(0,212,255,0.25)' : 'none',
            }}>
            <span style={{ fontSize: 16 }}>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}
