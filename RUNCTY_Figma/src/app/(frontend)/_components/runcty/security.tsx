'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Link2,
  Navigation,
  Phone,
  Plus,
  Send,
  Shield,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import SafetyMap from './SafetyMap'
import { Button, Confirm, DemoTag, Modal, PageTitle, Status } from './components'
import { uid, type Coordinate } from './data'
import { useDemo } from './store'
import { readRunctyShare } from '../../actions'

export const shareUrl = (token: string) =>
  `${typeof window === 'undefined' ? '' : window.location.origin}/compartir/${encodeURIComponent(token)}`
export const shareValid = (sharing: ReturnType<typeof useDemo>['state']['sharing']) =>
  !!sharing && !sharing.revoked && Date.now() < sharing.expires
export function Security({ mobile = false }: { mobile?: boolean }) {
  const { state, update, notify, pending, syncError, isDemo } = useDemo()
  const [now, setNow] = useState(() => Date.now())
  const [edit, setEdit] = useState<{
      id: string
      name: string
      email: string
      phone: string
    } | null>(null),
    [remove, setRemove] = useState<string | null>(null),
    [whatsapp, setWhatsapp] = useState(false),
    [preview, setPreview] = useState(false),
    [call, setCall] = useState(false)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  const valid = !!state.sharing && !state.sharing.revoked && now < state.sharing.expires
  const sharing = () => {
    if (isDemo) {
      notify(
        'Los enlaces públicos requieren una cuenta real. Esta demo local no publica tu ubicación.',
      )
      return
    }
    if (valid) {
      if (!update((s) => ({ ...s, sharing: s.sharing ? { ...s.sharing, revoked: true } : null })))
        return
      notify(
        'Sincronizando la revocación. Confirma el guardado antes de dar por cerrado el acceso.',
      )
    } else {
      if (
        !update((s) => ({
          ...s,
          sharing: { token: uid(), expires: Date.now() + 4 * 3600000, revoked: false },
        }))
      )
        return
      notify('Sincronizando un enlace temporal de demostración de hasta cuatro horas.')
    }
  }
  const copy = async () => {
    if (!state.sharing) return
    try {
      await navigator.clipboard.writeText(shareUrl(state.sharing.token))
      notify('Enlace temporal copiado')
    } catch {
      notify('Selecciona y copia el enlace que aparece en pantalla.')
    }
  }
  return (
    <div className={`security-screen ${mobile ? 'mobile-padded' : ''}`}>
      <PageTitle
        eyebrow="TÚ ELIGES CON QUIÉN COMPARTIR"
        title="Corre acompañado."
        subtitle="Tus herramientas de seguridad, a mano."
      />
      <div className="security-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">TU RED DE APOYO</span>
            <h2>Contactos de confianza</h2>
          </div>
          <Button
            variant="secondary"
            disabled={state.contacts.length >= 5}
            onClick={() => setEdit({ id: uid(), name: '', email: '', phone: '' })}
          >
            <Plus />
            {mobile ? 'Añadir' : 'Añadir contacto'}
          </Button>
        </div>
        <p className="muted">
          {state.contacts.length} de 5 contactos ·{' '}
          {isDemo ? 'Solo en esta pestaña' : 'Privados en tu cuenta'}
        </p>
        <div className="contact-list">
          {state.contacts.map((c, i) => (
            <article key={c.id}>
              <span>{i + 1}</span>
              <button onClick={() => setEdit(c)}>
                <strong>{c.name}</strong>
                <small>{c.email}</small>
              </button>
              <button aria-label={`Eliminar contacto ${i + 1}`} onClick={() => setRemove(c.id)}>
                <Trash2 />
              </button>
            </article>
          ))}
        </div>
      </div>
      <div className="sharing-section">
        <span className={`sharing-symbol ${valid ? 'active' : ''}`}>
          <Navigation />
        </span>
        <div>
          <h2>Comparte tu recorrido.</h2>
          <p>
            {valid
              ? 'Compartiendo ubicación de demostración.'
              : 'Activa un enlace temporal solo cuando tú quieras.'}
          </p>
        </div>
        <Status value={valid ? 'Activo' : 'Inactivo'} />
        <Button
          className="full"
          disabled={isDemo || pending > 0 || !!syncError}
          variant={valid ? 'secondary' : 'primary'}
          onClick={sharing}
        >
          <Link2 />
          {valid ? 'Detener y revocar enlace' : 'Compartir ubicación'}
        </Button>
        {isDemo && (
          <p className="info-strip">
            Demo local: los enlaces públicos requieren una cuenta real. No se comparte tu ubicación.
          </p>
        )}
        {(pending > 0 || syncError) && (
          <p className="info-strip" role="status">
            {syncError || 'Espera la confirmación de guardado antes de compartir el enlace.'}
          </p>
        )}
        {valid && state.sharing && pending === 0 && !syncError && (
          <>
            <div className="share-url">
              <input readOnly aria-label="Enlace temporal" value={shareUrl(state.sharing.token)} />
              <button aria-label="Copiar enlace" onClick={copy}>
                <Copy />
              </button>
            </div>
            <div className="share-actions">
              <button onClick={() => setPreview(true)}>
                <ExternalLink />
                Ver como contacto
              </button>
              <button onClick={() => setWhatsapp(true)}>
                <Send />
                WhatsApp
              </button>
            </div>
            <small>
              Caduca al finalizar el entrenamiento, al revocarlo o en cuatro horas, lo que ocurra
              primero.
            </small>
          </>
        )}
        {!valid && state.sharing && (
          <button className="text-action" onClick={() => setPreview(true)}>
            Comprobar enlace revocado <ExternalLink />
          </button>
        )}
      </div>
      <div className="emergency-section">
        <Shield />
        <div>
          <h3>Herramientas de emergencia</h3>
          <p>
            El SOS está disponible durante el entrenamiento. No se envían alertas ni llamadas
            reales.
          </p>
        </div>
        <Button variant="secondary" onClick={() => setCall(true)}>
          <Phone />
          911 · Demo
        </Button>
      </div>
      {state.sos.length > 0 && (
        <section className="sos-history">
          <h3>Historial de alertas simuladas</h3>
          {state.sos.map((a) => (
            <div key={a.id}>
              <AlertTriangle />
              <span>
                {new Date(a.date).toLocaleString('es')}
                <small>{a.status}</small>
              </span>
            </div>
          ))}
        </section>
      )}
      {edit && (
        <Modal
          title={
            state.contacts.some((c) => c.id === edit.id) ? 'Editar contacto' : 'Nuevo contacto'
          }
          onClose={() => setEdit(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (
                !update((s) => ({
                  ...s,
                  contacts: s.contacts.some((c) => c.id === edit.id)
                    ? s.contacts.map((c) => (c.id === edit.id ? edit : c))
                    : [...s.contacts, edit].slice(0, 5),
                }))
              )
                return
              setEdit(null)
              notify('Sincronizando tu contacto de confianza.')
            }}
          >
            <label className="field">
              Nombre
              <input
                required
                maxLength={80}
                value={edit.name}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
              />
            </label>
            <label className="field">
              Correo
              <input
                required
                type="email"
                value={edit.email}
                onChange={(e) => setEdit({ ...edit, email: e.target.value })}
              />
            </label>
            <label className="field">
              Teléfono (opcional)
              <input
                type="tel"
                maxLength={40}
                value={edit.phone}
                onChange={(e) => setEdit({ ...edit, phone: e.target.value })}
              />
            </label>
            <Button type="submit">Guardar contacto</Button>
          </form>
        </Modal>
      )}
      {remove && (
        <Confirm
          title="¿Eliminar contacto?"
          message="Este contacto ya no aparecerá en las alertas simuladas."
          onClose={() => setRemove(null)}
          label="Eliminar"
          confirm={() =>
            update((s) => ({ ...s, contacts: s.contacts.filter((c) => c.id !== remove) }))
          }
        />
      )}
      {whatsapp && (
        <Confirm
          title="Compartir por WhatsApp · demostración"
          message="No se abrirá WhatsApp ni se enviará un mensaje real. Puedes copiar el enlace y decidir con quién compartirlo."
          label="Copiar enlace"
          onClose={() => setWhatsapp(false)}
          confirm={copy}
        />
      )}
      {preview && (
        <Modal title="Vista del contacto" wide onClose={() => setPreview(false)}>
          <ContactView token={state.sharing?.token ?? ''} embedded />
          <Button
            variant="secondary"
            onClick={() => {
              update((s) => ({ ...s, sharing: s.sharing ? { ...s.sharing, revoked: true } : null }))
              notify('Enlace revocado')
            }}
            disabled={!valid}
          >
            Revocar y comprobar
          </Button>
        </Modal>
      )}
      {call && (
        <Modal title="911 · Demostración" onClose={() => setCall(false)}>
          <Phone />
          <p>
            En Android, esta acción abriría el marcador con 911. El prototipo no inicia llamadas ni
            contacta a servicios de emergencia.
          </p>
          <Button onClick={() => setCall(false)}>Entendido</Button>
        </Modal>
      )}
    </div>
  )
}

