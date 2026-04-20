import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FlaskConical, CheckCircle2, AlertCircle, Loader2, X, Plus } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { useAuth } from '../hooks/useAuth'
import { useBrokers } from '../hooks/useInsights'
import { supabase } from '../lib/supabase'

// ─── Tab types ──────────────────────────────────────────────────────────────
type Tab = 'crm' | 'erp' | 'market'

// ─── Form state types ────────────────────────────────────────────────────────
interface CRMForm {
  client_name: string
  location: string
  property_type: string
  bedrooms: string
  min_budget: string
  max_budget: string
  intent_level: string
  duration_months: string
  purpose: string
  target: string
}

interface ERPForm {
  community: string
  property_name: string
  developer: string
  property_type: string
  pipeline_status: string
  unit_no: string
  floor: string
  bedrooms: string
  size_sqft: string
  asking_price_aed: string
  listing_status: string
}

interface MarketForm {
  transaction_type: string
  transaction_date: string
  community: string
  property_name: string
  property_type: string
  unit_no: string
  bedrooms: string
  size_sqft: string
  amount_aed: string
  aed_per_sqft: string
  sales_sequence: string
}

// ─── Defaults ────────────────────────────────────────────────────────────────
const defaultCRM: CRMForm = {
  client_name: '', location: '', property_type: 'Apartment',
  bedrooms: '1', min_budget: '', max_budget: '', intent_level: 'high',
  duration_months: '12', purpose: 'Investment', target: '',
}

const defaultERP: ERPForm = {
  community: '', property_name: '', developer: '', property_type: 'Apartment',
  pipeline_status: 'Existing', unit_no: '', floor: '', bedrooms: '1',
  size_sqft: '', asking_price_aed: '', listing_status: 'Available',
}

const defaultMarket: MarketForm = {
  transaction_type: 'Sales - Ready', transaction_date: '', community: '',
  property_name: '', property_type: 'Apartment', unit_no: '', bedrooms: '1',
  size_sqft: '', amount_aed: '', aed_per_sqft: '', sales_sequence: 'Primary',
}

// ─── Shared field styles ─────────────────────────────────────────────────────
const INPUT =
  'w-full bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] transition-colors'
const SELECT =
  'w-full bg-[#0e0e1c] border border-white/[0.10] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors appearance-none'
const LABEL = 'block text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-1.5'
const GRID2 = 'grid grid-cols-1 sm:grid-cols-2 gap-4'

// ─── Community / Location combobox ──────────────────────────────────────────
const COMMUNITY_LIST = [
  'Business Bay', 'Dubai Marina', 'Jumeirah Village Circle',
  'Downtown Dubai', 'Palm Jumeirah', 'DIFC',
  'Jumeirah Lake Towers', 'Arabian Ranches', 'Meydan', 'Dubai Hills Estate',
]

