'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  CircleUserRound,
  Computer,
  Flag,
  FlagTriangleRight,
  Footprints,
  Heart,
  History as HistoryIcon,
  Home,
  Map,
  MapPin,
  Menu,
  MessageSquare,
  Monitor,
  Navigation,
  Plus,
  QrCode,
  Route,
  Search,
  Settings2,
  Shield,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { BackButton, Button, DemoTag, IconButton, Logo, Modal, PageTitle } from './components'
import { type Role, type RouteData } from './data'
import { useDemo, useRoutes } from './store'
import SafetyMap from './SafetyMap'
import { MainScreen, RouteDetail } from './screens'
import { ClubAdmin, SystemAdmin } from './Admin'
import Training from './Training'
import type { RunctySession } from '@/lib/runcty-queries'
import { paths, clubPages, systemPages, privatePages } from './navigation'

type Experience = 'selector' | 'web' | 'mobile'
const publicNavigation = [
  { id: 'explore', label: 'Explorar', icon: Home },
  { id: 'map', label: 'Mapa de seguridad', icon: Map },
  { id: 'routes', label: 'Rutas', icon: Route },
  { id: 'spaces', label: 'Espacios recomendados', icon: MapPin },
  { id: 'club', label: 'Club Gacelas', icon: Users },
]
const runnerNavigation = [
  { id: 'explore', label: 'Explorar', icon: Home },
  { id: 'map', label: 'Mapa de seguridad', icon: Map },
  { id: 'routes', label: 'Rutas', icon: Route },
  { id: 'planner', label: 'Planificar ruta', icon: Navigation },
  { id: 'myroutes', label: 'Mis rutas', icon: Heart },
  { id: 'history', label: 'Mis entrenamientos', icon: Activity },
  { id: 'reports', label: 'Reportes de incidentes', icon: Flag },
  { id: 'security', label: 'Seguridad', icon: Shield },
  { id: 'profile', label: 'Mi perfil', icon: CircleUserRound },
  { id: 'club', label: 'Club Gacelas', icon: Users },
]
const clubNavigation = [
  { id: 'clubhome', label: 'Resumen del club', icon: Home },
  { id: 'moderate', label: 'Reportes pendientes', icon: ShieldAlert },
  { id: 'proposals', label: 'Rutas propuestas', icon: Route },
  { id: 'official', label: 'Rutas oficiales y horarios', icon: HistoryIcon },
  { id: 'adminspaces', label: 'Espacios recomendados', icon: MapPin },
  { id: 'risks', label: 'Zonas de riesgo', icon: Shield },
  { id: 'comments', label: 'Comentarios', icon: MessageSquare },
  { id: 'sponsors', label: 'Patrocinadores', icon: Sparkles },
  { id: 'banners', label: 'Banners', icon: Monitor },
  { id: 'stats', label: 'Estadísticas', icon: Activity },
  { id: 'moderationlog', label: 'Historial de moderación', icon: HistoryIcon },
  { id: 'clubinfo', label: 'Información del club', icon: Users },
]
const systemNavigation = [
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'cities', label: 'Ciudades y red vial', icon: Map },
  { id: 'parameters', label: 'Parámetros de seguridad', icon: Settings2 },
]