type SharedPosition = {
  expires: string
  position: Coordinate
  alert: boolean
  updatedAt: string
}
export function ContactView({
  token,
  initialShare = null,
  embedded = false,
}: {
  token: string
  initialShare?: SharedPosition | null
  embedded?: boolean
}) {
  const [share, setShare] = useState(initialShare)
  const [now, setNow] = useState(() => Date.now())
  const [unavailable, setUnavailable] = useState(false)
  useEffect(() => {
    let disposed = false
    const refresh = async () => {
      try {
        const result = await readRunctyShare(token)
        if (disposed) return
        setShare(
          result.share
            ? {
                ...result.share,
                expires: new Date(result.share.expires).toISOString(),
              }
            : null,
        )
        setUnavailable(false)
      } catch {
        if (!disposed) {
          setUnavailable(true)
          setShare(null)
        }
      }
    }
    void refresh()
    const timer = setInterval(() => {
      setNow(Date.now())
      void refresh()
    }, 10000)
    return () => {
      disposed = true
      clearInterval(timer)
    }
  }, [token])
  const valid = !!share && Date.parse(share.expires) > now
  if (!valid)
    return (
      <div className="expired-link">
        <Shield />
        <h2>
          {unavailable ? 'No se pudo comprobar el enlace' : 'Este enlace ya no está disponible'}
        </h2>
        <p>
          {unavailable
            ? 'Reintentaremos la consulta. No se muestra ninguna ubicación sin validación del servidor.'
            : 'El corredor lo revocó, finalizó el entrenamiento o terminó su vigencia.'}
        </p>
        <DemoTag />
      </div>
    )
  return (
    <div className={`contact-view ${embedded ? 'embedded-contact' : ''}`}>
      <span className="eyebrow">COMPARTIDO CONTIGO · SIMULACIÓN</span>
      <h2>Un recorrido compartido contigo.</h2>
      <p>
        Última posición simulada guardada · {new Date(share.updatedAt).toLocaleTimeString('es')}
      </p>
      <div className="contact-map">
        <SafetyMap tracking={share.position} focus={share.position} showReports={false} />
      </div>
      <div className="info-strip">
        <Shield />
        Enlace temporal validado por el servidor. La posición procede de un entrenamiento simulado:
        no es seguimiento GPS real ni un servicio de emergencia.
      </div>
      {share.alert && (
        <div className="form-error">
          <AlertTriangle />
          Hay una alerta SOS de demostración activa.
        </div>
      )}
      <small>Disponible hasta las {new Date(share.expires).toLocaleTimeString('es')}</small>
    </div>
  )
}

