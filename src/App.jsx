import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'

function API(user, method, limit){
  return 'http://ws.audioscrobbler.com/2.0/?method='+method+'&user='+user+'&limit='+limit+'&api_key=26f69e5b01b21d81e270c03b0e31d09a&format=json'
}

function getArtistImage(x){
  const url = 'https://musicbrainz.org/ws/2/artist/' + x + '?inc=url-rels&fmt=json'
  // return url
  // let image = null
  // fetch(url,
  //     {mode: 'no-cors'}
  //   )
  //   .then((response) => {
  //     const relations = response.relations
  //     for(let x = 0; x < relations.length; x++){
  //       if(relations[x].url.resource.includes('https://commons.wikimedia.org/wiki/File:')){
  //         let imageUrl = relations[x].url.resource.substring(relations[x].url.resource.lastIndexOf('/') + 1)
  //         image = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/' + imageUrl
  //       }
  //     }
  //   }
  // )
  // return image
}

function App() {
  const [username, setUsername] = useState('')
  const [expandRecent, setExpandRecent] = useState(false)
  const [expandArtist, setExpandArtist] = useState(false)


  const [isLoading, setLoading] = useState(true)

  const [tracks, setTracks] = useState([])
  const [topArtists, setTopArtists] = useState([])

  useEffect(() => {
    function getUsername(){
      const params = new URLSearchParams(window.location.search);
      params.set('username', username);
      const newUrl = window.location.origin + window.location.pathname + (username.replace(/\s/g, '') !== '' ? '?' + params.toString() : '');
      window.history.pushState({}, '', newUrl);
    }

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

    async function getTopArtists(){
      if(username.replace(/\s/g, '') !== ''){
        await axios.get(API(username, 'user.gettopartists', (!expandArtist ? '5' : '10')))
        .then((response) => {
          // setTopArtists(response.data.topartists.artist.map(data => ({
          //   name: data.name,
          //   ...(data.mbid ? { 
          //     // image: getArtistImage(data.mbid),
          //     mbid: data.mbid,
          //   } : {}),            
          // })))
          setTopArtists(response.data.topartists.artist)
          setLoading(false)
        })
        .catch(error => {
          setLoading(true)
        })
      }
    }
    
    getUsername() 
    getRecent()
    getTopArtists()
  }, [username, expandRecent, expandArtist])

  return (
    <div className='container'>
      <header>
        <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Lastfm_logo.svg/2560px-Lastfm_logo.svg.png'/>
        <input value={username} onChange={ev => setUsername(ev.target.value)} placeholder='Enter lastfm username'/>
      </header>
      {
        !isLoading &&
        <>
          <h1>Currently Listening To</h1>
          {
            tracks[0] ?
            (
              <a href={tracks[0].url} target='_blank' title={tracks[0].artist['#text']+' - '+tracks[0].name}>
                <div className='card card-expand'>
                  <img src={tracks[0].image[1]['#text']} />
                  <div>
                    <p><strong>{tracks[0].name}</strong></p>
                    <p>{tracks[0].artist['#text']}</p>
                  </div>
                </div>
              </a>
            )
            :
            (
              <></>
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
                    <h3>{artist.name}</h3>
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
        </>
      }
    </div>
  )
}

export default App
