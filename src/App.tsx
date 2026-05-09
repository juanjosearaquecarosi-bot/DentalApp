import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

// ── Auth ──────────────────────────────────────────────────────────────
function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [modo, setModo]   = useState<"login"|"registro">("login");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function entrar() {
    setCargando(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) setError(error.message);
    setCargando(false);
  }

  async function registrar() {
    setCargando(true); setError("");
    const { error } = await supabase.auth.signUp({ email, password: pass });
    if (error) setError(error.message);
    else setError("Revisa tu correo para confirmar el registro.");
    setCargando(false);
  }

  return (
    <div style={{ minHeight:"100vh", background:"#F0F5FB", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',sans-serif" }}>
      <div style={{ background:"#fff", borderRadius:"18px", padding:"36px", width:"100%", maxWidth:"380px", boxShadow:"0 8px 32px rgba(0,0,0,0.10)" }}>
        <div style={{ textAlign:"center", marginBottom:"28px" }}>
          <div style={{ fontSize:"36px" }}>🦷</div>
          <div style={{ fontWeight:800, fontSize:"20px", color:"#0F2C52" }}>Dr. Dayana Carosi</div>
          <div style={{ color:"#90A4BE", fontSize:"13px" }}>Historias Clínicas</div>
        </div>
        <div style={{ marginBottom:"14px" }}>
          <label style={{ fontSize:"11px", fontWeight:700, color:"#4A6080", textTransform:"uppercase", display:"block", marginBottom:"5px" }}>Correo</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="correo@ejemplo.com"
            style={{ width:"100%", boxSizing:"border-box" as const, padding:"10px 13px", borderRadius:"9px", border:"1.5px solid #DCE5F0", fontSize:"14px", outline:"none" }} />
        </div>
        <div style={{ marginBottom:"20px" }}>
          <label style={{ fontSize:"11px", fontWeight:700, color:"#4A6080", textTransform:"uppercase", display:"block", marginBottom:"5px" }}>Contraseña</label>
          <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="••••••••"
            style={{ width:"100%", boxSizing:"border-box" as const, padding:"10px 13px", borderRadius:"9px", border:"1.5px solid #DCE5F0", fontSize:"14px", outline:"none" }} />
        </div>
        {error && <div style={{ background:"#FFEBEE", border:"1px solid #FFCDD2", color:"#C62828", borderRadius:"10px", padding:"10px 14px", fontSize:"13px", marginBottom:"14px" }}>{error}</div>}
        <button onClick={modo==="login"?entrar:registrar} disabled={cargando}
          style={{ width:"100%", padding:"13px", background:"linear-gradient(135deg,#1565C0,#1E88E5)", color:"#fff", border:"none", borderRadius:"11px", fontSize:"14px", fontWeight:700, cursor:"pointer", marginBottom:"12px" }}>
          {cargando ? "..." : modo==="login" ? "Iniciar sesión" : "Registrarse"}
        </button>
        <button onClick={()=>setModo(m=>m==="login"?"registro":"login")}
          style={{ width:"100%", padding:"10px", background:"transparent", border:"none", color:"#1565C0", fontSize:"13px", cursor:"pointer", fontWeight:600 }}>
          {modo==="login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </div>
  );
}

// ── Helpers Supabase ──────────────────────────────────────────────────
async function cargarPacientes(userId: string) {
  const { data } = await supabase.from("pacientes").select("*").eq("user_id", userId).order("nombre");
  return data || [];
}
async function insertarPaciente(p: Record<string,string>, userId: string) {
  await supabase.from("pacientes").insert({ ...p, user_id: userId });
}
async function actualizarPaciente(p: Record<string,string>) {
  await supabase.from("pacientes").update(p).eq("id", p.id);
}
async function eliminarPaciente(id: string) {
  await supabase.from("pacientes").delete().eq("id", id);
}
async function cargarFotos(pacienteId: string) {
  const { data } = await supabase.from("fotos").select("*").eq("paciente_id", pacienteId);
  return data || [];
}
async function insertarFoto(foto: Record<string,string>, userId: string) {
  await supabase.from("fotos").insert({ ...foto, user_id: userId });
}
async function eliminarFoto(id: string) {
  await supabase.from("fotos").delete().eq("id", id);
}

// ── Estilos ───────────────────────────────────────────────────────────
const S = {
  btnPrimario: { width:"100%", padding:"13px", background:"linear-gradient(135deg,#1565C0,#1E88E5)", color:"#fff", border:"none", borderRadius:"11px", fontSize:"14px", fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(21,101,192,0.28)" } as const,
  btnSecundario: { flex:1, padding:"12px", borderRadius:"10px", border:"1.5px solid #DCE5F0", background:"#fff", cursor:"pointer", fontWeight:700, color:"#4A6080", fontSize:"14px" } as const,
  btnPeligro: { flex:1, padding:"12px", borderRadius:"10px", border:"none", background:"#D32F2F", cursor:"pointer", fontWeight:700, color:"#fff", fontSize:"14px" } as const,
  input: { width:"100%", boxSizing:"border-box" as const, padding:"10px 13px", borderRadius:"9px", border:"1.5px solid #DCE5F0", outline:"none", fontSize:"14px", fontFamily:"inherit", color:"#0F2C52", background:"#fff" },
  card: { background:"#fff", border:"1px solid #DCE5F0", borderLeft:"4px solid #1565C0", borderRadius:"12px", padding:"13px 15px", display:"flex", alignItems:"center", gap:"12px" } as const,
  badge: { background:"linear-gradient(135deg,#1565C0,#1E88E5)", color:"#fff", borderRadius:"8px", padding:"7px 10px", fontWeight:800, fontSize:"12px", whiteSpace:"nowrap" as const, minWidth:"68px", textAlign:"center" as const, flexShrink:0 },
};

function norm(s: string) {
  return (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
}
function buscar(lista: Record<string,string>[], q: string) {
  if (!q.trim()) return [];
  const t = norm(q);
  return lista.filter(p => norm(p.nombre).includes(t) || (p.cedula||"").includes(t) || norm(p.historia).includes(t));
}

// ── App principal ─────────────────────────────────────────────────────
export default function App() {
  const [session, setSession]       = useState<any>(null);
  const [pacientes, setPacientes]   = useState<any[]>([]);
  const [listo, setListo]           = useState(false);
  const [vista, setVista]           = useState("buscar");
  const [editando, setEditando]     = useState<any>(null);
  const [eliminando, setEliminando] = useState<string|null>(null);
  const [rxPaciente, setRxPaciente] = useState<string|null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_e, s) => setSession(s));
  }, []);

  useEffect(() => {
    if (!session) { setListo(false); return; }
    cargarPacientes(session.user.id).then(d => { setPacientes(d); setListo(true); });
  }, [session]);

  if (!session) return <Login />;

  async function guardarNuevo(p: Record<string,string>) {
    await insertarPaciente(p, session.user.id);
    setPacientes(await cargarPacientes(session.user.id));
  }
  async function actualizar(p: Record<string,string>) {
    await actualizarPaciente(p);
    setPacientes(await cargarPacientes(session.user.id));
    setEditando(null);
  }
  async function eliminar(id: string) {
    await eliminarPaciente(id);
    setPacientes(await cargarPacientes(session.user.id));
    setEliminando(null);
  }

  const tabs = [
    { id:"buscar",  label:"🔍 Buscar" },
    { id:"agregar", label:"➕ Agregar" },
    { id:"todos",   label:`📋 Todos (${pacientes.length})` },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#F0F5FB", fontFamily:"'Segoe UI',sans-serif" }}>
      <div style={{ background:"#fff", borderBottom:"1px solid #DCE5F0", padding:"0 20px", height:"58px", display:"flex", alignItems:"center", gap:"12px", boxShadow:"0 1px 6px rgba(0,0,0,0.07)", position:"sticky", top:0, zIndex:90 }}>
        <span style={{ fontSize:"22px" }}>🦷</span>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:800, fontSize:"13px", color:"#0F2C52", lineHeight:1.1 }}>Dr. Dayana Carosi</div>
          <div style={{ fontSize:"10px", color:"#90A4BE" }}>Historias Clínicas</div>
        </div>
        <div style={{ display:"flex", gap:"3px" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setVista(t.id)} style={{ padding:"6px 12px", borderRadius:"7px", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:700, background:vista===t.id?"#1565C0":"transparent", color:vista===t.id?"#fff":"#90A4BE" }}>{t.label}</button>
          ))}
        </div>
        <button onClick={() => supabase.auth.signOut()} style={{ border:"none", background:"#F0F5FB", borderRadius:"8px", padding:"6px 12px", cursor:"pointer", color:"#90A4BE", fontSize:"12px", fontWeight:600 }}>Salir</button>
      </div>

      <div style={{ maxWidth:640, margin:"0 auto", padding:"28px 14px" }}>
        {!listo
          ? <div style={{ textAlign:"center", color:"#90A4BE", paddingTop:"60px" }}>Cargando...</div>
          : vista==="buscar"  ? <Buscar  pacientes={pacientes} onEditar={setEditando} onEliminar={setEliminando} onRx={setRxPaciente} />
          : vista==="agregar" ? <Agregar guardar={guardarNuevo} />
          :                     <Todos   pacientes={pacientes} onEditar={setEditando} onEliminar={setEliminando} onRx={setRxPaciente} />
        }
      </div>

      {editando   && <ModalEditar  paciente={editando} pacientes={pacientes} onGuardar={actualizar} onCerrar={() => setEditando(null)} />}
      {eliminando && <ModalConfirm onCerrar={() => setEliminando(null)} onConfirmar={() => eliminar(eliminando)} />}
      {rxPaciente && <PanelRx paciente={pacientes.find((p:any) => p.id === rxPaciente)} onCerrar={() => setRxPaciente(null)} userId={session.user.id} />}
    </div>
  );
}

