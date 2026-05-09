import { useState, useEffect, useRef } from "react";

const DEMO = [
  { id: "1", nombre: "María González Pérez",  cedula: "12345678", historia: "H-0001", telefono: "0414-1234567" },
  { id: "2", nombre: "Carlos Rodríguez Díaz", cedula: "8765432",  historia: "H-0002", telefono: "0424-7654321" },
  { id: "3", nombre: "Ana Martínez López",    cedula: "",         historia: "H-0003", telefono: "0416-1112222" },
];

function norm(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function buscar(lista, q) {
  if (!q.trim()) return [];
  const t = norm(q);
  return lista.filter(p =>
    norm(p.nombre).includes(t) ||
    (p.cedula || "").includes(t) ||
    norm(p.historia).includes(t)
  );
}

async function stGet(key: string) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
  catch { return null; }
}
async function stSet(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    console.log("stSet OK:", key);
  } catch(e) {
    console.error("stSet ERROR:", e);
  }
}
async function stDel(key: string) {
  try { localStorage.removeItem(key); } catch {}
}

const S = {
  btnPrimario: {
    width: "100%", padding: "13px",
    background: "linear-gradient(135deg,#1565C0,#1E88E5)",
    color: "#fff", border: "none", borderRadius: "11px",
    fontSize: "14px", fontWeight: 700, cursor: "pointer",
    boxShadow: "0 4px 14px rgba(21,101,192,0.28)",
  },
  btnSecundario: {
    flex: 1, padding: "12px", borderRadius: "10px",
    border: "1.5px solid #DCE5F0", background: "#fff",
    cursor: "pointer", fontWeight: 700, color: "#4A6080", fontSize: "14px",
  },
  btnPeligro: {
    flex: 1, padding: "12px", borderRadius: "10px", border: "none",
    background: "#D32F2F", cursor: "pointer", fontWeight: 700, color: "#fff", fontSize: "14px",
  },
  input: {
    width: "100%", boxSizing: "border-box" as const, padding: "10px 13px",
    borderRadius: "9px", border: "1.5px solid #DCE5F0", outline: "none",
    fontSize: "14px", fontFamily: "inherit", color: "#0F2C52", background: "#fff",
  },
  card: {
    background: "#fff", border: "1px solid #DCE5F0",
    borderLeft: "4px solid #1565C0", borderRadius: "12px",
    padding: "13px 15px", display: "flex", alignItems: "center", gap: "12px",
  },
  badge: {
    background: "linear-gradient(135deg,#1565C0,#1E88E5)", color: "#fff",
    borderRadius: "8px", padding: "7px 10px", fontWeight: 800,
    fontSize: "12px", whiteSpace: "nowrap", minWidth: "68px",
    textAlign: "center", flexShrink: 0,
  },
};

