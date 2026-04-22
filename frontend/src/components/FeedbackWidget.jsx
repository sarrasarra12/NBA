import { useState } from "react"

const smileys = [
  { note: 1, emoji: "😡", label: "Très insatisfait", color: "#E74C3C" },
  { note: 2, emoji: "😕", label: "Insatisfait",      color: "#E67E22" },
  { note: 3, emoji: "😐", label: "Neutre",           color: "#F39C12" },
  { note: 4, emoji: "🙂", label: "Satisfait",        color: "#2ECC71" },
  { note: 5, emoji: "😄", label: "Très satisfait",   color: "#27AE60" },
]

export default function FeedbackWidget() {
  const [open,        setOpen]        = useState(false)
  const [note,        setNote]        = useState(null)
  const [commentaire, setCommentaire] = useState("")
  const [loading,     setLoading]     = useState(false)
  const [submitted,   setSubmitted]   = useState(false)

  const selected = smileys.find(s => s.note === note)

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      setNote(null)
      setCommentaire("")
      setSubmitted(false)
    }, 300)
  }

  const handleSubmit = async () => {
    if (!note) return
    setLoading(true)
    try {
      await fetch("http://localhost:8000/api/feedback", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({ note, commentaire })
      })
      setSubmitted(true)
      setTimeout(handleClose, 2500)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Bouton fixe */}
      <button
        onClick={()=> setOpen(true)}
        style={{
          position      : "fixed",
          right         : "-25px",
          top           : "50%",
          transform     : "translateY(-50%) rotate(-90deg)",
          transformOrigin: "center center",
          background    : "#0A1628",
          color         : "white",
          border        : "none",
          padding       : "10px 20px",
          fontSize      : "13px",
          fontWeight    : "600",
          cursor        : "pointer",
          borderRadius  : "8px 8px 0 0",
          zIndex        : 1000,
          letterSpacing : "0.05em",
          whiteSpace    : "nowrap",
          transition    : "background 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#1a5276"}
        onMouseLeave={e => e.currentTarget.style.background = "#0A1628"}
      >
        ✦ Avis
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={handleClose}
          style={{
            position  : "fixed",
            inset     : 0,
            background: "rgba(0,0,0,0.3)",
            zIndex    : 1001,
            animation : "fadeIn 0.2s ease"
          }}
        />
      )}

      {/* Popup */}
      {open && (
        <div style={{
          position    : "fixed",
          right       : "24px",
          top         : "50%",
          transform   : "translateY(-50%)",
          background  : "white",
          borderRadius: "20px",
          padding     : "28px",
          width       : "320px",
          zIndex      : 1002,
          boxShadow   : "0 24px 64px rgba(0,0,0,0.18)",
          animation   : "slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)"
        }}>

          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <div style={{ background:"#0A1628", borderRadius:"8px", padding:"4px 8px" }}>
                <span style={{ color:"white", fontSize:"14px" }}>✈</span>
              </div>
              <span style={{ fontWeight:"700", fontSize:"15px", color:"#0A1628" }}>
                NouvelAir
              </span>
            </div>
            <button
              onClick={handleClose}
              style={{
                background    : "#f5f5f5",
                border        : "none",
                borderRadius  : "50%",
                width         : "28px",
                height        : "28px",
                cursor        : "pointer",
                fontSize      : "16px",
                color         : "#666",
                display       : "flex",
                alignItems    : "center",
                justifyContent: "center"
              }}
            >×</button>
          </div>

          {submitted ? (
            <div style={{ textAlign:"center", padding:"10px 0 20px" }}>
              <div style={{
                width         : "80px",
                height        : "80px",
                background    : "#2ECC71",
                borderRadius  : "50%",
                display       : "flex",
                alignItems    : "center",
                justifyContent: "center",
                margin        : "0 auto 16px",
                animation     : "popIn 0.5s ease"
              }}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <polyline
                    points         = "8,20 16,28 32,12"
                    fill           = "none"
                    stroke         = "white"
                    strokeWidth    = "4"
                    strokeLinecap  = "round"
                    strokeLinejoin = "round"
                    style          = {{ animation:"drawCheck 0.4s 0.2s ease both" }}
                  />
                </svg>
              </div>
              <p style={{ fontWeight:"700", fontSize:"18px", color:"#0A1628", marginBottom:"8px" }}>
                Merci pour votre avis !
              </p>
              <p style={{ fontSize:"13px", color:"#888", marginBottom:"16px" }}>
                Votre satisfaction est notre priorité.
              </p>
              <span style={{ fontSize:"48px", animation:"bounce 0.6s ease" }}>
                {selected?.emoji}
              </span>
            </div>

          ) : (
            <>
              <p style={{ fontSize:"15px", fontWeight:"600", color:"#0A1628", marginBottom:"6px" }}>
                Comment évaluez-vous notre service ?
              </p>
              <p style={{ fontSize:"12px", color:"#999", marginBottom:"24px" }}>
                Votre avis nous aide à améliorer le service de notre compagnie
              </p>

              {/* Emojis */}
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"12px", padding:"0 4px"}}>
                {smileys.map((item) => (
                  <button
                    key     = {item.note}
                    type    = "button"
                    onClick = {() => setNote(item.note)}
                    style   = {{
                      background : note === item.note ? `${item.color}20` : "transparent",
                      border     : "none",
                      cursor     : "pointer",
                      padding    : "4px",
                      borderRadius: "12px",
                      fontSize   : "35px",
                      lineHeight : 1,
                      transition : "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                      transform  : note === item.note
                        ? "scale(1.4) translateY(-6px)"
                        : "scale(1)",
                      opacity    : note && note !== item.note ? 0.3 : 1,
                      filter     : note === item.note
                        ? `drop-shadow(0 4px 8px ${item.color}88)`
                        : "none",
                    }}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>

              {/* Label */}
              <div style={{ textAlign:"center", height:"24px", marginBottom:"16px" }}>
                {note && (
                  <span style={{
                    fontSize    : "13px",
                    fontWeight  : "700",
                    color       : selected?.color,
                    background  : `${selected?.color}20`,
                    padding     : "3px 12px",
                    borderRadius: "20px",
                    animation   : "fadeInUp 0.2s ease"
                  }}>
                    {selected?.label}
                  </span>
                )}
              </div>

              {/* Commentaire */}
              <textarea
                value       = {commentaire}
                onChange    = {e => setCommentaire(e.target.value)}
                placeholder = "Un commentaire ? (optionnel)"
                rows        = {3}
                style       = {{
                  width        : "100%",
                  border       : "2px solid #f0f0f0",
                  borderRadius : "12px",
                  padding      : "10px 14px",
                  fontSize     : "13px",
                  resize       : "none",
                  outline      : "none",
                  marginBottom : "16px",
                  boxSizing    : "border-box",
                  color        : "#333",
                  transition   : "border 0.2s",
                  fontFamily   : "inherit"
                }}
                onFocus={e => e.target.style.border = "2px solid #0A1628"}
                onBlur ={e => e.target.style.border = "2px solid #f0f0f0"}
              />

              {/* Bouton */}
              <button
                onClick  = {handleSubmit}
                disabled = {!note || loading}
                style    = {{
                  width          : "100%",
                  background     : note ? "#0A1628" : "#f0f0f0",
                  color          : note ? "white"   : "#bbb",
                  border         : "none",
                  borderRadius   : "12px",
                  padding        : "13px",
                  fontSize       : "14px",
                  fontWeight     : "600",
                  cursor         : note ? "pointer" : "not-allowed",
                  transition     : "all 0.2s",
                  display        : "flex",
                  alignItems     : "center",
                  justifyContent : "center",
                  gap            : "8px"
                }}
                onMouseEnter={e => { if(note) e.currentTarget.style.background = "#1a5276" }}
                onMouseLeave={e => { if(note) e.currentTarget.style.background = "#0A1628" }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width       : "14px",
                      height      : "14px",
                      border      : "2px solid white",
                      borderTop   : "2px solid transparent",
                      borderRadius: "50%",
                      display     : "inline-block",
                      animation   : "spin 0.8s linear infinite"
                    }}/>
                    Envoi...
                  </>
                ) : "Envoyer mon avis "}
              </button>
            </>
          )}
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes slideIn   { from{opacity:0;transform:translateY(-50%) translateX(20px)} to{opacity:1;transform:translateY(-50%) translateX(0)} }
        @keyframes fadeInUp  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn     { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes drawCheck { from{stroke-dasharray:60;stroke-dashoffset:60} to{stroke-dasharray:60;stroke-dashoffset:0} }
        @keyframes bounce    { 0%{transform:scale(0.8)} 60%{transform:scale(1.1)} 100%{transform:scale(1)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
      `}</style>
    </>
  )
}