function Buscar({ pacientes, onEditar, onEliminar, onRx }: { pacientes:any[], onEditar:any, onEliminar:any, onRx:any }) {
  const [q, setQ] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const resultados = buscar(pacientes, q);
  const activo = q.trim().length > 0;
  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:"22px" }}>
        <h2 style={{ fontSize:"22px", fontWeight:800, color:"#0F2C52", marginBottom:"4px" }}>Buscar Historia</h2>
        <p style={{ color:"#90A4BE", fontSize:"13px" }}>Nombre, cédula o número de historia</p>
      </div>
      <div style={{ background:"#fff", border:`2px solid ${activo?"#1565C0":"#DCE5F0"}`, borderRadius:"14px", display:"flex", alignItems:"center", gap:"10px", padding:"12px 16px", marginBottom:"18px", transition:"all 0.2s" }}>
        <span style={{ fontSize:"18px" }}>🔍</span>
        <input ref={ref} value={q} onChange={e=>setQ(e.target.value)} placeholder="Escribe nombre, cédula o número de historia..."
          style={{ flex:1, border:"none", outline:"none", fontSize:"15px", fontFamily:"inherit", color:"#0F2C52", background:"transparent" }} />
        {q && <button onClick={()=>setQ("")} style={{ border:"none", background:"#F0F5FB", borderRadius:"6px", padding:"4px 9px", cursor:"pointer", color:"#90A4BE", fontSize:"12px" }}>✕</button>}
      </div>
      {activo && resultados.length===0 && (
        <div style={{ background:"#fff", border:"1px solid #DCE5F0", borderRadius:"14px", padding:"36px", textAlign:"center" }}>
          <div style={{ fontSize:"36px", marginBottom:"10px" }}>🔎</div>
          <div style={{ fontWeight:700, color:"#0F2C52", marginBottom:"6px" }}>No se encontró «{q}»</div>
          <div style={{ color:"#90A4BE", fontSize:"13px" }}>Verifica el dato o regístralo como nuevo paciente.</div>
        </div>
      )}
      {activo && resultados.length>0 && (
        <div>
          <div style={{ fontSize:"12px", color:"#90A4BE", marginBottom:"10px" }}>{resultados.length} resultado{resultados.length!==1?"s":""}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
            {resultados.map((p:any) => <Tarjeta key={p.id} p={p} onEditar={onEditar} onEliminar={onEliminar} onRx={onRx} />)}
          </div>
        </div>
      )}
      {!activo && (
        <div style={{ textAlign:"center", paddingTop:"52px", color:"#C8D6E5" }}>
          <div style={{ fontSize:"50px", marginBottom:"10px" }}>📁</div>
          <div style={{ fontSize:"14px", fontWeight:600 }}>{pacientes.length} historias registradas</div>
        </div>
      )}
    </div>
  );
}