export default function App() {
  const [pacientes, setPacientes]   = useState(DEMO);
  const [listo, setListo]           = useState(false);
  const [vista, setVista]           = useState("buscar");
  const [editando, setEditando]     = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [rxPaciente, setRxPaciente] = useState(null);

  useEffect(() => {
    (async () => {
      const datos = await stGet("carosi-pacientes");
      if (datos) setPacientes(datos);
      setListo(true);
    })();
  }, []);

  async function guardarPacientes(lista) {
    console.log("guardarPacientes llamado", lista.length);
    setPacientes(lista);
    await stSet("carosi-pacientes", lista);
  }

  async function eliminar(id) {
    await guardarPacientes(pacientes.filter(p => p.id !== id));
    setEliminando(null);
  }

  async function actualizar(p) {
    await guardarPacientes(pacientes.map(x => x.id === p.id ? p : x));
    setEditando(null);
  }

  const tabs = [
    { id: "buscar",  label: "🔍 Buscar" },
    { id: "agregar", label: "➕ Agregar" },
    { id: "todos",   label: `📋 Todos (${pacientes.length})` },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F0F5FB", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #DCE5F0", padding: "0 20px", height: "58px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", position: "sticky", top: 0, zIndex: 90 }}>
        <span style={{ fontSize: "22px" }}>🦷</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: "13px", color: "#0F2C52", lineHeight: 1.1 }}>Dr. Dayana Carosi</div>
          <div style={{ fontSize: "10px", color: "#90A4BE" }}>Historias Clínicas</div>
        </div>
        <div style={{ display: "flex", gap: "3px" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setVista(t.id)} style={{
              padding: "6px 12px", borderRadius: "7px", border: "none", cursor: "pointer",
              fontSize: "12px", fontWeight: 700,
              background: vista === t.id ? "#1565C0" : "transparent",
              color: vista === t.id ? "#fff" : "#90A4BE",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 14px" }}>
        {!listo
          ? <div style={{ textAlign: "center", color: "#90A4BE", paddingTop: "60px" }}>Cargando...</div>
          : vista === "buscar"  ? <Buscar  pacientes={pacientes} onEditar={setEditando} onEliminar={setEliminando} onRx={setRxPaciente} />
          : vista === "agregar" ? <Agregar pacientes={pacientes} guardar={guardarPacientes} />
          :                       <Todos   pacientes={pacientes} onEditar={setEditando}  onEliminar={setEliminando} onRx={setRxPaciente} />
        }
      </div>

      {editando   && <ModalEditar  paciente={editando}   pacientes={pacientes} onGuardar={actualizar} onCerrar={() => setEditando(null)} />}
      {eliminando && <ModalConfirm onCerrar={() => setEliminando(null)} onConfirmar={() => eliminar(eliminando)} />}
      {rxPaciente && <PanelRx     paciente={pacientes.find(p => p.id === rxPaciente)} onCerrar={() => setRxPaciente(null)} />}
    </div>
  );
}

function Buscar({ pacientes, onEditar, onEliminar, onRx }) {
  const [q, setQ] = useState("");
  const ref = useRef();
  useEffect(() => { ref.current?.focus(); }, []);
  const resultados = buscar(pacientes, q);
  const activo = q.trim().length > 0;
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "22px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0F2C52", marginBottom: "4px" }}>Buscar Historia</h2>
        <p style={{ color: "#90A4BE", fontSize: "13px" }}>Nombre, cédula o número de historia</p>
      </div>
      <div style={{ background: "#fff", border: `2px solid ${activo ? "#1565C0" : "#DCE5F0"}`, borderRadius: "14px", display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", marginBottom: "18px", boxShadow: activo ? "0 0 0 4px #1565C015" : "none", transition: "all 0.2s" }}>
        <span style={{ fontSize: "18px" }}>🔍</span>
        <input ref={ref} value={q} onChange={e => setQ(e.target.value)}
          placeholder="Escribe nombre, cédula o número de historia..."
          style={{ flex: 1, border: "none", outline: "none", fontSize: "15px", fontFamily: "inherit", color: "#0F2C52", background: "transparent" }} />
        {q && <button onClick={() => setQ("")} style={{ border: "none", background: "#F0F5FB", borderRadius: "6px", padding: "4px 9px", cursor: "pointer", color: "#90A4BE", fontSize: "12px" }}>✕</button>}
      </div>
      {activo && resultados.length === 0 && (
        <div style={{ background: "#fff", border: "1px solid #DCE5F0", borderRadius: "14px", padding: "36px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔎</div>
          <div style={{ fontWeight: 700, color: "#0F2C52", marginBottom: "6px" }}>No se encontró «{q}»</div>
          <div style={{ color: "#90A4BE", fontSize: "13px" }}>Verifica el dato o regístralo como nuevo paciente.</div>
        </div>
      )}
      {activo && resultados.length > 0 && (
        <div>
          <div style={{ fontSize: "12px", color: "#90A4BE", marginBottom: "10px" }}>{resultados.length} resultado{resultados.length !== 1 ? "s" : ""}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {resultados.map(p => <Tarjeta key={p.id} p={p} onEditar={onEditar} onEliminar={onEliminar} onRx={onRx} />)}
          </div>
        </div>
      )}
      {!activo && (
        <div style={{ textAlign: "center", paddingTop: "52px", color: "#C8D6E5" }}>
          <div style={{ fontSize: "50px", marginBottom: "10px" }}>📁</div>
          <div style={{ fontSize: "14px", fontWeight: 600 }}>{pacientes.length} historias registradas</div>
        </div>
      )}
    </div>
  );
}

function Agregar({ pacientes, guardar }) {
  const vacio = { nombre: "", cedula: "", historia: "", telefono: "" };
  const [form, setForm] = useState(vacio);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  async function guardarPaciente() {
  console.log("guardarPaciente llamado");
    setError("");
    if (!form.nombre.trim())   return setError("El nombre es obligatorio.");
    if (!form.historia.trim()) return setError("El número de historia es obligatorio.");
    if (form.cedula.trim() && pacientes.find(p => p.cedula === form.cedula.trim()))
      return setError("Ya existe un paciente con esa cédula.");
    await guardar([...pacientes, { id: Date.now().toString(), nombre: form.nombre.trim(), cedula: form.cedula.trim(), historia: form.historia.trim(), telefono: form.telefono.trim() }]);
    setForm(vacio);
    setOk(true);
    setTimeout(() => setOk(false), 3000);
  }
  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0F2C52", marginBottom: "4px" }}>Registrar Paciente</h2>
      <p style={{ color: "#90A4BE", fontSize: "13px", marginBottom: "22px" }}>Los campos con * son obligatorios.</p>
      {ok && <Alerta tipo="ok">✅ Paciente registrado correctamente.</Alerta>}
      <div style={{ background: "#fff", border: "1px solid #DCE5F0", borderRadius: "16px", padding: "26px" }}>
        <CamposForm form={form} setForm={setForm} />
        {error && <Alerta tipo="err">⚠️ {error}</Alerta>}
        <button onClick={guardarPaciente} style={S.btnPrimario}>Guardar Paciente</button>
      </div>
    </div>
  );
}

function Todos({ pacientes, onEditar, onEliminar, onRx }) {
  const [filtro, setFiltro] = useState("");
  const lista = filtro.trim()
    ? buscar(pacientes, filtro)
    : [...pacientes].sort((a, b) => a.nombre.localeCompare(b.nombre));
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0F2C52", flex: 1 }}>Todos los Pacientes</h2>
        <span style={{ background: "#E3F0FF", color: "#1565C0", fontWeight: 700, fontSize: "12px", padding: "4px 12px", borderRadius: "20px" }}>{pacientes.length} historias</span>
      </div>
      <input value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="Filtrar..."
        style={{ ...S.input, marginBottom: "12px" }}
        onFocus={e => e.target.style.borderColor = "#1565C0"}
        onBlur={e => e.target.style.borderColor = "#DCE5F0"} />
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {lista.map(p => <Tarjeta key={p.id} p={p} onEditar={onEditar} onEliminar={onEliminar} onRx={onRx} />)}
      </div>
    </div>
  );
}

