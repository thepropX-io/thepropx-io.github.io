import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface Broker {
  id: string
  name: string
  email: string | null
  user_id: string | null
  focus_areas: string[]
  created_at: string
  updated_at: string
}

export function useBroker(user: User | null) {
  // Start as loading so AuthGuard shows Loader while we fetch on first mount
  const [broker, setBroker] = useState<Broker | null>(null)
  const [brokerLoading, setBrokerLoading] = useState(true)
  const [focusAreaOptions, setFocusAreaOptions] = useState<string[]>([])

  useEffect(() => {
    if (!user) {
      setBroker(null)
      setFocusAreaOptions([])
      setBrokerLoading(false)
      return
    }

    setBrokerLoading(true)

    Promise.all([
      supabase.rpc('get_my_broker'),
      supabase.rpc('get_focus_area_options'),
    ]).then(([brokerRes, optionsRes]) => {
      // get_my_broker returns a composite row or null
      const row = brokerRes.data as Broker | null
      setBroker(row?.id ? row : null)
      setFocusAreaOptions((optionsRes.data as string[] | null) ?? [])
      setBrokerLoading(false)
    })
  }, [user?.id])

  const createBroker = useCallback(async (name: string, focusAreas: string[]) => {
    const { data, error } = await supabase.rpc('create_my_broker', {
      p_name: name,
      p_focus_areas: focusAreas,
    })
    if (error) {
      // On a constraint conflict (FK violation from stale JWT, or unique violation
      // from a double-submit), try reading back the row before surfacing the error.
      if (error.code === '23503' || error.code === '23505') {
        const { data: existing } = await supabase.rpc('get_my_broker')
        const row = existing as Broker | null
        if (row?.id) {
          setBroker(row)
          return
        }
      }
      throw error
    }
    const row = data as Broker | null
    setBroker(row?.id ? row : null)
  }, [])

  return { broker, brokerLoading, createBroker, focusAreaOptions }
}