function Agregar({ guardar }: { guardar: (p:Record<string,string>)=>Promise<void> }) {
  const vacio = { nombre:"", cedula:"", historia:"", telefono:"" };
  const [form, setForm] = useState(vacio);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [cargando, setCargando] = useState(false);
  async function guardarPaciente() {
    setError("");
    if (!form.nombre.trim())   return setError("El nombre es obligatorio.");
    if (!form.historia.trim()) return setError("El número de historia es obligatorio.");
    setCargando(true);
    await guardar({ id: Date.now().toString(), nombre:form.nombre.trim(), cedula:form.cedula.trim(), historia:form.historia.trim(), telefono:form.telefono.trim() });
    setForm(vacio); setOk(true); setCargando(false);
    setTimeout(() => setOk(false), 3000);
  }
  return (
    <div>
      <h2 style={{ fontSize:"20px", fontWeight:800, color:"#0F2C52", marginBottom:"4px" }}>Registrar Paciente</h2>
      <p style={{ color:"#90A4BE", fontSize:"13px", marginBottom:"22px" }}>Los campos con * son obligatorios.</p>
      {ok && <Alerta tipo="ok">✅ Paciente registrado correctamente.</Alerta>}
      <div style={{ background:"#fff", border:"1px solid #DCE5F0", borderRadius:"16px", padding:"26px" }}>
        <CamposForm form={form} setForm={setForm} />
        {error && <Alerta tipo="err">⚠️ {error}</Alerta>}
        <button onClick={guardarPaciente} disabled={cargando} style={S.btnPrimario}>{cargando?"Guardando...":"Guardar Paciente"}</button>
      </div>
    </div>
  );
}