function Selector({ enter }: { enter: (e: Experience) => void }) {
  const { state, openAccount, user } = useDemo()
  const featured = state.catalog[0]
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-ink">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-full lg:w-3/5"
        aria-hidden="true"
      >
        {state.heroImage && (
          <Image
            src={state.heroImage.url}
            alt={state.heroImage.alt}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            preload
            className="object-cover object-center opacity-65"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-r from-ink via-ink/65 to-ink/45 lg:via-ink/40 lg:to-ink/15" />
        <div className="absolute inset-0 bg-linear-to-b from-ink/20 via-transparent to-ink" />
      </div>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <header className="flex min-h-24 items-center justify-between gap-5 border-b border-line/50">
          <div className="flex items-center gap-7">
            <Logo />
            <span className="hidden border-l border-line pl-7 text-[9px] tracking-[.22em] text-muted md:block">
              CORRE CON INFORMACIÓN.
            </span>
          </div>
          <div className="flex items-center gap-5">
            <span className="hidden items-center gap-2 text-[10px] font-medium tracking-widest text-muted sm:flex">
              <MapPin className="size-3.5 text-lilac" /> LOJA, ECUADOR
            </span>
            <Button
              variant="secondary"
              className="min-h-10 px-4 py-2 text-xs"
              onClick={openAccount}
            >
              <CircleUserRound />
              {user ? 'Carlos · demo' : 'Entrar como Carlos'}
            </Button>
          </div>
        </header>
        <section className="relative grid gap-8 pb-9 pt-14 sm:pb-12 sm:pt-20 lg:grid-cols-[1.8fr_1fr]">
          <div>
            <div className="mb-6 flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[.22em] text-lilac">
              <span className="h-px w-8 bg-neon" />
              TU CIUDAD. TU RITMO. TU SIGUIENTE META.
            </div>
            <div className="[&_.page-heading]:mb-5 [&_h1]:m-0 [&_h1]:font-display [&_h1]:text-5xl [&_h1]:leading-[.94] [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:uppercase [&_h1]:italic sm:[&_h1]:text-8xl lg:[&_h1]:text-[100px] [&_p]:mt-6 [&_p]:max-w-md [&_p]:text-sm [&_p]:leading-7">
              <PageTitle
                title={
                  <>
                    Elige tu ruta.
                    <br />
                    <span className="bg-linear-to-r from-lilac to-neon bg-clip-text text-transparent">
                      Supera tus límites.
                    </span>
                  </>
                }
                subtitle="Descubre recorridos y horarios con información de seguridad para correr por Loja con mayor confianza."
              />
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] font-medium text-muted">
              <span className="flex items-center gap-2">
                <Map className="size-4 text-lilac" /> Explora Loja
              </span>
              <span className="flex items-center gap-2">
                <Route className="size-4 text-lilac" /> Diseña tu recorrido
              </span>
              <span className="flex items-center gap-2">
                <Activity className="size-4 text-sport" /> Supera tu siguiente meta
              </span>
            </div>
          </div>
          <aside className="hidden flex-col justify-end pb-5 pl-8 lg:flex">
            <span className="mb-3 text-[9px] font-semibold tracking-[.25em] text-lilac">
              RUNCTY / AFTER DARK
            </span>
            <p className="border-l border-neon/60 pl-4 font-display text-3xl leading-tight font-semibold uppercase italic text-copy/85">
              El próximo paso
              <br />
              lo eliges tú.
            </p>
            <span className="mt-5 text-[8px] text-muted/70">
              Imagen editorial · Michał Mendel / Unsplash
            </span>
          </aside>
        </section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="eyebrow mb-2">UNA MISMA CUENTA. DOS FORMAS DE MOVERTE.</span>
            <h2 className="text-xl font-semibold tracking-tight">Elige tu experiencia.</h2>
          </div>
          <DemoTag />
        </div>
        <div className="grid gap-5 pb-7 lg:grid-cols-2">
          <article className="group relative grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] overflow-hidden rounded-2xl border border-line bg-panel/70 shadow-panel backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:border-neon/60 sm:grid-cols-[1.25fr_1fr]">
            <div className="relative z-10 p-5 sm:p-7">
              <span className="text-[8px] font-semibold tracking-[.2em] text-lilac">
                01 / EXPLORA EN GRANDE
              </span>
              <div className="mb-3 mt-5 flex items-center gap-3">
                <Monitor className="size-5 text-lilac" />
                <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
                  Explorar en la web
                </h3>
              </div>
              <p className="mb-6 max-w-xs text-xs leading-6 text-muted">
                Toda tu ciudad, en perspectiva. Explora rutas y planifica tu próximo recorrido.
              </p>
              <Button
                onClick={() => enter('web')}
                className="w-full max-sm:px-3 max-sm:text-xs sm:w-auto"
              >
                Entrar a la web <ArrowRight />
              </Button>
            </div>
            <div className="relative flex min-w-0 items-end pt-7" aria-hidden="true" inert>
              <div className="h-52 w-full -rotate-6 overflow-hidden rounded-tl-xl border-l border-t border-lilac/25 bg-ink shadow-panel transition-transform duration-300 group-hover:-translate-y-1">
                <div className="flex items-center gap-1 border-b border-line bg-shell px-3 py-2">
                  <span className="size-1 rounded-full bg-line" />
                  <span className="size-1 rounded-full bg-line" />
                  <span className="size-1 rounded-full bg-neon" />
                  <span className="ml-2 text-[6px] font-semibold tracking-widest text-muted">
                    RUNCTY / EXPLORAR
                  </span>
                </div>
                <div className="h-44">
                  <SafetyMap route={featured} fitRoute preview />
                </div>
              </div>
            </div>
          </article>
          <article className="group relative grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] overflow-hidden rounded-2xl border border-line bg-panel/70 shadow-panel backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:border-sport/60 sm:grid-cols-[1.25fr_1fr]">
            <div className="relative z-10 p-5 sm:p-7">
              <span className="text-[8px] font-semibold tracking-[.2em] text-sport">
                02 / LLEVA TU SIGUIENTE META
              </span>
              <div className="mb-3 mt-5 flex items-center gap-3">
                <Smartphone className="size-5 text-sport" />
                <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
                  Explorar app móvil
                </h3>
              </div>
              <p className="mb-6 max-w-xs text-xs leading-6 text-muted">
                La ciudad, a tu alcance. Descubre rutas y prueba tu entrenamiento en el simulador.
              </p>
              <Button
                variant="secondary"
                onClick={() => enter('mobile')}
                className="w-full max-sm:px-3 max-sm:text-xs sm:w-auto"
              >
                Explorar móvil <ArrowRight />
              </Button>
            </div>
            <div
              className="relative flex min-w-0 items-end justify-center pt-5"
              aria-hidden="true"
              inert
            >
              <div className="relative -mb-8 h-60 w-36 rotate-6 overflow-hidden rounded-t-3xl border-4 border-raised bg-ink shadow-panel transition-transform duration-300 group-hover:-translate-y-1">
                <div className="flex justify-center bg-ink py-2">
                  <span className="h-1 w-10 rounded-full bg-raised" />
                </div>
                <div className="flex items-center justify-between px-3 pb-2 text-[7px] font-bold">
                  <span>RUNCTY.</span>
                  <span className="text-lilac">EXPLORAR</span>
                </div>
                <div className="h-32">
                  <SafetyMap route={featured} fitRoute preview />
                </div>
                <div className="relative border-t border-line bg-shell px-3 py-2">
                  <span className="block truncate text-[8px] font-semibold">
                    {featured?.name ?? 'Tu próximo recorrido'}
                  </span>
                  <span className="mt-1 block text-[7px] text-dim">
                    {featured
                      ? `${featured.km.toFixed(1)} km · ${featured.min} min`
                      : 'Explora el mapa de Loja'}
                  </span>
                </div>
                <div className="mx-3 mt-2 rounded-md bg-primary px-2 py-1.5 text-center text-[7px] font-semibold">
                  TU SIGUIENTE PASO
                </div>
              </div>
            </div>
          </article>
        </div>
        <div className="flex items-center justify-center gap-2 pb-8 text-center text-[10px] leading-relaxed text-muted">
          <Check className="size-3.5 text-lilac" />
          Web y móvil comparten esta experiencia. La demo local no sincroniza entre dispositivos.
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-line/60 py-5 text-[8px] tracking-wide text-dim">
          <span className="font-semibold tracking-widest">
            RUNCTY × {state.clubName.toUpperCase()}
          </span>
          <p className="flex max-w-md items-center gap-2">
            <Shield className="size-3.5" /> Información referencial. No garantiza tu seguridad.
          </p>
          <span className="tracking-[.2em]">LOJA, ECUADOR / EC</span>
        </footer>
      </div>
    </main>
  )
}

