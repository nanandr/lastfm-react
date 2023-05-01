import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [tracks, setTracks] = useState([])
  const [username, setUsername] = useState('RafYour')
  const [expandRecent, setExpandRecent] = useState(false)

  useEffect(() => {
    async function getData(){
      const response = await axios.get('http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user='+username+'&limit='+(!expandRecent ?'15' : '45')+'&api_key=26f69e5b01b21d81e270c03b0e31d09a&format=json')
      setTracks(response.data.recenttracks.track)
    } 
    getData()
  }, [username, expandRecent])

  return (
    <div className='container'>
      <header>
        <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Lastfm_logo.svg/2560px-Lastfm_logo.svg.png'/>
        <input value={username} onChange={ev => setUsername(ev.target.value)} placeholder='Enter lastfm username'/>
      </header>
      <h1>Recent Tracks</h1>
      <div className='card-list'>
        {
          tracks.map((track) => (
            <a href={track.url} target='_blank'>
              <div className='card'>
                <img src={track.image[1]['#text']} />
                <div>
                  <p><strong>{track.name}</strong></p>
                  <p>{track.artist['#text']}</p>
                </div>
              </div>
            </a>
          ))
        }
      </div>
      <div className='center'>
        <button type='button' onClick={ev => setExpandRecent(!expandRecent)}>{!expandRecent ? 'Expand..' : 'Show Less..'}</button>
      </div>
      <h1>Favorite Artists</h1>
    </div>
  )
}

export default App