function Todos({ pacientes, onEditar, onEliminar, onRx }: { pacientes:any[], onEditar:any, onEliminar:any, onRx:any }) {
  const [filtro, setFiltro] = useState("");
  const lista = filtro.trim() ? buscar(pacientes, filtro) : [...pacientes];
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
        <h2 style={{ fontSize:"20px", fontWeight:800, color:"#0F2C52", flex:1 }}>Todos los Pacientes</h2>
        <span style={{ background:"#E3F0FF", color:"#1565C0", fontWeight:700, fontSize:"12px", padding:"4px 12px", borderRadius:"20px" }}>{pacientes.length} historias</span>
      </div>
      <input value={filtro} onChange={e=>setFiltro(e.target.value)} placeholder="Filtrar..."
        style={{ ...S.input, marginBottom:"12px" }}
        onFocus={e=>e.target.style.borderColor="#1565C0"}
        onBlur={e=>e.target.style.borderColor="#DCE5F0"} />
      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
        {lista.map((p:any) => <Tarjeta key={p.id} p={p} onEditar={onEditar} onEliminar={onEliminar} onRx={onRx} />)}
      </div>
    </div>
  );
}

function Tarjeta({ p, onEditar, onEliminar, onRx }: { p:any, onEditar:any, onEliminar:any, onRx:any }) {
  return (
    <div style={S.card}
      onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="0 4px 14px rgba(21,101,192,0.10)"}
      onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.boxShadow="none"}>
      <div style={S.badge}>📁 {p.historia}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, color:"#0F2C52", fontSize:"14px", marginBottom:"2px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.nombre}</div>
        <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
          {p.cedula   && <span style={{ fontSize:"11px", color:"#90A4BE" }}>🪪 {p.cedula}</span>}
          {p.telefono && <span style={{ fontSize:"11px", color:"#90A4BE" }}>📱 {p.telefono}</span>}
        </div>
      </div>
      <div style={{ display:"flex", gap:"5px", flexShrink:0 }}>
        <BtnIco onClick={()=>onRx(p.id)}      bg="#E3F0FF" bgH="#BBDEFB" color="#1565C0" title="Radiografías">🩻</BtnIco>
        <BtnIco onClick={()=>onEditar(p)}      bg="#FFF3E0" bgH="#FFE0B2" color="#E65100" title="Editar">✏️</BtnIco>
        <BtnIco onClick={()=>onEliminar(p.id)} bg="#FFF3F3" bgH="#FFCDD2" color="#D32F2F" title="Eliminar">🗑️</BtnIco>
      </div>
    </div>
  );
}

function ModalEditar({ paciente, pacientes, onGuardar, onCerrar }: { paciente:any, pacientes:any[], onGuardar:any, onCerrar:any }) {
  const [form, setForm] = useState({ ...paciente });
  const [error, setError] = useState("");
  async function guardar() {
    if (!form.nombre.trim())   return setError("El nombre es obligatorio.");
    if (!form.historia.trim()) return setError("El número de historia es obligatorio.");
    if (form.cedula.trim() && pacientes.find((p:any) => p.cedula===form.cedula.trim() && p.id!==form.id))
      return setError("Esa cédula ya pertenece a otro paciente.");
    onGuardar({ ...form, nombre:form.nombre.trim(), cedula:form.cedula.trim(), historia:form.historia.trim(), telefono:form.telefono.trim() });
  }
  return (
    <Overlay onCerrar={onCerrar}>
      <div style={{ fontWeight:800, fontSize:"17px", color:"#0F2C52", marginBottom:"4px" }}>Editar Paciente</div>
      <div style={{ color:"#90A4BE", fontSize:"12px", marginBottom:"20px" }}>Historia: {paciente.historia}</div>
      <CamposForm form={form} setForm={setForm} />
      {error && <Alerta tipo="err">⚠️ {error}</Alerta>}
      <div style={{ display:"flex", gap:"10px" }}>
        <button onClick={onCerrar} style={S.btnSecundario}>Cancelar</button>
        <button onClick={guardar}  style={S.btnPrimario}>Guardar cambios</button>
      </div>
    </Overlay>
  );
}

