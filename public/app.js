const mainDiv = document.getElementById('main')

const render = html => {
  mainDiv.innerHTML = html
}

const makePlaylistCard = item => `
    <div class="col-md-4">
        <div class="card mb-4 box-shadow">
            <div class="card-body">
                <p class="card-text">${item.titre}</p>
                <p>${item.genre}</a>
                <br>
                <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#modal${item.playlistId}">
                    Lancer ma playlist
                </button>
                <div class="modal fade" id="modal${item.playlistId}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLabel">${item.titre}</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <iframe width="480" height="270" src="${item.url}" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
    
const makeWilder = item => `
<div class="col-12 col-sm-12 col-md-3">
  <div class="card-deck" >
    <div class="card">
      <div class="card">
          <div class="card-body">
              <img class="card-img-fluid-top" src="${item.avatar}" alt="Card image">
              <h5 class="card-title">${item.pseudo}</h5>
              <p class="card-text">${item.bio}</p>
              <a href="/viewplaylists/${item.pseudo.toLowerCase()}" class="btn btn-primary">Voir mes playlists</a>
          </div>
      </div>
    </div>    
  </div>
</div>    
    `
const makeCardMember = item => `
    <div class="card">
        <img class="card-img-top" src="${item.avatar}" alt="Card image">
        <div class="card-body">
            <h4 class="card-title">${item.pseudo}</h4>
            <p class="card-text">${item.bio}</p>
            <a href="/viewplaylists/${item.pseudo.toLowerCase()}" class="btn btn-primary">Voir mes playlists</a>
        </div>
    </div>
        `

const makeWinningCard = item => `
    <div class="col-12 col-sm-12 col-md-4">
        <div class="card">
            <img class="card-img-top" src="https://png.pngtree.com/element_origin_min_pic/17/07/23/473f204a1589862d0264b14f926b4b59.jpg" alt="Card image">
            <div class="card-body">
                <h4 class="card-title">${item.playlists[0].titre}</h4>
                <p class="card-text">${item.playlists[0].nbrevotes} votes</p>
                <a href="https://${item.playlists[0].url}" target="_blank" class="btn btn-primary">Voir la playlist</a>
            </div>
        </div>
      </div>
        `

const serializeForm = form => {
  const data = {}
  const elements = form.getElementsByClassName('form-control')
  for (let el of elements) {
    data[el.name] = el.value
  }
  return data
}

const controllers = {
    '/': () => {
        let resultPlaylistCompete
        fetch('/playlistsCompete')
        .then(res => res.json())
        .then(result => result.reduce((carry, user) => carry + user))
        .then(user => {
            resultPlaylistCompete = user
            console.log(resultPlaylistCompete)
        })
        fetch('/connected')
        .then(res => res.json())
        .then(connectedMember => {
            render(`
                <div class="container">
                    <div class="container text-center">
                        <div class="row">
                            <button type="button" id="hidePlaylist" class="btn btn-warning">La playlist gagnante de la semaine est : ${resultPlaylistCompete.playlists[0].titre} - Elle a obtenu ${resultPlaylistCompete.playlists[0].nbrevotes} votes</button>
                        </div>
                    </div>
                    <br/>
                    <h1>Bienvenue ${connectedMember[0].pseudo}</h1>
                    <h2>Ce que vous pouvez faire:</h2>
                    <ul>
                        <li> 
                            Ajouter une playlist sur votre page profil
                        </li>
                        <li>
                            Consulter la page membre
                        </li>
                    </ul>
                </div>`
            )
        })

      },
    '/monprofil': () => {
        fetch('/connected')
        .then(res => res.json())
        .then(membre => makeCardMember(membre[0]))
        .then(mesInfos => render(
            `
            <div class="container">
                <div class="row">
                        ${mesInfos}
                    </div>
                    <br/>
                    <p><a class="btn btn-success btn-lg" href="/editer-mon-profil" role="button">Editer mon profil</a></p>
                    <p><a class="btn btn-success btn-lg" href="/newplaylist" role="button">Ajouter une playlist »</a></p>
                </div>
            </div>`
        ))
    },
    '/editer-mon-profil': () => {
        render(`
            <div class="container">
                <div id="alert-box" class="hidden">
                </div>
                <form id="editMyProfile">
                    <div class="form-group col-md-9 ">
                        <label for="inputPseudo">Pseudo</label>
                        <input name="pseudo" type="text " class="form-control " id="inputPseudo" placeholder="Enter your pseudo ">
                    </div>             
                    <div class="form-group col-md-9">
                        <label for="inputBio">Bio</label>
                        <textarea name="bio" class="form-control" id="inputBio " placeholder="Bio"></textarea>
                    </div>
                <div class="form-group col-md-9 ">
                    <label for="inputAvatar ">Avatar</label>
                    <input name="avatar" type="text " class="form-control " id="inputAvatar" placeholder="Enter image URL ">
                </div>
                <div class="form-group col-md-3 ">
                    <button type="submit " class="btn btn-primary ">Submit</button>
                </div>
            </form>
        </div>
        `)
        const formProfile = document.getElementById('editMyProfile')
        formProfile.addEventListener('submit', e => {
            e.preventDefault()
            const data = serializeForm(formProfile)
            if(! data.avatar) {
                const fullName = encodeURIComponent(`${data.bio} ${data.pseudo}`)
                data.avatar = `https://via.placeholder.com/640x480/?text=${fullName}`
            }
            fetch('/membres', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data) 
            })
            .then(res => res.json())
            .then(wilderEdition => {
            const alertBox = document.getElementById('alert-box')
            alertBox.className = 'alert alert-success'
            alertBox.innerHTML = `${wilderEdition.pseudo}, votre profil titre été édité.`
            })
        })
    },
    '/newplaylist': () => {
        render(`
            <div class="container">
            <div id="alert-box" class="hidden">
            </div>
            <form id="add-playlist">
                <div class="form-group">
                <label for="inputTitle">Titre</label>
                <input name="title" type="text" class="form-control" id="inputTitle" placeholder="Entrez le titre de votre playlist">
                </div>
                <div class="form-group">
                <label for="inputGenre">Genre musical</label>
                <input name="genre" type="text" class="form-control" id="inputGenre" placeholder="Quel est le genre de votre playlist ?">
                </div>
                <div class="form-group">
                    <label for="inputUrl">Url de votre playlist</label>
                    <input name="url" type="text" class="form-control" id="inputUrl" placeholder="Entrez l'url de votre playlist">
                </div>
                <div class="form-group">
                    <label for="competition">Concourir avec cette playlist?</label>
                    <input name="competition" type="radio" id="competition" class="form-control" value="true">
                </div>        
                <button type="submit" class="btn btn-primary">Submit</button>
            </form>
            <a class="btn btn-success btn-lg" href="/" role="button">retour page d'accueil</a>
            </div>`)
        const form = document.getElementById('add-playlist')
        form.addEventListener('submit', e => {
        e.preventDefault()
        const data = serializeForm(form)
        const dataWithId = {
            titre: data.title,
            genre: data.genre,
            url: data.url,
            compete: data.competition,
            id_wilders: 1
        }
        fetch('/playlists', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataWithId)
            })
            .then(res => res.json())
            .then(playlist => {
            const alertBox = document.getElementById('alert-box')
            alertBox.className = 'alert alert-success'
            alertBox.innerHTML = `Votre playlist titre ${playlist.titre} (${playlist.id}) a bien été créée`
            })
        })
    },
    '/wilders': () => {
        fetch('/membres')
        .then(res => res.json())
        .then(listusers => listusers.reduce((carry, user) => carry + makeWilder(user), ''))
        .then(book => render(
            `<div class="container">
                <div class="row">
                    ${book}  
                </div>
            </div>
                `))
    },
    '/viewplaylists/:slug': ctx => {
        const {
        slug
        } = ctx.params
        fetch(`/membre/${slug}`)
        .then(res => res.json())
        .then(wilder => {
            const playlists = wilder[0].playlists
            const wilderPlaylistsCards = playlists.reduce((acc, playlist) => acc + makePlaylistCard(playlist), '')
            render(`
            <div class="container">
                <h2>Les playlists de ${slug}</h2>
                <div class="row">
                    ${wilderPlaylistsCards}
                </div>
            </div>`)
      })
  },
  '/F.A.Q': () => {
    render(`
    <link rel="stylesheet" href="style.css" />

    <div class="question">
    <p class="pfaq">Bienvenue dans la F.A.Q jeune troubadour !</p><br />
    <p>Comment faire sa propre playlist ?</p><br />
    <p>Pour commencer il te faut crer un compte sur soundgood<br /> pour ensuite pouvoir faire t'es super playlist !</p>
    </div>

    <div><img src="https://agenceho5.com/wp-content/uploads/2017/04/Boulevard-des-airs-1-2000x500.jpg" class="imgfaq" alt="DJ" ></div>

    <div class="question">
    <p>Comment importer ta playlist sur Artezic reloaded ?</p><br /
    <p>Vous devez aller sur votre playlist soundgood, cliquer sur intégrer puis copier le code<br /> iframe pour ensuite le coller dans le champ dédié sur Artezic reloaded.</p>
    </div>

    <div><img src="http://www.buuworld.com/image/115006258.jpg" class="imgfaq" alt="violoniste" ></div>

    <div class="question">
    <p>Comment ajouter une photo sur son profil ?</p><br />
    <p>Il suffit juste de copier l'url de ta photo pour la coller dans le champ dédié pour. Nous<br /> te conseillons de redimensionner ta photo pour éviter les images qui prennent<br /> trop d'espace.<a href="https://www.iloveimg.com/fr/redimensionner-image">- IloveIMG -</a> est top pour redimensionner une image. </p>
    </div>

    <div><img src="https://www.in-akustik.de/uploads/tx_flexslider/Michael_Schenker_Live_In_Tokyo_Slider_01.jpg" class="imgfaq" alt="rap"></div>

    <div class="question">
    <p>Est-il possible d'importer sa playlist entière<br /> d'une autre plateforme sur soudgood ?</p><br />
    <p>Oui, il faut aller sur la plateforme ou il y a la playlist en question aller sur<br /> l'option partager ou share pour ensuite copier le code playlist link.<br />
    Une fois ceci de fait aller sur soundgood puis faite importer<br /> une playlist et coller y le code playlist link.</p><br />
    <p class="pfaq">Fin de la F.A.Q</p>
    </div>
     `)
        
  },
  '/concours': () => {
    fetch('/playlistsCompete')
      .then(res => res.json())
      .then(result => result.reduce((carry, user) => carry + makeWinningCard(user), ''))
      .then(book => render(`
        <div class="container align-items-center">
            <h3>La playlist gagnante de la semaine est :</h3>
        </div>
        <div class="container align-items-center" style="display: flex; justify-content: center; align-items: center;">
            <div class="row">
                ${book}
            </div>
        </div>    
        `))
    }
}



const route = pathname => {}

(() => {
  ['/', '/wilders', '/monprofil', '/newplaylist', '/editer-mon-profil', '/viewplaylists/:slug', '/concours', '/F.A.Q'].forEach(
    path => page(path, controllers[path])
  )
  page()
})()