function CommunityInput({
  value, onChange, required, placeholder,
}: {
  value: string
  onChange: (v: string) => void
  required?: boolean
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const filtered = value.trim()
    ? COMMUNITY_LIST.filter(c => c.toLowerCase().includes(value.toLowerCase()))
    : COMMUNITY_LIST

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  return (
    <div className="relative" ref={wrapRef}>
      <input
        className={INPUT}
        placeholder={placeholder ?? 'e.g. Dubai Marina'}
        value={value}
        required={required}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
      />
      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#12121f] border border-white/[0.10] rounded-lg shadow-xl overflow-hidden">
          {filtered.map(c => (
            <button
              key={c}
              type="button"
              onMouseDown={() => { onChange(c); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/[0.07] transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Mock data banner ────────────────────────────────────────────────────────
function MockBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3 mb-6">
      <FlaskConical size={16} className="text-amber-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-semibold text-amber-300">Mock / Testing Mode</p>
        <p className="text-[11px] text-amber-200/50 mt-0.5 leading-relaxed">
          The data entered here is only for simple testing purposes.
        </p>
      </div>
    </div>
  )
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm font-medium shadow-xl backdrop-blur-md transition-all ${
        type === 'success'
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          : 'border-red-500/30 bg-red-500/10 text-red-300'
      }`}
    >
      {type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {message}
    </div>
  )
}

// ─── CRM Form ────────────────────────────────────────────────────────────────
function CRMFormPanel() {
  const [form, setForm] = useState<CRMForm>(defaultCRM)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function set(field: keyof CRMForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.location || !form.property_type || !form.bedrooms) {
      showToast('error', 'Location, property type and bedrooms are required.')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('crm_mandates').insert({
      client_name:     form.client_name || null,
      location:        form.location,
      property_type:   form.property_type,
      bedrooms:        parseInt(form.bedrooms),
      min_budget:      form.min_budget ? parseFloat(form.min_budget) : null,
      max_budget:      form.max_budget ? parseFloat(form.max_budget) : null,
      intent_level:    form.intent_level || null,
      duration_months: form.duration_months ? parseInt(form.duration_months) : null,
      purpose:         form.purpose || null,
      target:          form.target ? parseFloat(form.target) : null,
      target_type:     'PCT',
    })
    setSaving(false)
    if (error) { showToast('error', error.message); return }
    showToast('success', 'CRM mandate added successfully.')
    setForm(defaultCRM)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className={GRID2}>
          <div>
            <label className={LABEL}>Client Name</label>
            <input className={INPUT} placeholder="e.g. Olivia Bennett" value={form.client_name}
              onChange={e => set('client_name', e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Location <span className="text-red-400">*</span></label>
            <CommunityInput value={form.location} onChange={v => set('location', v)} required />
          </div>
        </div>

        <div className={GRID2}>
          <div>
            <label className={LABEL}>Property Type <span className="text-red-400">*</span></label>
            <select className={SELECT} value={form.property_type} onChange={e => set('property_type', e.target.value)}>
              <option>Apartment</option>
              <option>Villa</option>
              <option>Serviced/Hotel Apartment</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Bedrooms <span className="text-red-400">*</span></label>
            <select className={SELECT} value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}>
              <option value="0">Studio (0)</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5+</option>
            </select>
          </div>
        </div>

        <div className={GRID2}>
          <div>
            <label className={LABEL}>Min Budget (AED)</label>
            <input className={INPUT} type="number" placeholder="e.g. 800000" value={form.min_budget}
              onChange={e => set('min_budget', e.target.value)} onWheel={e => e.currentTarget.blur()} />
          </div>
          <div>
            <label className={LABEL}>Max Budget (AED)</label>
            <input className={INPUT} type="number" placeholder="e.g. 1200000" value={form.max_budget}
              onChange={e => set('max_budget', e.target.value)} onWheel={e => e.currentTarget.blur()} />
          </div>
        </div>

        <div className={GRID2}>
          <div>
            <label className={LABEL}>Intent Level</label>
            <select className={SELECT} value={form.intent_level} onChange={e => set('intent_level', e.target.value)}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Duration (months)</label>
            <input className={INPUT} type="number" placeholder="e.g. 12" value={form.duration_months}
              onChange={e => set('duration_months', e.target.value)} onWheel={e => e.currentTarget.blur()} />
          </div>
        </div>

        <div className={GRID2}>
          <div>
            <label className={LABEL}>Purpose</label>
            <select className={SELECT} value={form.purpose} onChange={e => set('purpose', e.target.value)}>
              <option value="">None</option>
              <option>Self Used</option>
              <option>Rental yield</option>
              <option>Investment</option>
              <option>Investment+Rental yield</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Yield Target (%)</label>
            <input className={INPUT} type="number" step="0.1" placeholder="e.g. 6.5" value={form.target}
              onChange={e => set('target', e.target.value)} onWheel={e => e.currentTarget.blur()} />
          </div>
        </div>

        <div className="pt-2">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Saving…' : 'Add CRM Mandate'}
          </button>
        </div>
      </form>
      {toast && <Toast type={toast.type} message={toast.message} />}
    </>
  )
}

// ─── ERP Form ────────────────────────────────────────────────────────────────
function ERPFormPanel() {
  const [form, setForm] = useState<ERPForm>(defaultERP)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function set(field: keyof ERPForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.community || !form.property_name || !form.bedrooms) {
      showToast('error', 'Community, property name and bedrooms are required.')
      return
    }
    setSaving(true)
    const payload: Record<string, unknown> = {
      community:        form.community,
      property_name:    form.property_name,
      developer:        form.developer || null,
      property_type:    form.property_type || null,
      pipeline_status:  form.pipeline_status || null,
      unit_no:          form.unit_no || null,
      floor:            form.floor ? parseInt(form.floor) : null,
      bedrooms:         parseInt(form.bedrooms),
      size_sqft:        form.size_sqft ? parseFloat(form.size_sqft) : null,
      asking_price_aed: form.asking_price_aed ? parseFloat(form.asking_price_aed) : null,
      listing_status:   form.listing_status,
    }
    // Derive price_per_sqft if both values present
    if (payload.asking_price_aed && payload.size_sqft) {
      payload.price_per_sqft = parseFloat(
        ((payload.asking_price_aed as number) / (payload.size_sqft as number)).toFixed(2)
      )
    }
    const { error } = await supabase.from('erp_inventory').insert(payload)
    setSaving(false)
    if (error) { showToast('error', error.message); return }
    showToast('success', 'ERP inventory unit added successfully.')
    setForm(defaultERP)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className={GRID2}>
          <div>
            <label className={LABEL}>Community <span className="text-red-400">*</span></label>
            <CommunityInput value={form.community} onChange={v => set('community', v)} required />
          </div>
          <div>
            <label className={LABEL}>Property Name <span className="text-red-400">*</span></label>
            <input className={INPUT} placeholder="e.g. Marina Gate 1" value={form.property_name}
              onChange={e => set('property_name', e.target.value)} required />
          </div>
        </div>

        <div className={GRID2}>
          <div>
            <label className={LABEL}>Developer</label>
            <input className={INPUT} placeholder="e.g. Select Group" value={form.developer}
              onChange={e => set('developer', e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Property Type</label>
            <select className={SELECT} value={form.property_type} onChange={e => set('property_type', e.target.value)}>
              <option>Apartment</option>
              <option>Villa</option>
              <option>Serviced/Hotel Apartment</option>
            </select>
          </div>
        </div>

        <div className={GRID2}>
          <div>
            <label className={LABEL}>Pipeline Status</label>
            <select className={SELECT} value={form.pipeline_status} onChange={e => set('pipeline_status', e.target.value)}>
              <option>Existing</option>
              <option>Under Construction</option>
              <option>Planning</option>
              <option>On-hold</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Listing Status</label>
            <select className={SELECT} value={form.listing_status} onChange={e => set('listing_status', e.target.value)}>
              <option>Available</option>
              <option>Reserved</option>
              <option>Sold</option>
              <option>Leased</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className={LABEL}>Unit No</label>
            <input className={INPUT} placeholder="e.g. 1204" value={form.unit_no}
              onChange={e => set('unit_no', e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Floor</label>
            <input className={INPUT} type="number" placeholder="e.g. 12" value={form.floor}
              onChange={e => set('floor', e.target.value)} onWheel={e => e.currentTarget.blur()} />
          </div>
          <div>
            <label className={LABEL}>Bedrooms <span className="text-red-400">*</span></label>
            <select className={SELECT} value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}>
              <option value="0">Studio</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5+</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Size (sqft)</label>
            <input className={INPUT} type="number" placeholder="e.g. 750" value={form.size_sqft}
              onChange={e => set('size_sqft', e.target.value)} onWheel={e => e.currentTarget.blur()} />
          </div>
        </div>

        <div>
          <label className={LABEL}>Asking Price (AED)</label>
          <input className={INPUT} type="number" placeholder="e.g. 1500000" value={form.asking_price_aed}
            onChange={e => set('asking_price_aed', e.target.value)} onWheel={e => e.currentTarget.blur()} />
        </div>

        <div className="pt-2">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Saving…' : 'Add ERP Unit'}
          </button>
        </div>
      </form>
      {toast && <Toast type={toast.type} message={toast.message} />}
    </>
  )
}

// ─── Market Form ─────────────────────────────────────────────────────────────
function MarketFormPanel() {
  const [form, setForm] = useState<MarketForm>(defaultMarket)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function set(field: keyof MarketForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleSubmitTransaction(e: React.FormEvent) {
    e.preventDefault()
    if (!form.community || !form.property_name || !form.amount_aed || !form.transaction_date) {
      showToast('error', 'Community, property name, date and amount are required.')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('market_transactions').insert({
      transaction_type: form.transaction_type,
      transaction_date: form.transaction_date,
      community:        form.community,
      property_name:    form.property_name,
      property_type:    form.property_type || null,
      unit_no:          form.unit_no || null,
      bedrooms:         form.bedrooms ? parseInt(form.bedrooms) : null,
      size_sqft:        form.size_sqft ? parseFloat(form.size_sqft) : null,
      amount_aed:       parseFloat(form.amount_aed),
      aed_per_sqft:     form.aed_per_sqft ? parseFloat(form.aed_per_sqft) : null,
      sales_sequence:   form.sales_sequence || null,
    })
    setSaving(false)
    if (error) { showToast('error', error.message); return }
    showToast('success', 'Transaction added successfully.')
    setForm(prev => ({ ...prev, community: '', property_name: '', unit_no: '',
      size_sqft: '', amount_aed: '', aed_per_sqft: '', transaction_date: '' }))
  }

  return (
    <>
      <form onSubmit={handleSubmitTransaction} className="space-y-4">
          <div className={GRID2}>
            <div>
              <label className={LABEL}>Transaction Type</label>
              <select className={SELECT} value={form.transaction_type} onChange={e => set('transaction_type', e.target.value)}>
                <option>Sales - Ready</option>
                <option>Sales - Off-Plan</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Sales Sequence</label>
              <select className={SELECT} value={form.sales_sequence} onChange={e => set('sales_sequence', e.target.value)}>
                <option>Primary</option>
                <option>Secondary</option>
              </select>
            </div>
          </div>

          <div className={GRID2}>
            <div>
              <label className={LABEL}>Community <span className="text-red-400">*</span></label>
              <CommunityInput value={form.community} onChange={v => set('community', v)} required />
            </div>
            <div>
              <label className={LABEL}>Property Name <span className="text-red-400">*</span></label>
              <input className={INPUT} placeholder="e.g. Canal Crown 1" value={form.property_name}
                onChange={e => set('property_name', e.target.value)} required />
            </div>
          </div>

          <div className={GRID2}>
            <div>
              <label className={LABEL}>Transaction Date <span className="text-red-400">*</span></label>
              <input className={INPUT} type="date" value={form.transaction_date}
                onChange={e => set('transaction_date', e.target.value)} required />
            </div>
            <div>
              <label className={LABEL}>Property Type</label>
              <select className={SELECT} value={form.property_type} onChange={e => set('property_type', e.target.value)}>
                <option>Apartment</option>
                <option>Villa</option>
                <option>Serviced/Hotel Apartment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className={LABEL}>Unit No</label>
              <input className={INPUT} placeholder="e.g. 1204" value={form.unit_no}
                onChange={e => set('unit_no', e.target.value)} />
            </div>
            <div>
              <label className={LABEL}>Bedrooms</label>
              <select className={SELECT} value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}>
                <option value="0">Studio</option>
                <option value="1">1 B/R</option>
                <option value="2">2 B/R</option>
                <option value="3">3 B/R</option>
                <option value="4">4 B/R</option>
                <option value="5">5+ B/R</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Size (sqft)</label>
              <input className={INPUT} type="number" placeholder="e.g. 750" value={form.size_sqft}
                onChange={e => set('size_sqft', e.target.value)} onWheel={e => e.currentTarget.blur()} />
            </div>
            <div>
              <label className={LABEL}>AED / sqft</label>
              <input className={INPUT} type="number" placeholder="e.g. 1850" value={form.aed_per_sqft}
                onChange={e => set('aed_per_sqft', e.target.value)} onWheel={e => e.currentTarget.blur()} />
            </div>
          </div>

          <div>
            <label className={LABEL}>Amount (AED) <span className="text-red-400">*</span></label>
            <input className={INPUT} type="number" placeholder="e.g. 1500000" value={form.amount_aed}
              onChange={e => set('amount_aed', e.target.value)} onWheel={e => e.currentTarget.blur()} required />
          </div>

          <div className="pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Saving…' : 'Add Transaction'}
            </button>
          </div>
        </form>
      {toast && <Toast type={toast.type} message={toast.message} />}
    </>
  )
}

// ─── Profile / Focus Areas panel ────────────────────────────────────────────
function ProfilePanel({ broker }: { broker: { id: string; name: string; email: string; focus_areas: string[] } | undefined }) {
  const [areas, setAreas] = useState<string[]>(broker?.focus_areas ?? [])
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Sync if broker loads after mount
  useEffect(() => {
    if (broker?.focus_areas) setAreas(broker.focus_areas)
  }, [broker?.id])

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  function addArea() {
    const v = input.trim()
    if (!v) return
    if (areas.some(a => a.toLowerCase() === v.toLowerCase())) {
      setInput('')
      return
    }
    setAreas(prev => [...prev, v])
    setInput('')
  }

  function removeArea(idx: number) {
    setAreas(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSave() {
    if (!broker) { showToast('error', 'Broker not loaded.'); return }
    setSaving(true)
    const { error } = await supabase
      .schema('ai')
      .from('brokers')
      .update({ focus_areas: areas })
      .eq('id', broker.id)
    setSaving(false)
    if (error) { showToast('error', error.message); return }
    showToast('success', 'Focus areas updated. Re-run the pipeline to apply.')
  }

  return (
    <>
      <div className="space-y-5">
        {/* Info banner */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-[12px] text-amber-200/60 leading-relaxed">
          <strong className="text-amber-300 font-semibold">Focus areas</strong> tell the pipeline which communities you already work in.
          The <span className="text-amber-300">Reallocate Focus</span> insight fires when a community <em>outside</em> your focus list outperforms your best focus-area score.
          Update this list and re-run the pipeline to see new recommendations.
        </div>


        {/* Current focus areas */}
        <div>
          <label className={LABEL}>Focus Areas</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {areas.length === 0 && (
              <span className="text-xs text-white/25 italic">No focus areas set — pipeline uses top 3 communities by inventory count.</span>
            )}
            {areas.map((a, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                {a}
                <button type="button" onClick={() => removeArea(i)} className="text-purple-400/60 hover:text-purple-300 transition-colors">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>

          {/* Add new area */}
          <div className="flex gap-2">
            <div className="relative flex-1" >
              <CommunityInput
                value={input}
                onChange={setInput}
                placeholder="Add community e.g. Palm Jumeirah"
              />
            </div>
            <button
              type="button"
              onClick={addArea}
              className="flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-300 hover:bg-purple-500/20 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>

        {/* Save */}
        <div className="pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Saving…' : 'Save Focus Areas'}
          </button>
        </div>
      </div>
      {toast && <Toast type={toast.type} message={toast.message} />}
    </>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
const TABS: { key: Tab; label: string; desc: string }[] = [
  { key: 'crm',    label: 'CRM',    desc: 'Client mandates & buyer intent' },
  { key: 'erp',    label: 'ERP',    desc: 'Inventory units & listings' },
  { key: 'market', label: 'Market', desc: 'Transactions & occupancy' },
]

export function DataInputPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { brokers } = useBrokers()
  const broker = brokers.find(b => b.email === user?.email) ?? brokers[0]
  const displayName =
    user?.user_metadata?.name?.trim() || broker?.name || user?.email?.split('@')[0] || ''

  const [activeTab, setActiveTab] = useState<Tab>('crm')

  return (
    <div className="min-h-screen px-gradient-bg flex flex-col">
      <Header brokerName={displayName} onSignOut={signOut} />

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-[720px]">

          {/* Page header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/')}
              className="rounded-full p-2 text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-colors cursor-pointer"
              title="Back to dashboard"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">Data Input</h1>
              <p className="text-[11px] text-white/25 uppercase tracking-widest font-medium mt-0.5">
                CRM · ERP · Market
              </p>
            </div>
          </div>

          <MockBanner />

          {/* Tab bar */}
          <div className="flex gap-2 mb-6">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 rounded-xl border px-4 py-3 text-left transition-all cursor-pointer ${
                  activeTab === t.key
                    ? 'border-purple-500/40 bg-purple-500/[0.08]'
                    : 'border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <p className={`text-sm font-bold ${activeTab === t.key ? 'text-purple-300' : 'text-white/50'}`}>
                  {t.label}
                </p>
                <p className={`text-[11px] mt-0.5 ${activeTab === t.key ? 'text-white/40' : 'text-white/20'}`}>
                  {t.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Form panel */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
            {activeTab === 'crm'    && <CRMFormPanel />}
            {activeTab === 'erp'    && <ERPFormPanel />}
            {activeTab === 'market' && <MarketFormPanel />}
          </div>

        </div>
      </main>
    </div>
  )
}
