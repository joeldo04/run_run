import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flag,
  LocateFixed,
  Navigation,
  Pause,
  Play,
  Radio,
  Save,
  Shield,
  Square,
  Users,
} from 'lucide-react'
import SafetyMap from './SafetyMap'
import {
  BackButton,
  Button,
  Confirm,
  DemoTag,
  EmptyState,
  Modal,
  SafetyNote,
  Score,
} from './components'
import {
  formatTime,
  length,
  pointAlong,
  routeScore,
  safety,
  segmentScore,
  uid,
  type Coordinate,
  type RouteData,
} from './data'
import { useDemo } from './store'
import { Security, SosButton, shareValid } from './security'

export default function Training({ back }: { back: () => void }) {
  const { state, update, notify, isDemo } = useDemo(),
    session = state.session
  const [finish, setFinish] = useState(false),
    [follow, setFollow] = useState(true),
    [security, setSecurity] = useState(false),
    [privacy, setPrivacy] = useState(false),
    [trim, setTrim] = useState(true),
    [savedId, setSavedId] = useState<string | null>(null)
  const route = session.route
  useEffect(() => {
    if (session.phase === 'permission') {
      const t = setTimeout(
        () => update((s) => ({ ...s, session: { ...s.session, phase: 'countdown', count: 3 } })),
        1000,
      )
      return () => clearTimeout(t)
    }
    if (session.phase === 'countdown') {
      const t = setTimeout(
        () =>
          update((s) => ({
            ...s,
            session: {
              ...s.session,
              count: s.session.count - 1,
              phase: s.session.count <= 1 ? 'running' : 'countdown',
            },
          })),
        1000,
      )
      return () => clearTimeout(t)
    }
    if (session.phase === 'running') {
      const t = setInterval(
        () =>
          update((s) => ({
            ...s,
            session: {
              ...s.session,
              seconds: s.session.seconds + 6,
              km: s.session.km + (1 / 60 + 0.0006 * Math.sin(s.session.seconds / 12)),
            },
          })),
        1000,
      )
      return () => clearInterval(t)
    }
  }, [session.phase, session.count])
  const progress = route.km > 0 ? Math.min(1, session.km / route.km) : 0
  const position = useMemo(() => pointAlong(route.geometry, progress), [route.geometry, progress])
  const track = useMemo(() => {
    if (!session.seconds) return []
    const points = Array.from({ length: Math.max(2, Math.ceil(progress * 100)) }, (_, i) =>
      pointAlong(route.geometry, (progress * i) / (Math.max(2, Math.ceil(progress * 100)) - 1)),
    )
    return points
  }, [route.geometry, progress, session.seconds])
  const score = routeScore(
    route,
    session.time,
    session.date,
    state.incidents,
    state.risks,
    state.roads,
  )
  const pace = session.km ? session.seconds / 60 / session.km : 0
  const paceString = pace
    ? `${Math.floor(pace)}:${String(Math.floor((pace % 1) * 60)).padStart(2, '0')}`
    : '—:—'
  const breakdown = useMemo(() => {
    const totals = { high: 0, medium: 0, low: 0, none: 0 }
    let total = 0
    route.segmentIds.forEach((id) => {
      const street = state.roads.find((s) => s.id === id)
      if (!street) return
      const km = length(street.points),
        key = safety(segmentScore(street, session.time, session.date, state.incidents, state.risks))
          .key as keyof typeof totals
      totals[key] += km
      total += km
    })
    return Object.entries(totals).map(([key, value]) => ({
      key,
      percent: total ? Math.round((value / total) * 100) : 0,
    }))
  }, [route, state.incidents, session.time, session.date, state.risks, state.roads])
  const start = () => {
    setSavedId(null)
    update((s) => ({
      ...s,
      session: {
        ...s.session,
        phase: 'permission',
        seconds: 0,
        km: 0,
        count: 3,
        time: s.time,
        date: s.date,
        finishedId: undefined,
      },
    }))
  }
  const finishTraining = () => {
    if (session.seconds < 1 || session.km < 0.001) {
      notify('Simula unos segundos de recorrido antes de terminar.')
      return
    }
    const id = uid()
    update((s) => ({
      ...s,
      session: { ...s.session, phase: 'summary', finishedId: id },
      trainings: [
        {
          id,
          route: s.session.route,
          date: new Date().toISOString(),
          seconds: s.session.seconds,
          km: +s.session.km.toFixed(3),
          time: s.session.time,
        },
        ...s.trainings,
      ],
      sharing: s.sharing ? { ...s.sharing, revoked: true } : null,
    }))
    setFinish(false)
    if (!isDemo) notify('Sincronizando tu entrenamiento y la revocación del enlace compartido.')
  }
  const save = (propose = false) => {
    if (savedId && !propose) {
      notify('Ya guardaste este recorrido.')
      return
    }
    const id = savedId ?? uid()
    const privateRoute: RouteData = {
      ...route,
      id,
      name: `Mi entrenamiento · ${new Date().toLocaleDateString('es', { day: 'numeric', month: 'short' })}`,
      geometry:
        trim && propose
          ? track.slice(
              Math.max(1, Math.floor(track.length * 0.1)),
              -Math.max(1, Math.floor(track.length * 0.1)),
            )
          : track,
      km: +session.km.toFixed(2),
      min: Math.ceil(session.seconds / 60),
      private: true,
      owned: true,
      status: propose ? 'Pendiente' : undefined,
      official: false,
      verified: false,
      date: session.date,
    }
    if (privateRoute.geometry.length < 2) {
      notify('Graba unos segundos más antes de guardar o recorta menos puntos.')
      return
    }
    update((s) => ({
      ...s,
      customRoutes: s.customRoutes.some((r) => r.id === id)
        ? s.customRoutes.map((r) => (r.id === id ? privateRoute : r))
        : [...s.customRoutes, privateRoute],
      savedIds: s.savedIds.includes(id) ? s.savedIds : [...s.savedIds, id],
    }))
    setSavedId(id)
    setPrivacy(false)
    notify(
      isDemo
        ? propose
          ? 'Propuesta de demostración guardada en esta pestaña. No se envía al club.'
          : 'Recorrido guardado como ruta privada en esta demo local.'
        : propose
          ? 'Sincronizando tu propuesta con revisión de privacidad para el club.'
          : 'Sincronizando el recorrido como ruta privada en tu cuenta.',
    )
  }
  if (!route.id || route.geometry.length < 2 || route.km <= 0)
    return (
      <EmptyState
        title="Elige tu próximo recorrido"
        description="Selecciona una ruta publicada o crea una ruta privada en el planificador para iniciar la simulación. No se registra GPS real."
      >
        <Button onClick={back}>
          Explorar rutas <ArrowRight />
        </Button>
      </EmptyState>
    )
  if (session.phase === 'summary')
    return (
      <div className="training-summary">
        <BackButton onClick={back}>Explorar</BackButton>
        <div className="summary-map">
          <SafetyMap
            route={route}
            track={track}
            tracking={position}
            fitRoute
            guide
            showReports={false}
          />
        </div>
        <section className="summary-main">
          <span className="eyebrow">
            <Check /> UN PASO MÁS, A TU RITMO.
          </span>
          <h1>
            Cada salida
            <br />
            es un avance.
          </h1>
          <p>{route.name}</p>
          <span className="muted">
            {new Date().toLocaleDateString('es')} · {session.time} · GPS de demostración
          </span>
          <div className="summary-metrics">
            <span>
              <strong>{session.km.toFixed(2)}</strong>kilómetros
            </span>
            <span>
              <strong>{formatTime(session.seconds).slice(3)}</strong>tiempo
            </span>
            <span>
              <strong>{paceString}</strong>ritmo /km
            </span>
          </div>
          <div className="summary-index">
            <Score value={score.score} large />
            <div>
              <strong>Índice referencial del recorrido</strong>
              <p>
                Escenario de las {session.time} · Cobertura {score.coverage}%
              </p>
            </div>
          </div>
          <div className="safety-spectrum" aria-label="Distribución de seguridad del recorrido">
            {breakdown.map(({ key, percent }) =>
              percent ? (
                <span
                  key={key}
                  className={key}
                  title={`${key}: ${percent}%`}
                  style={{ '--segment-share': percent } as React.CSSProperties}
                />
              ) : null,
            )}
          </div>
          <div className="safety-distribution">
            {breakdown.map(({ key, percent }) => (
              <div key={key}>
                <span className={`segment-color ${key}`} />
                <span>
                  {key === 'high'
                    ? 'Alto'
                    : key === 'medium'
                      ? 'Medio'
                      : key === 'low'
                        ? 'Bajo'
                        : 'Sin datos'}
                </span>
                <strong>{percent}%</strong>
              </div>
            ))}
          </div>
          <Button
            className="full"
            variant={savedId ? 'secondary' : 'primary'}
            onClick={() => save()}
          >
            {savedId ? <Check /> : <Save />}
            {savedId ? 'Guardada como ruta privada' : 'Guardar como ruta privada'}
          </Button>
          <Button variant="orange" className="full" onClick={() => setPrivacy(true)}>
            <Users />
            Proponer a la comunidad
          </Button>
          <SafetyNote />
          <button
            className="text-action"
            onClick={() =>
              update((s) => ({
                ...s,
                session: { ...s.session, phase: 'ready', seconds: 0, km: 0 },
              }))
            }
          >
            Preparar otro entrenamiento <ArrowRight />
          </button>
        </section>
        {privacy && (
          <Modal title="Protege el inicio y final de tu ruta" onClose={() => setPrivacy(false)}>
            <p>
              Revisa tu trazado antes de proponerlo. Puedes excluir el primer y último 10 % para no
              revelar ubicaciones personales.
            </p>
            <div className="modal-map">
              <SafetyMap
                route={{
                  ...route,
                  geometry: trim
                    ? track.slice(
                        Math.max(1, Math.floor(track.length * 0.1)),
                        -Math.max(1, Math.floor(track.length * 0.1)),
                      )
                    : track,
                }}
                fitRoute
              />
            </div>
            <label className="checkbox">
              <input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} />
              Excluir tramos inicial y final
            </label>
            <Button onClick={() => save(true)}>Proponer para revisión web</Button>
          </Modal>
        )}
      </div>
    )
  if (session.phase === 'permission' || session.phase === 'countdown')
    return (
      <div className="training-countdown">
        <button
          className="back-button"
          onClick={() => update((s) => ({ ...s, session: { ...s.session, phase: 'ready' } }))}
        >
          <ArrowLeft />
          Cancelar
        </button>
        <span className="eyebrow">TU MOMENTO · TU PRÓXIMO PASO</span>
        {session.phase === 'permission' ? (
          <>
            <LocateFixed />
            <h2>Comprobando ubicación.</h2>
            <p>Esperando señal GPS de demostración…</p>
          </>
        ) : (
          <>
            <strong key={session.count}>{session.count}</strong>
            <h2>Vamos a por ello.</h2>
            <p>GPS de demostración · No es seguimiento real</p>
          </>
        )}
      </div>
    )
  const active = session.phase === 'running' || session.phase === 'paused'
  return (
    <div className={`training-screen ${active ? 'recording' : ''}`}>
      <header className="training-top">
        <button
          aria-label="Salir del entrenamiento"
          onClick={() => (active ? setFinish(true) : back())}
        >
          <ArrowLeft />
        </button>
        <span>{active ? 'ENTRENAMIENTO' : 'PREPARA TU SALIDA'}</span>
        <span className="gps-tag">
          <Radio />
          GPS Demo
        </span>
      </header>
      {!active ? (
        <>
          <div className="training-prepare-map">
            <SafetyMap route={route} fitRoute guide />
          </div>
          <section className="training-preparation">
            <span className="eyebrow">TU RUTA ESTÁ LISTA</span>
            <h1>{route.name}</h1>
            <div className="preparation-metrics">
              <span>
                <strong>{route.km.toFixed(1)}</strong>km planificados
              </span>
              <span>
                <strong>{route.min}</strong>min aprox.
              </span>
              <Score value={score.score} />
            </div>
            <div className="gps-permission">
              <LocateFixed />
              <div>
                <strong>Ubicación de demostración</strong>
                <p>
                  Simularemos la señal y el movimiento sobre el trazado. No se solicita GPS real.
                </p>
              </div>
            </div>
            <Button variant="orange" className="full" onClick={start}>
              <Play />
              Iniciar entrenamiento
            </Button>
            <Button variant="ghost" className="full" onClick={() => setSecurity(true)}>
              <Shield />
              Herramientas de seguridad
            </Button>
          </section>
        </>
      ) : (
        <>
          <section className="recording-metrics">
            <span className="recording-state">
              <i className={session.phase === 'running' ? '' : 'is-paused'} />
              {session.phase === 'running' ? 'EN MOVIMIENTO' : 'EN PAUSA'}
              <small>SIMULACIÓN ×6</small>
            </span>
            <strong className="distance-numeral">
              {session.km.toFixed(2)}
              <small>km</small>
            </strong>
            <div className="recording-secondary">
              <span>
                <strong>{formatTime(session.seconds)}</strong>Tiempo simulado
              </span>
              <span>
                <strong>
                  {paceString}
                  <small> /km</small>
                </strong>
                Ritmo promedio
              </span>
            </div>
          </section>
          <div className="recording-map">
            <SafetyMap
              route={route}
              track={track}
              tracking={position}
              follow={follow}
              guide
              showReports={false}
            />
            <button
              className={`follow-runner ${follow ? 'active' : ''}`}
              onClick={() => setFollow(!follow)}
            >
              <LocateFixed />
              {follow ? 'Siguiendo' : 'Seguir corredor'}
            </button>
          </div>
          <div className="training-trace-legend">
            <span>
              <i />
              Ruta prevista
            </span>
            <span>
              <i />
              Recorrido simulado
            </span>
          </div>
          <div className="training-sharing">
            <button onClick={() => setSecurity(true)}>
              <Users />
              {shareValid(state.sharing) ? 'Compartiendo' : 'Compartir ubicación'}
              <ChevronIndicator />
            </button>
            <SosButton />
          </div>
          <div className="recording-controls">
            <button
              className="pause-training"
              onClick={() =>
                update((s) => ({
                  ...s,
                  session: {
                    ...s.session,
                    phase: s.session.phase === 'paused' ? 'running' : 'paused',
                  },
                }))
              }
            >
              {session.phase === 'paused' ? <Play /> : <Pause />}
              <span>{session.phase === 'paused' ? 'Continuar' : 'Pausar'}</span>
            </button>
            <button className="finish-training" onClick={() => setFinish(true)}>
              <Square />
              Finalizar
            </button>
          </div>
        </>
      )}
      {finish && (
        <Confirm
          title="¿Finalizar entrenamiento?"
          message={
            isDemo
              ? 'Guardaremos esta salida simulada en el historial de esta pestaña. No se envía al servidor ni se graba GPS real.'
              : 'Guardaremos esta salida simulada en tu historial privado y revocaremos tus enlaces de ubicación. No se graba GPS real.'
          }
          label="Finalizar y ver resumen"
          onClose={() => setFinish(false)}
          confirm={finishTraining}
        />
      )}
      {security && (
        <Modal title="Seguridad del corredor" onClose={() => setSecurity(false)} wide>
          <Security mobile />
        </Modal>
      )}
    </div>
  )
}
function ChevronIndicator() {
  return <span>→</span>
}