function ModalConfirm({ onCerrar, onConfirmar }: { onCerrar:()=>void, onConfirmar:()=>void }) {
  return (
    <Overlay onCerrar={onCerrar}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"38px", marginBottom:"12px" }}>⚠️</div>
        <div style={{ fontWeight:800, fontSize:"16px", color:"#0F2C52", marginBottom:"8px" }}>¿Eliminar paciente?</div>
        <div style={{ color:"#90A4BE", fontSize:"13px", marginBottom:"24px" }}>Esta acción no se puede deshacer.</div>
        <div style={{ display:"flex", gap:"10px" }}>
          <button onClick={onCerrar}    style={S.btnSecundario}>Cancelar</button>
          <button onClick={onConfirmar} style={S.btnPeligro}>Eliminar</button>
        </div>
      </div>
    </Overlay>
  );
}

function PanelRx({ paciente, onCerrar, userId }: { paciente:any, onCerrar:()=>void, userId:string }) {
  const [fotos, setFotos]       = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [visor, setVisor]       = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    cargarFotos(paciente.id).then(f => { setFotos(f); setCargando(false); });
  }, [paciente.id]);

  function leerComoBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = e => resolve(e.target!.result as string);
      reader.onerror = () => reject(new Error("Error leyendo archivo"));
      reader.readAsDataURL(file);
    });
  }

  async function agregarFoto(file: File) {
    setSubiendo(true);
    try {
      const data = await leerComoBase64(file);
      const foto = { id: Date.now().toString(), paciente_id: paciente.id, nombre: file.name, fecha: new Date().toLocaleDateString("es-VE"), data };
      await insertarFoto(foto, userId);
      setFotos(await cargarFotos(paciente.id));
    } catch(e: any) { alert("No se pudo guardar: " + e.message); }
    setSubiendo(false);
  }

  async function eliminarFotoLocal(id: string) {
    await eliminarFoto(id);
    setFotos(await cargarFotos(paciente.id));
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:"16px" }}>
      <div style={{ background:"#fff", borderRadius:"18px", width:"100%", maxWidth:"580px", maxHeight:"88vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,0.25)" }}>
        <div style={{ padding:"18px 22px 14px", borderBottom:"1px solid #DCE5F0", display:"flex", alignItems:"center", gap:"12px", flexShrink:0 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, fontSize:"15px", color:"#0F2C52" }}>🩻 Radiografías</div>
            <div style={{ fontSize:"12px", color:"#90A4BE" }}>{paciente.nombre} · {paciente.historia}</div>
          </div>
          <button onClick={onCerrar} style={{ border:"none", background:"#F0F5FB", borderRadius:"8px", padding:"7px 12px", cursor:"pointer", color:"#4A6080", fontWeight:700, fontSize:"13px" }}>✕ Cerrar</button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"18px 22px" }}>
          {cargando && <div style={{ textAlign:"center", color:"#90A4BE" }}>Cargando...</div>}
          {!cargando && fotos.length===0 && (
            <div style={{ textAlign:"center", paddingTop:"30px", color:"#C8D6E5" }}>
              <div style={{ fontSize:"44px", marginBottom:"10px" }}>🩻</div>
              <div style={{ fontWeight:600, fontSize:"14px" }}>Sin radiografías aún</div>
            </div>
          )}
          {!cargando && fotos.length>0 && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"12px" }}>
              {fotos.map((f:any) => (
                <div key={f.id} style={{ background:"#F0F5FB", borderRadius:"12px", overflow:"hidden", border:"1px solid #DCE5F0" }}>
                  <div style={{ cursor:"pointer" }} onClick={()=>setVisor(f)}>
                    <img src={f.data} alt={f.nombre} style={{ width:"100%", height:"140px", objectFit:"cover", display:"block" }} />
                  </div>
                  <div style={{ padding:"8px 10px", display:"flex", alignItems:"center", gap:"6px" }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:"11px", fontWeight:700, color:"#0F2C52", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.nombre}</div>
                      <div style={{ fontSize:"10px", color:"#90A4BE" }}>{f.fecha}</div>
                    </div>
                    <BtnIco onClick={()=>setVisor(f)}             bg="#E3F0FF" bgH="#BBDEFB" color="#1565C0" title="Ver">🔍</BtnIco>
                    <BtnIco onClick={()=>eliminarFotoLocal(f.id)} bg="#FFF3F3" bgH="#FFCDD2" color="#D32F2F" title="Eliminar">🗑️</BtnIco>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding:"14px 22px", borderTop:"1px solid #DCE5F0", flexShrink:0 }}>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:"none" }}
            onChange={async e => { const archivos = Array.from(e.target.files!); e.target.value=""; for (const f of archivos) await agregarFoto(f); }} />
          <button onClick={()=>fileRef.current?.click()} disabled={subiendo}
            style={{ ...S.btnPrimario, opacity:subiendo?0.7:1, cursor:subiendo?"not-allowed":"pointer" }}>
            {subiendo?"⏳ Subiendo...":"📎 Agregar radiografía / imagen"}
          </button>
        </div>
      </div>
      {visor && (
        <div onClick={()=>setVisor(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.93)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300 }}>
          <img src={visor.data} alt={visor.nombre} style={{ maxWidth:"95vw", maxHeight:"90vh", objectFit:"contain", borderRadius:"8px" }} />
          <button onClick={()=>setVisor(null)} style={{ position:"absolute", top:"16px", right:"16px", background:"rgba(255,255,255,0.15)", border:"none", color:"#fff", borderRadius:"8px", padding:"8px 14px", cursor:"pointer", fontWeight:700 }}>✕ Cerrar</button>
        </div>
      )}
    </div>
  );
}