function Tarjeta({ p, onEditar, onEliminar, onRx }) {
  return (
    <div style={S.card}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 14px rgba(21,101,192,0.10)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
      <div style={S.badge}>📁 {p.historia}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, color: "#0F2C52", fontSize: "14px", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nombre}</div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {p.cedula   && <span style={{ fontSize: "11px", color: "#90A4BE" }}>🪪 {p.cedula}</span>}
          {p.telefono && <span style={{ fontSize: "11px", color: "#90A4BE" }}>📱 {p.telefono}</span>}
        </div>
      </div>
      <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
        <BtnIco onClick={() => onRx(p.id)}      bg="#E3F0FF" bgH="#BBDEFB" color="#1565C0" title="Radiografías">🩻</BtnIco>
        <BtnIco onClick={() => onEditar(p)}      bg="#FFF3E0" bgH="#FFE0B2" color="#E65100" title="Editar">✏️</BtnIco>
        <BtnIco onClick={() => onEliminar(p.id)} bg="#FFF3F3" bgH="#FFCDD2" color="#D32F2F" title="Eliminar">🗑️</BtnIco>
      </div>
    </div>
  );
}

function ModalEditar({ paciente, pacientes, onGuardar, onCerrar }) {
  const [form, setForm] = useState({ ...paciente });
  const [error, setError] = useState("");
  async function guardar() {
    setError("");
    if (!form.nombre.trim())   return setError("El nombre es obligatorio.");
    if (!form.historia.trim()) return setError("El número de historia es obligatorio.");
    if (form.cedula.trim() && pacientes.find(p => p.cedula === form.cedula.trim() && p.id !== form.id))
      return setError("Esa cédula ya pertenece a otro paciente.");
    onGuardar({ ...form, nombre: form.nombre.trim(), cedula: form.cedula.trim(), historia: form.historia.trim(), telefono: form.telefono.trim() });
  }
  return (
    <Overlay onCerrar={onCerrar}>
      <div style={{ fontWeight: 800, fontSize: "17px", color: "#0F2C52", marginBottom: "4px" }}>Editar Paciente</div>
      <div style={{ color: "#90A4BE", fontSize: "12px", marginBottom: "20px" }}>Historia: {paciente.historia}</div>
      <CamposForm form={form} setForm={setForm} />
      {error && <Alerta tipo="err">⚠️ {error}</Alerta>}
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={onCerrar} style={S.btnSecundario}>Cancelar</button>
        <button onClick={guardar}  style={S.btnPrimario}>Guardar cambios</button>
      </div>
    </Overlay>
  );
}

