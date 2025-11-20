import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CreateReview from "./CreateReview";
import Sidebar from "./Sidebar";
import Review from "./Review";
import icon from "../assets/home-icon.svg";
import menu from "../assets/menu.svg";
import '../styles/albumpage.css';
import { BACKEND_URL } from "../App";

export default function AlbumPage(){
    const [createView, setCreateView] = React.useState(false);

    const [update, setUpdate] = React.useState(false);

    const [viewSidebar, setViewSidebar] = React.useState(window.innerWidth >= 1000);

    const [lastPage, setLastPage] = React.useState(false);

    const [updateData, setUpdateData] = React.useState({
        reviewId: "0",
        reviewObj: {} 
    });
    
    const [reviews, setReviews] = React.useState([]);
    
    const [pageNo, setPageNo] = React.useState(1);
    
    const [album, setAlbum] = React.useState({});
    
    const { id } = useParams();

    const location = useLocation();

    const navigate = useNavigate();

    const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);



    React.useEffect(() => {
        fetch(`${BACKEND_URL}/api/albums/${id}`)
        .then(response => response.json())
        .then(json => setAlbum(json));
    }, [])

    React.useEffect(() => {
        function handleResize(){
            setWindowWidth(window.innerWidth);
            window.innerWidth >= 1000 && setViewSidebar(true);
            window.innerWidth < 1000 && window.innerWidth > 990 && setViewSidebar(false);
        }

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, [])

    React.useEffect(() => {
        fetch(`${BACKEND_URL}/api/albums/${id}/reviews?pageNo=${pageNo}`)
        .then(response => response.json())
        .then(json => {
            setReviews(json.content.sort((a, b) => 
                Date.parse(b.dateOfPublication) - Date.parse(a.dateOfPublication)
            ));
            setLastPage(json.last);
        })
    }, [pageNo])

    React.useEffect(() => {
        window.scrollTo(0, 0)
    }, [reviews])



    function changePage(event){
        event.target.name === 'back' ? setPageNo(prev => prev - 1) : setPageNo(prev => prev + 1);
    }

    function toggleViewSidebar(){
        setViewSidebar(prev => !prev);
    }

    function checkTokenExp(){
        if (parseJwt(location.state.token).exp * 1000 <= Date.now()){
            navigate('/auth', { state: {message: 'Your session expired'} });
            return true;
        }
        return false;
    }

    function enableCreateView(){
        !checkTokenExp() && setCreateView(true);
    }

    function updateView(reviewId, reviewObj){
        setCreateView(true);
        setUpdate(true);
        setUpdateData(prev => ({...prev, reviewId: reviewId, reviewObj: reviewObj}));
    }

    function disableCreateView(){
        setCreateView(false);
    }

    function goToLogin(){
        navigate('/auth');
    }

    function goToMain(){
        navigate(`/search`, { state: location.state });
    }

    function parseJwt(token) {
        try {
          return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
          return null;
        }
    }

    function addReview(event, reviewObj, reviewId, update){
        event.preventDefault();

        if (checkTokenExp()) return;

        const url = update ? `${BACKEND_URL}/api/reviews/${reviewId}/update` : `${BACKEND_URL}/api/reviews/create`;

        const method = update ? "PUT" : "POST";

        fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${location.state.token}`
            },
            body: JSON.stringify({
                ...reviewObj,
                albumId: id
            })
        }).then((response) => console.log(response));

        setTimeout(() => {
            window.location.reload();
        }, 300)
    }

    const reviewElements = !(reviews.length > 0) ? [] : reviews.map(reviewObj => {
        return (
            <Review
                key={reviewObj.id} reviewProps={reviewObj}
                goToAlbum={() => 0} detailed={false}
                username={location.state?.username} token={location.state?.token}
                parseJwt={parseJwt} updateView={updateView}
                viewSidebar={viewSidebar && window.innerWidth < 1000}
            />
        )
    })


    
    return (
        <div className="albumpage-main">
            {viewSidebar && <Sidebar
                albumImg={album.imageUrl} albumName={album.name}
                albumDate={album.releaseDate} albumTracks={album.trackList}
                albumArtists={album.artists} key={windowWidth}
            />}
            <div className="albumpage-nav">
                {windowWidth <= 1000 &&
                <img key={windowWidth} className="tribar" src={menu} alt="" onClick={toggleViewSidebar} />
                }
                <button onClick={location.state !== null ? enableCreateView : goToLogin} className="albumpage-review-button">
                    {location.state !== null ? "Add Review" : "Sign in to add your review"}
                </button>
                <div onClick={goToMain} className="home-container">
                    <img className="home-icon" src={icon} alt="" />
                </div>
            </div>
            {!createView ?  
            <div className="albumpage-reviews">
                {!reviews?.length && 
                <>
                    <h1 className="albumpage-noreviews">No reviews for this album yet</h1>
                    <h2 className="albumpage-noreviews-h2">Add the first one!</h2>
                </>
                }
                {reviewElements}
                {reviews.length > 0 && 
                <div className="page-switches">
                {pageNo > 1 && 
                    <button onClick={changePage} name="back" className="page-back" >◄</button>}
                {!(lastPage && pageNo === 1) && pageNo}
                {!lastPage && 
                    <button onClick={changePage} name="next" className="page-next" >►</button>}
                </div>}
            </div> : 
            <div className="createreview">
                <CreateReview
                    updateData={updateData} update={update}
                    funcReview={addReview} funcView={disableCreateView}
                />
            </div>
            }
        </div>
    )
}