function CamposForm({ form, setForm }: { form:Record<string,string>, setForm:any }) {
  const upd = (key:string) => (e:React.ChangeEvent<HTMLInputElement>) => setForm((f:any) => ({ ...f, [key]: e.target.value }));
  const campos = [
    { label:"Nombre completo",          key:"nombre",   req:true,  ph:"Ej: María González Pérez" },
    { label:"Nº de historia / carpeta", key:"historia", req:true,  ph:"Ej: H-0006" },
    { label:"Cédula de identidad",      key:"cedula",   req:false, ph:"Opcional" },
    { label:"Teléfono",                 key:"telefono", req:false, ph:"Opcional" },
  ];
  return (
    <>
      {campos.map(c => (
        <div key={c.key} style={{ marginBottom:"15px" }}>
          <label style={{ fontSize:"11px", fontWeight:700, color:"#4A6080", letterSpacing:"0.05em", textTransform:"uppercase", display:"block", marginBottom:"5px" }}>
            {c.label} {c.req && <span style={{ color:"#D32F2F" }}>*</span>}
          </label>
          <input value={form[c.key]} onChange={upd(c.key)} placeholder={c.ph}
            style={S.input}
            onFocus={e=>e.target.style.borderColor="#1565C0"}
            onBlur={e=>e.target.style.borderColor="#DCE5F0"} />
        </div>
      ))}
    </>
  );
}

function Overlay({ onCerrar, children }: { onCerrar:()=>void, children:React.ReactNode }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:"16px" }}>
      <div style={{ background:"#fff", borderRadius:"16px", padding:"28px", maxWidth:"420px", width:"100%", boxShadow:"0 20px 60px rgba(0,0,0,0.2)", maxHeight:"90vh", overflowY:"auto" }}>
        {children}
      </div>
    </div>
  );
}

function Alerta({ tipo, children }: { tipo:string, children:React.ReactNode }) {
  const color = tipo==="ok"
    ? { background:"#E8F5E9", border:"1px solid #A5D6A7", color:"#2E7D32" }
    : { background:"#FFEBEE", border:"1px solid #FFCDD2", color:"#C62828" };
  return <div style={{ ...color, borderRadius:"10px", padding:"11px 15px", fontSize:"13px", marginBottom:"14px" }}>{children}</div>;
}

function BtnIco({ children, onClick, title, bg, bgH, color }: { children:React.ReactNode, onClick:()=>void, title:string, bg:string, bgH:string, color:string }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} title={title}
      style={{ border:"none", background:h?bgH:bg, borderRadius:"7px", padding:"7px 8px", cursor:"pointer", fontSize:"14px", color, transition:"background 0.15s" }}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>
      {children}
    </button>
  );
}
