import { useEffect, useState } from 'react'
import ChannelSelect from './components/ChannelSelect.jsx'
import WhatsAppWizard from './components/WhatsAppWizard.jsx'
import InfobipBuilder from './components/InfobipBuilder.jsx'
import { loadKey, removeKey, saveKey } from './utils/storage.js'

const CHANNEL_KEY = 'ajo_channel'
const CHANNELS = ['whatsapp', 'infobip']

export default function App() {
  const [channel, setChannel] = useState(null)
  const [ready, setReady] = useState(false)

  // Restore the last selected channel so a reopened panel lands on the right flow.
  useEffect(() => {
    let alive = true
    loadKey(CHANNEL_KEY).then((c) => {
      if (alive && CHANNELS.includes(c)) setChannel(c)
      if (alive) setReady(true)
    })
    return () => {
      alive = false
    }
  }, [])

  function choose(c) {
    setChannel(c)
    saveKey(CHANNEL_KEY, c)
  }

  function changeChannel() {
    setChannel(null)
    removeKey(CHANNEL_KEY)
  }

  if (!ready) return null
  if (!channel) return <ChannelSelect onSelect={choose} />
  if (channel === 'whatsapp') return <WhatsAppWizard onChangeChannel={changeChannel} />
  return <InfobipBuilder onChangeChannel={changeChannel} />
}