function ModalConfirm({ onCerrar, onConfirmar }) {
  return (
    <Overlay onCerrar={onCerrar}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "38px", marginBottom: "12px" }}>⚠️</div>
        <div style={{ fontWeight: 800, fontSize: "16px", color: "#0F2C52", marginBottom: "8px" }}>¿Eliminar paciente?</div>
        <div style={{ color: "#90A4BE", fontSize: "13px", marginBottom: "24px" }}>Esta acción no se puede deshacer.</div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onCerrar}    style={S.btnSecundario}>Cancelar</button>
          <button onClick={onConfirmar} style={S.btnPeligro}>Eliminar</button>
        </div>
      </div>
    </Overlay>
  );
}

function PanelRx({ paciente, onCerrar }) {
  const [fotos, setFotos]       = useState([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [visor, setVisor]       = useState(null);
  const fileRef = useRef();
  const idxKey = `carosi-idx-${paciente.id}`;

  useEffect(() => {
    (async () => {
      const ids = await stGet(idxKey);
      if (Array.isArray(ids)) {
        const lista = [];
        for (const id of ids) {
          const foto = await stGet(`carosi-foto-${id}`);
          if (foto) lista.push(foto);
        }
        setFotos(lista);
      }
      setCargando(false);
    })();
  }, [paciente.id]);

  function leerComoBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = e => resolve(e.target.result);
      reader.onerror = () => reject(new Error("Error leyendo archivo"));
      reader.readAsDataURL(file);
    });
  }

  async function agregarFoto(file) {
    setSubiendo(true);
    try {
      const data = await leerComoBase64(file);
      const id   = Date.now().toString();
      const foto = { id, nombre: file.name, fecha: new Date().toLocaleDateString("es-VE"), data };
      await stSet(`carosi-foto-${id}`, foto);
      const nuevaLista = [...fotos, foto];
      await stSet(idxKey, nuevaLista.map(f => f.id));
      setFotos(nuevaLista);
    } catch (e) {
      alert("No se pudo guardar la imagen: " + e.message);
    }
    setSubiendo(false);
  }

  async function eliminarFoto(id) {
    await stDel(`carosi-foto-${id}`);
    const nuevaLista = fotos.filter(f => f.id !== id);
    await stSet(idxKey, nuevaLista.map(f => f.id));
    setFotos(nuevaLista);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "16px" }}>
      <div style={{ background: "#fff", borderRadius: "18px", width: "100%", maxWidth: "580px", maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #DCE5F0", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: "15px", color: "#0F2C52" }}>🩻 Radiografías</div>
            <div style={{ fontSize: "12px", color: "#90A4BE" }}>{paciente.nombre} · {paciente.historia}</div>
          </div>
          <button onClick={onCerrar} style={{ border: "none", background: "#F0F5FB", borderRadius: "8px", padding: "7px 12px", cursor: "pointer", color: "#4A6080", fontWeight: 700, fontSize: "13px" }}>✕ Cerrar</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>
          {cargando && <div style={{ textAlign: "center", color: "#90A4BE" }}>Cargando...</div>}
          {!cargando && fotos.length === 0 && (
            <div style={{ textAlign: "center", paddingTop: "30px", color: "#C8D6E5" }}>
              <div style={{ fontSize: "44px", marginBottom: "10px" }}>🩻</div>
              <div style={{ fontWeight: 600, fontSize: "14px" }}>Sin radiografías aún</div>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>Agrega la primera imagen abajo.</div>
            </div>
          )}
          {!cargando && fotos.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "12px" }}>
              {fotos.map(f => (
                <div key={f.id} style={{ background: "#F0F5FB", borderRadius: "12px", overflow: "hidden", border: "1px solid #DCE5F0" }}>
                  <div style={{ cursor: "pointer" }} onClick={() => setVisor(f)}>
                    <img src={f.data} alt={f.nombre} style={{ width: "100%", height: "140px", objectFit: "cover", display: "block" }} />
                  </div>
                  <div style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#0F2C52", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.nombre}</div>
                      <div style={{ fontSize: "10px", color: "#90A4BE" }}>{f.fecha}</div>
                    </div>
                    <BtnIco onClick={() => setVisor(f)}        bg="#E3F0FF" bgH="#BBDEFB" color="#1565C0" title="Ver">🔍</BtnIco>
                    <BtnIco onClick={() => eliminarFoto(f.id)} bg="#FFF3F3" bgH="#FFCDD2" color="#D32F2F" title="Eliminar">🗑️</BtnIco>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: "14px 22px", borderTop: "1px solid #DCE5F0", flexShrink: 0 }}>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }}
            onChange={async e => {
              const archivos = Array.from(e.target.files);
              e.target.value = "";
              for (const f of archivos) await agregarFoto(f);
            }} />
          <button onClick={() => fileRef.current?.click()} disabled={subiendo}
            style={{ ...S.btnPrimario, opacity: subiendo ? 0.7 : 1, cursor: subiendo ? "not-allowed" : "pointer" }}>
            {subiendo ? "⏳ Subiendo imagen..." : "📎 Agregar radiografía / imagen"}
          </button>
        </div>
      </div>

      {visor && (
        <div onClick={() => setVisor(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <img src={visor.data} alt={visor.nombre} style={{ maxWidth: "95vw", maxHeight: "90vh", objectFit: "contain", borderRadius: "8px" }} />
          <button onClick={() => setVisor(null)} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontWeight: 700, fontSize: "14px" }}>✕ Cerrar</button>
        </div>
      )}
    </div>
  );
}

