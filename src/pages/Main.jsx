import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Album from "./Album";
import Nav from "./Nav";
import vinyl from '../assets/vinyl.svg';
import headphones from '../assets/headphones.svg'
import '../styles/main.css'
import { BACKEND_URL } from "../App";

export default function Main(props){
    const [searchContent, setSearchContent] = React.useState("");
    
    const [albumId, setAlbumId] = React.useState("");
    
    const [pageNo, setPageNo] = React.useState(1);
    
    const [albums, setAlbums] = React.useState([]);
    
    const navigate = useNavigate();

    const location = useLocation();



    function handleChange(event) {
        setSearchContent(event.target.value);
    }

    function changePage(event){
        event.target.name === 'back' ? setPageNo(prev => prev - 1) : setPageNo(prev => prev + 1);
    }

    function goToAlbum(event){
        setAlbumId(event.target.name);
    }
    
    function goToLogin(){
        navigate('/auth');
    }

    function logOut(){
        navigate('/search');
    }
    
    function goToUserReviews(){
        navigate(`/reviews/${location.state.username}`, { state: location.state });
    }
    
    function goToMain(){
        window.location.reload();
    }



    React.useEffect(() => {
        albumId && navigate(`/album/${albumId}`, { state: location.state });
    }, [albumId])
    
    React.useEffect(() => {
        setPageNo(1);
    }, [searchContent])

    React.useEffect(() => {
        window.scrollTo(0, 0)
    }, [searchContent, albums])
    
    React.useEffect(() => {
        if (searchContent.length < 3) {
            setAlbums([]);
            return;
        }

        fetch(`${BACKEND_URL}/api/albums/search?content=${searchContent.replace(/\s/g,'')}&pageNo=${pageNo}`)
        .then(response => response.json())
        .then(json => setAlbums(json.content));
    }, [searchContent, pageNo])



    const albumElements = albums && albums.map(album => (
        <Album
            goToAlbum={goToAlbum}
            key={album.id}
            albumName={album.name}
            albumArtists={album.artists}
            albumId={album.id}
            albumCover={album.imageUrl}
            reviewView={false}
        />
    ))



    return (
        <main className="main">
            <img className='main-vinyl' src={vinyl} alt="" />
            <img className='main-headphones' src={headphones} alt="" />
            <Nav
                handleChange={handleChange}
                searchValue={searchContent}
                main={true}
                authorized={location.state !== null}
                goToLogin={goToLogin}
                goToUserReviews={goToUserReviews}
                goToMain={goToMain}
                logOut={logOut}
            />
            {
                albums.length === 0 &&
                <div className="main-title">
                    <h1>Music Review APP</h1>
                    <h2>THE place to share your music opinions!</h2>
                </div>
            }
            <ul className="main-albums">
                {albumElements}
            </ul>
            {albums.length > 0 && <div className="page-switches">
                {pageNo > 1 && 
                    <button onClick={changePage} name="back" className="page-back" >◄</button>}
                {pageNo}
                {pageNo < 5 && 
                    <button onClick={changePage} name="next" className="page-next" >►</button>}
            </div>}
        </main>
    )
}