function RunModal({ close, mobile }: { close: () => void; mobile: () => void }) {
  const [download, setDownload] = useState(false)
  return (
    <Modal
      title={download ? 'Tu próxima ruta, en Android.' : 'Lleva tu entrenamiento al móvil'}
      onClose={close}
    >
      {download ? (
        <>
          <div className="download-art">
            <QrCode />
            <span>QR VISUAL DE DEMOSTRACIÓN</span>
          </div>
          <p>
            La aplicación Android todavía no está publicada. No existe una descarga de APK ni un
            enlace de Google Play.
          </p>
          <Button className="full" disabled>
            APK próximamente
          </Button>
          <Button className="full" variant="ghost" onClick={() => setDownload(false)}>
            Volver
          </Button>
        </>
      ) : (
        <>
          <span className="handoff-icon">
            <Smartphone />
          </span>
          <p>
            Continúa en la vista móvil para simular tu recorrido. La grabación GPS real y la
            aplicación Android aún no están disponibles.
          </p>
          <div className="handoff-note">
            <Route />
            Conservaremos tu ruta seleccionada en el simulador.
          </div>
          <Button className="full" onClick={mobile}>
            Ver aplicación móvil <ArrowRight />
          </Button>
          <Button className="full" variant="secondary" onClick={() => setDownload(true)}>
            Descargar app Android
          </Button>
          <Button className="full" variant="ghost" onClick={close}>
            Cancelar
          </Button>
          <small>La grabación del prototipo es simulada. El ordenador no graba GPS.</small>
        </>
      )}
    </Modal>
  )
}

