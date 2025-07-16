export default function StandalonePage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Standalone Page</h1>
      <p>This page has zero imports from the codebase.</p>
      <button 
        onClick={() => alert('Button clicked!')}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: 'pointer'
        }}
      >
        Click me
      </button>
    </div>
  )
}