import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'

function API(user, method, limit){
  return 'http://ws.audioscrobbler.com/2.0/?method='+method+'&user='+user+'&limit='+limit+'&api_key=26f69e5b01b21d81e270c03b0e31d09a&format=json'
}

function App() {
  const [username, setUsername] = useState('')
  const [expandRecent, setExpandRecent] = useState(false)
  const [expandArtist, setExpandArtist] = useState(false)


  const [isLoading, setLoading] = useState(true)

  const [tracks, setTracks] = useState([])
  const [topArtists, setTopArtists] = useState([])
  const [chart, setChart] = useState([])

  useEffect(() => {
    function getUsername(){
      const params = new URLSearchParams(window.location.search);
      params.set('username', username);
      const newUrl = window.location.origin + window.location.pathname + (username.replace(/\s/g, '') !== '' ? '?' + params.toString() : '');
      window.history.pushState({}, '', newUrl);
    }
    getUsername() 
  }, [username])

  useEffect(() => {
    async function getRecent(){
      if(username.replace(/\s/g, '') !== ''){
        await axios.get(API(username, 'user.getrecenttracks', (!expandRecent ? '9' : '30')))
        .then((response) => {
          setTracks(response.data.recenttracks.track)
          setLoading(false)
        })
        .catch(error => {
          setLoading(true)
        })
      }
      else{
        setLoading(true)
      }
    }
    getRecent()

    const interval = setInterval(getRecent, 5000)
    return () => clearInterval(interval)
  }, [username, expandRecent])

  useEffect(() => {
    async function getTopArtists(){
      if(username.replace(/\s/g, '') !== ''){
        await axios.get(API(username, 'user.gettopartists', (!expandArtist ? '5' : '20')))
        .then((response) => {
          // setTopArtists(response.data.topartists.artist.map(data => ({
          //   name: data.name,
          //   ...(data.mbid ? { 
          //     // image: getArtistImage(data.mbid),
          //     mbid: data.mbid,
          //   } : {}),            
          // })))
          setTopArtists(response.data.topartists.artist)
        })
      }
    }
    getTopArtists()
  }, [username, expandArtist])

  // useEffect(() => {
  //   async function getImage(id, name, artist){
  //     const api = 'http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=26f69e5b01b21d81e270c03b0e31d09a&format=json'
  //     const response = await axios.get(api + (id !== null ? '&mbid=' + id : '&album=' + name + '&artist=' + artist))
  //     return response.data.album.image[3]['#text']
  //   }

  //   async function getChart(){
  //     if(username.replace(/\s/g, '') !== ''){
  //       const response = await axios.get(API(username, 'user.getweeklyalbumchart', (!expandArtist ? '25' : '25')))
  //       const fillChart = await Promise.all(response.data.weeklyalbumchart.album.map(async (album) => {
  //         let image = null
  //         if(album.mbid){
  //           image = await getImage(album.mbid, null, null)
  //         }
  //         else{
  //           // image = await getImage(null, album.name, album.artist['#text'])
  //         }
  //         return {
  //           name: album.name,
  //           artist: album.artist['#text'],
  //           mbid: album.mbid,
  //           image,
  //         };
  //       }))
  //       setChart(fillChart)
  //     }
  //   }

  //   getChart()
  // }, [username])

  useEffect(() => {
    const api = 'http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&api_key=26f69e5b01b21d81e270c03b0e31d09a&format=json&limit=25&period=7day'
    async function getChart(){
      if(username.replace(/\s/g, '') !== ''){
        await axios.get(api + '&user=' + username)
        .then((response) => {
          setChart(response.data.topalbums.album)
        })
      }
    }
    getChart()
  }, [username])

  return (
    <div className='container'>
      <header>
        <a href='https://last.fm' target='_blank' title='last.fm'><img src='https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Lastfm_logo.svg/2560px-Lastfm_logo.svg.png'/></a>
        <input value={username} onChange={ev => setUsername(ev.target.value)} placeholder='Enter lastfm username'/>
      </header>
      {
        !isLoading &&
        <>
          {
            tracks[0] && tracks[0].hasOwnProperty('@attr') ?
            (
              <>
                <h1>Currently Listening To</h1>
                <a href={tracks[0].url} target='_blank' title={tracks[0].artist['#text']+' - '+tracks[0].name}>
                  <div className='card card-expand'>
                    <img src={tracks[0].image[1]['#text']} />
                    <div>
                      <p><strong>{tracks[0].name}</strong></p>
                      <p>{tracks[0].artist['#text']}</p>
                    </div>
                  </div>
                </a>
              </>
            )
            :
            (
              <>
              </>
            )
          }
          <h1>Recent Tracks</h1>
          <div className='card-list'>
            {
              tracks.map((track, index) => 
              !track['@attr'] && //removes currently playing song
              (
                <a key={index} href={track.url} target='_blank' title={track.artist['#text']+' - '+track.name}>
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
          <div className='artists-list'>
            {
              topArtists.map((artist, index) => (
                <a key={index} href={artist.url} target='_blank' title={artist.name}>
                  <div className='artist-card'>
                    {/* <img src={artist.image} alt='hello'/> */}
                    {/* <a href={artist.image}>Click me</a> */}
                    <p><strong>{artist.name}</strong></p>
                    <p>{artist.playcount} Scrobbles</p>
                    {/* <p>{artist.mbid}</p> */}
                  </div>
                </a>
              )) 
            }
          </div>
          <div className='center'>
            <button type='button' onClick={ev => setExpandArtist(!expandArtist)}>{!expandArtist ? 'Expand..' : 'Show Less..'}</button>
          </div>
          <h1>Weekly Chart</h1>
          <div className='chart'>
            {
              chart.map((album, index) => (
                <div key={index} className='album' style={{backgroundImage: 'url('+album.image[3]['#text']+')'}}>
                  <p>{album.name}</p>
                  <p>{album.artist.name}</p>
                </div>
              ))
            }
          </div>
        </>
      }
    </div>
  )
}

export default App