function WebApp({
  exit,
  toMobile,
  initialRoute,
  initialPage = 'explore',
}: {
  exit: () => void
  toMobile: (route?: RouteData, start?: boolean) => void
  initialRoute?: RouteData
  initialPage?: string
}) {
  const { state, user, isDemo, loading, update, openAccount } = useDemo(),
    all = useRoutes()
  const router = useRouter()
  const page = initialPage
  const role: Role =
    clubPages.includes(page) && user?.role !== 'corredor' && user
      ? 'club'
      : systemPages.includes(page) && user?.role === 'sistema'
        ? 'sistema'
        : user
          ? 'corredor'
          : 'visitante'
  const [selected, setSelected] = useState<RouteData | null>(initialRoute ?? null),
    [handoff, setHandoff] = useState<RouteData | null>(null),
    [notification, setNotification] = useState(false),
    [menu, setMenu] = useState(false)
  useEffect(() => {
    setSelected(initialRoute ?? null)
    setMenu(false)
  }, [initialRoute, initialPage])
  const nav =
    role === 'club'
      ? clubNavigation
      : role === 'sistema'
        ? systemNavigation
        : role === 'visitante'
          ? publicNavigation
          : runnerNavigation
  const resolved = selected ? (all.find((r) => r.id === selected.id) ?? selected) : null
  const go = (target: string) => {
    if (!user && privatePages.includes(target)) {
      openAccount()
      return
    }
    if (target === 'recommend') update((s) => ({ ...s, draft: { ...s.draft, mode: 'recommend' } }))
    setSelected(null)
    setMenu(false)
    router.push(paths[target] ?? '/explorar')
  }
  const open = (route: RouteData) => {
    if (!route) return
    if (route.slug && !route.private && route.status === 'Aprobado') {
      router.push(`/rutas/${encodeURIComponent(route.slug)}`)
      return
    }
    setSelected(route)
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }
  const activeNav = nav.find((n) => n.id === page)
  const adminPage = clubPages.includes(page) || systemPages.includes(page)
  const protectedRunner =
    (!user && privatePages.includes(page)) ||
    (adminPage &&
      (!user ||
        user.role === 'corredor' ||
        (systemPages.includes(page) && user.role !== 'sistema')))
  return (
    <div className={`web-app ${role === 'club' || role === 'sistema' ? 'admin-app' : ''}`}>
      <aside className={`sidebar ${menu ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <Logo />
          <span>RUNNING, INFORMADO.</span>
        </div>
        <button className="experience-switch" onClick={exit}>
          <ArrowLeft />
          Cambiar experiencia <ChevronRight />
        </button>
        <span className="nav-section-label">
          {role === 'club'
            ? 'GESTIÓN DEL CLUB'
            : role === 'sistema'
              ? 'ADMINISTRACIÓN'
              : 'DESCUBRE TU CIUDAD'}
        </span>
        <nav>
          {nav.map(({ id, label, icon: Icon }) => (
            <Link
              key={id}
              href={paths[id] ?? '/explorar'}
              aria-current={!selected && page === id ? 'page' : undefined}
              className={!selected && page === id ? 'active' : ''}
              onClick={() => {
                setMenu(false)
                setSelected(null)
              }}
            >
              <Icon />
              <span>{label}</span>
              {id === 'moderate' && state.incidents.some((i) => i.status === 'Pendiente') && (
                <b>{state.incidents.filter((i) => i.status === 'Pendiente').length}</b>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {role === 'visitante' ? (
            <div className="guest-invite">
              <span>Tu próximo paso.</span>
              <p>Guarda tus rutas y continúa desde cualquier dispositivo.</p>
              <Button onClick={openAccount}>
                Entrar como Carlos <ArrowRight />
              </Button>
            </div>
          ) : (
            <div className="sidebar-safety">
              <Shield />
              <strong>Corre con información.</strong>
              <p>El índice es referencial, no una garantía.</p>
            </div>
          )}
          <button className="sidebar-account" onClick={openAccount}>
            <span className="avatar">
              {role === 'visitante'
                ? 'V'
                : role === 'club'
                  ? 'G'
                  : role === 'sistema'
                    ? 'A'
                    : user?.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>
                {role === 'visitante'
                  ? 'Visitante'
                  : role === 'club'
                    ? 'Club Gacelas'
                    : role === 'sistema'
                      ? 'Admin. del sistema'
                      : (user?.name ?? 'Corredor')}
              </strong>
              <span>
                {isDemo
                  ? 'Demo local · esta pestaña'
                  : user
                    ? 'Demo en esta pestaña'
                    : 'Exploración pública'}
              </span>
            </div>
            <ChevronRight />
          </button>
        </div>
      </aside>
      {menu && (
        <button
          aria-label="Cerrar menú lateral"
          className="mobile-menu-scrim"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="web-main">
        <header className="topbar">
          <IconButton label="Abrir menú" className="md:hidden" onClick={() => setMenu(!menu)}>
            <Menu />
          </IconButton>
          <div className="topbar-breadcrumb">
            <span>RUNCTY</span>
            <ChevronRight />
            {selected ? 'Detalle de ruta' : (activeNav?.label ?? 'Planificar ruta')}
          </div>
          <div className="topbar-actions">
            <button className="catalog-search-shortcut" onClick={() => go('routes')}>
              <Search />
              <span>Busca tu próxima ruta</span>
            </button>
            <button
              className="mobile-preview-shortcut"
              onClick={() => toMobile(resolved ?? undefined)}
            >
              <Smartphone />
              Vista móvil
            </button>
            <IconButton label="Notificaciones" onClick={() => setNotification(true)}>
              <Bell />
            </IconButton>
            {user && user.role !== 'corredor' && (
              <nav
                aria-label="Espacios de tu cuenta"
                className="flex items-center gap-3 text-xs font-semibold text-violet-700"
              >
                <Link href="/explorar">Correr</Link>
                <Link href="/gestion/clubhome">Club</Link>
                {user.role === 'sistema' && <Link href="/gestion/users">Sistema</Link>}
              </nav>
            )}
            <Button variant="secondary" onClick={openAccount}>
              {isDemo ? 'Carlos · demo' : (user?.name ?? 'Ver demo')}
            </Button>
          </div>
        </header>
        <main className="web-content">
          {protectedRunner ? (
            <div className="account-disabled">
              <ShieldAlert />
              <h1>
                {loading
                  ? 'Cargando tu cuenta…'
                  : adminPage
                    ? 'Gestión reservada.'
                    : 'Tu espacio personal.'}
              </h1>
              <p>
                {adminPage
                  ? 'Esta sección requiere un rol de gestión asignado desde Payload. No se conceden permisos desde la interfaz.'
                  : 'Inicia sesión para consultar tus datos privados y continuar desde cualquier dispositivo.'}
              </p>
              <Button disabled={loading} onClick={openAccount}>
                Entrar como Carlos
              </Button>
            </div>
          ) : resolved ? (
            <RouteDetail
              route={resolved}
              back={() => (initialRoute ? router.push('/rutas') : setSelected(null))}
              run={setHandoff}
            />
          ) : role === 'club' ? (
            <ClubAdmin page={page} go={go} />
          ) : role === 'sistema' ? (
            <SystemAdmin page={page} />
          ) : (
            <MainScreen page={page} open={open} go={go} run={setHandoff} />
          )}
        </main>
        <footer className="web-footer">
          <span>RUNCTY · LOJA, ECUADOR</span>
          <p>
            {isDemo
              ? 'Demo local · no guarda en el servidor'
              : 'Información referencial · Entrenamiento y SOS simulados'}
          </p>
          <button onClick={exit}>
            Cambiar experiencia <ArrowRight />
          </button>
        </footer>
      </div>
      {handoff && (
        <RunModal
          close={() => setHandoff(null)}
          mobile={() => {
            toMobile(handoff, true)
            setHandoff(null)
          }}
        />
      )}
      {notification && (
        <Modal title="Tu centro de novedades" onClose={() => setNotification(false)}>
          {state.moderation.length ? (
            state.moderation.slice(0, 5).map((m) => (
              <div key={m.id} className="notification-item">
                <Check />
                <div>
                  <strong>{m.item}</strong>
                  <p>
                    {m.decision} · {new Date(m.date).toLocaleString('es')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <>
              <Bell />
              <p>No tienes notificaciones nuevas. Las revisiones del club aparecerán aquí.</p>
            </>
          )}
          <DemoTag />
        </Modal>
      )}
    </div>
  )
}

function MobileApp({
  exit,
  toWeb,
  startPage = 'explore',
  initialRoute,
}: {
  exit: () => void
  toWeb: () => void
  startPage?: string
  initialRoute?: RouteData
}) {
  const { state, user, isDemo, update, notify, openAccount, startDemo } = useDemo(),
    all = useRoutes()
  const [page, setPage] = useState(startPage),
    [selected, setSelected] = useState<RouteData | null>(
      startPage === 'explore' ? (initialRoute ?? null) : null,
    )
  const active = state.session.phase === 'running' || state.session.phase === 'paused'
  const recording = page === 'train' && active
  const resolved = selected ? (all.find((r) => r.id === selected.id) ?? selected) : null
  const go = (target: string) => {
    if (
      !user &&
      ['train', 'myroutes', 'profile', 'security', 'history', 'report'].includes(target)
    ) {
      openAccount()
      return
    }
    if (target === 'recommend') update((s) => ({ ...s, draft: { ...s.draft, mode: 'recommend' } }))
    setPage(target)
    setSelected(null)
    document.querySelector('.mobile-scroll')?.scrollTo({ top: 0 })
  }
  const run = (route: RouteData) => {
    if (!user) {
      openAccount()
      return
    }
    if (!route?.geometry.length || route.km <= 0) {
      notify('Elige o crea una ruta antes de entrenar.')
      return
    }
    update((s) => ({
      ...s,
      session: { phase: 'ready', route, seconds: 0, km: 0, count: 3, time: s.time, date: s.date },
    }))
    setSelected(null)
    setPage('train')
    document.querySelector('.mobile-scroll')?.scrollTo({ top: 0 })
  }
  const leave = (fn: () => void) => {
    if (state.session.phase === 'running') {
      update((s) => ({ ...s, session: { ...s.session, phase: 'paused' } }))
      notify('Entrenamiento pausado al cambiar de experiencia.')
    }
    fn()
  }
  const nav = [
    { id: 'explore', label: 'Explorar', icon: Home },
    { id: 'myroutes', label: 'Mis rutas', icon: Route },
    { id: 'train', label: 'Entrenar', icon: FlagTriangleRight },
    { id: 'reports', label: 'Reportes', icon: ShieldAlert },
    { id: 'profile', label: 'Perfil', icon: CircleUserRound },
  ]
  useEffect(() => {
    if (!user) startDemo()
  }, [user, startDemo])
  return (
    <div className="mobile-stage">
      <div className="phone-container">
        <div className={`phone-frame ${recording ? 'phone-recording' : ''}`}>
          <div className="android-status">
            <span>9:41</span>
            <div className="camera-dot" />
            <span>
              5G <i className="status-signal" />
              <i className="status-battery" />
            </span>
          </div>
          <div className="mobile-scroll">
            {!recording && page !== 'train' && (
              <header className="mobile-app-header">
                {!resolved && ['explore', 'myroutes', 'reports', 'profile'].includes(page) ? (
                  <Logo />
                ) : (
                  <IconButton
                    label="Volver a explorar"
                    onClick={() => {
                      setSelected(null)
                      go('explore')
                    }}
                  >
                    <ArrowLeft />
                  </IconButton>
                )}
                <span>
                  {resolved
                    ? 'DETALLE DE RUTA'
                    : !['explore', 'myroutes', 'reports', 'profile'].includes(page)
                      ? 'RUNCTY'
                      : isDemo
                        ? 'DEMO LOCAL'
                        : ''}
                </span>
                <div>
                  <IconButton label="Novedades del club" onClick={() => go('club')}>
                    <Bell />
                  </IconButton>
                </div>
              </header>
            )}
            {!user && privatePages.concat('train').includes(page) ? (
              <div className="empty-state">
                <Shield />
                <h2>Tu actividad es privada.</h2>
                <p>Inicia sesión para continuar.</p>
                <Button onClick={openAccount}>Entrar como Carlos</Button>
              </div>
            ) : page === 'train' ? (
              <Training back={() => go('explore')} />
            ) : resolved ? (
              <RouteDetail route={resolved} mobile back={() => setSelected(null)} run={run} />
            ) : (
              <MainScreen
                page={page}
                mobile
                open={(r) => {
                  setSelected(r)
                  document.querySelector('.mobile-scroll')?.scrollTo({ top: 0 })
                }}
                go={go}
                run={run}
              />
            )}
          </div>
          {!recording && (
            <nav className="mobile-nav">
              {nav.map(({ id, label, icon: I }) => (
                <button
                  key={id}
                  aria-current={page === id ? 'page' : undefined}
                  className={
                    page === id ||
                    (id === 'explore' &&
                      ['map', 'planner', 'routes', 'spaces', 'club', 'recommend'].includes(page))
                      ? 'active'
                      : ''
                  }
                  onClick={() => go(id)}
                >
                  <I />
                  {label}
                  {id === 'train' && active && <i />}
                </button>
              ))}
            </nav>
          )}
          <div className="android-gesture" />
        </div>
      </div>
    </div>
  )
}

function Product({
  initialExperience,
  initialRoute,
  initialPage,
}: {
  initialExperience: Experience
  initialRoute?: RouteData
  initialPage: string
}) {
  const { state, user, update, openAccount } = useDemo()
  const router = useRouter()
  const enter = (experience: Experience) =>
    router.push(experience === 'selector' ? '/' : experience === 'web' ? '/explorar' : '/movil')
  const toMobile = (route?: RouteData, start = false) => {
    if (start && !user) {
      openAccount()
      return
    }
    if (route)
      update((s) => ({
        ...s,
        session: { phase: 'ready', route, seconds: 0, km: 0, count: 3, time: s.time, date: s.date },
      }))
    router.push(start ? '/movil/entrenar' : '/movil')
  }
  if (initialExperience === 'selector') return <Selector enter={enter} />
  if (initialExperience === 'mobile')
    return (
      <MobileApp
        key={initialPage}
        initialRoute={initialRoute}
        startPage={initialPage}
        exit={() => enter('selector')}
        toWeb={() => enter('web')}
      />
    )
  return (
    <WebApp
      initialPage={initialPage}
      initialRoute={initialRoute}
      exit={() => enter('selector')}
      toMobile={toMobile}
    />
  )
}
export default function App({
  initialExperience = 'web',
  initialPage = 'explore',
  initialRoute,
  initialSession,
}: {
  initialExperience?: Experience
  initialPage?: string
  initialRoute?: RouteData
  initialSession?: RunctySession
}) {
  const { hydrateSession } = useDemo()
  useEffect(() => {
    if (initialSession) hydrateSession(initialSession.data, initialSession.user)
  }, [initialSession, hydrateSession])
  return (
    <Product
      initialExperience={initialExperience}
      initialPage={initialPage}
      initialRoute={initialRoute}
    />
  )
}