function CamposForm({ form, setForm }) {
  const upd = key => e => setForm(f => ({ ...f, [key]: e.target.value }));
  const campos = [
    { label: "Nombre completo",          key: "nombre",   req: true,  ph: "Ej: María González Pérez" },
    { label: "Nº de historia / carpeta", key: "historia", req: true,  ph: "Ej: H-0006" },
    { label: "Cédula de identidad",      key: "cedula",   req: false, ph: "Opcional" },
    { label: "Teléfono",                 key: "telefono", req: false, ph: "Opcional" },
  ];
  return (
    <>
      {campos.map(c => (
        <div key={c.key} style={{ marginBottom: "15px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "#4A6080", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>
            {c.label} {c.req && <span style={{ color: "#D32F2F" }}>*</span>}
          </label>
          <input value={form[c.key]} onChange={upd(c.key)} placeholder={c.ph}
            style={S.input}
            onFocus={e => e.target.style.borderColor = "#1565C0"}
            onBlur={e => e.target.style.borderColor = "#DCE5F0"} />
        </div>
      ))}
    </>
  );
}

function Overlay({ onCerrar, children }: { onCerrar: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "16px" }}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", maxWidth: "420px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}

function Alerta({ tipo, children }: { tipo: string; children: React.ReactNode }) {
  const color = tipo === "ok"
    ? { background: "#E8F5E9", border: "1px solid #A5D6A7", color: "#2E7D32" }
    : { background: "#FFEBEE", border: "1px solid #FFCDD2", color: "#C62828" };
  return <div style={{ ...color, borderRadius: "10px", padding: "11px 15px", fontSize: "13px", marginBottom: "14px" }}>{children}</div>;
}

function BtnIco({ children, onClick, title, bg, bgH, color }: { children: React.ReactNode; onClick: () => void; title: string; bg: string; bgH: string; color: string }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} title={title}
      style={{ border: "none", background: h ? bgH : bg, borderRadius: "7px", padding: "7px 8px", cursor: "pointer", fontSize: "14px", color, transition: "background 0.15s" }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>
      {children}
    </button>
  );
}