export function SosButton() {
  const { state, user, update, pending, syncError } = useDemo(),
    hold = useRef<ReturnType<typeof setTimeout> | null>(null),
    [holding, setHolding] = useState(false),
    [count, setCount] = useState<number | null>(null),
    [sent, setSent] = useState(false),
    [offline, setOffline] = useState(false),
    [phone, setPhone] = useState(false)
  useEffect(() => {
    if (count === null) return
    if (count === 0) {
      setCount(null)
      const accepted = update((s) => ({
        ...s,
        sos: [
          {
            id: uid(),
            date: new Date().toISOString(),
            status: offline ? 'Sin conexión · correo no enviado' : 'Alerta simulada generada',
          },
          ...s.sos,
        ],
      }))
      setSent(accepted)
      return
    }
    const timer = setTimeout(() => setCount((c) => (c === null ? null : c - 1)), 1000)
    return () => clearTimeout(timer)
  }, [count, offline, update])
  useEffect(
    () => () => {
      if (hold.current) clearTimeout(hold.current)
    },
    [],
  )
  const press = () => {
    if (hold.current || count !== null || sent) return
    setHolding(true)
    hold.current = setTimeout(() => {
      hold.current = null
      setHolding(false)
      setCount(5)
    }, 3000)
  }
  const release = () => {
    if (hold.current) clearTimeout(hold.current)
    hold.current = null
    setHolding(false)
  }
  return (
    <>
      <button
        className={`sos-button ${holding ? 'holding' : ''}`}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          press()
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
            e.preventDefault()
            press()
          }
        }}
        onKeyUp={release}
        aria-label="Mantener SOS tres segundos"
      >
        <span>SOS</span>
        <small>{holding ? 'Mantén…' : 'Mantén 3 s'}</small>
      </button>
      {count !== null && (
        <Modal title="Alerta SOS de demostración" onClose={() => setCount(null)}>
          <div className="sos-count">{count}</div>
          <p>
            Se simulará una alerta a tus {state.contacts.length} contactos. No se envían mensajes ni
            se realizan llamadas reales.
          </p>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={offline}
              onChange={(e) => setOffline(e.target.checked)}
            />
            Simular pérdida de conexión
          </label>
          <Button className="full" variant="danger" onClick={() => setCount(null)}>
            Cancelar alerta
          </Button>
        </Modal>
      )}
      {sent && (
        <Modal
          title={
            pending
              ? 'Sincronizando alerta simulada'
              : syncError
                ? 'Alerta pendiente de sincronización'
                : offline
                  ? 'Pérdida de conexión simulada'
                  : 'Alerta simulada registrada'
          }
          onClose={() => setSent(false)}
        >
          <div className="sos-sent-icon">
            <AlertTriangle />
          </div>
          <p>
            {offline
              ? 'Se simuló una pérdida de conexión. No se envió ningún correo ni se llamó al 911.'
              : (user?.name ?? 'Corredor') +
                ' · ' +
                new Date().toLocaleTimeString('es') +
                ' · simulación para tus contactos de confianza.'}
          </p>
          <p className="muted">No se enviaron mensajes reales.</p>
          {state.sharing && <code>{shareUrl(state.sharing.token)}</code>}
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setPhone(true)}>
              <Phone />
              911 · Demo
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard
                  ?.writeText(`Alerta RUNCTY de demostración · ${user?.name ?? 'Corredor'}`)
                  .catch(() => {})
                setSent(false)
              }}
            >
              <Copy />
              Copiar aviso
            </Button>
          </div>
          {phone && (
            <p className="info-strip">
              Demostración del marcador 911. No se ha iniciado una llamada.
            </p>
          )}
        </Modal>
      )}
    </>
  )
}
