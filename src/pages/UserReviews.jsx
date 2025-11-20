import React from "react";
import Nav from "./Nav";
import Review from "./Review";
import CreateReview from "./CreateReview";
import '../styles/userreviews.css'
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "../App";

export default function UserReviews(props){
    const [reviews, setReviews] = React.useState([]);

    const [albumId, setAlbumId] = React.useState("");

    const [pageNo, setPageNo] = React.useState(1);

    const [lastPage, setLastPage] = React.useState(false);

    const [createView, setCreateView] = React.useState(false);

    const [update, setUpdate] = React.useState(false);

    const [updateData, setUpdateData] = React.useState({
        reviewId: "0",
        reviewObj: {} 
    });

    const { username } = useParams();

    const location = useLocation();

    const navigate = useNavigate();



    React.useEffect(() => {
        fetch(`${BACKEND_URL}/api/users/${username}/reviews?pageNo=${pageNo}`)
        .then(response => response.json())
        .then(json => {
            setReviews(json.content.sort((a, b) => 
                Date.parse(b.dateOfPublication) - Date.parse(a.dateOfPublication)
            ));
            setLastPage(json.last);
        })
    }, [pageNo])

    React.useEffect(() => {
        albumId && navigate(`/album/${albumId}`, { state: location.state });
    }, [albumId])

    React.useEffect(() => {
        window.scrollTo(0, 0)
    }, [reviews])



    function changePage(event){
        event.target.name === 'back' ? setPageNo(prev => prev - 1) : setPageNo(prev => prev + 1);
    }

    function goToAlbum(event){
        setAlbumId(event.target.name);
    }

    function logOut(){
        navigate(`/reviews/${username}`);
        window.location.reload();
    }

    function goToMain(){
        navigate(`/search`, { state: location.state });
    }

    function goToUserReviews(){
        navigate(`/reviews/${location.state.username}`, { state: location.state})
        window.location.reload();
    }

    function goToLogin(){
        navigate('/auth');
    }

    function updateView(reviewId, reviewObj){
        setCreateView(true);
        setUpdate(true);
        setUpdateData(prev => ({...prev, reviewId: reviewId, reviewObj: reviewObj}));
    }

    function disableCreateView(){
        setCreateView(false);
    }

    function parseJwt(token) {
        try {
          return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
          return null;
        }
    }

    function updateReview(event, reviewObj, reviewId, update){
        event.preventDefault();

        if (parseJwt(location.state.token).exp * 1000 <= Date.now()){
            navigate('/auth', { state: {message: 'Your session expired'} });
            return;
        }

        fetch(`${BACKEND_URL}/api/reviews/${reviewId}/update`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${location.state.token}`
            },
            body: JSON.stringify({
                ...reviewObj
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
                goToAlbum={goToAlbum} detailed={true}
                username={location.state?.username} token={location.state?.token}
                parseJwt={parseJwt} updateView={updateView}
            />
        )
    })



    return (
        <div className="userreviews">
            <Nav
                main={false}
                goToMain={goToMain}
                authorized={location.state !== null}
                goToLogin={goToLogin}
                goToUserReviews={goToUserReviews}
                username={username}
                logOut={logOut}  
            />
            {!reviews?.length && 
                <>
                    <h1 className="albumpage-noreviews">{username} has no reviews</h1>
                </>
            }
            {createView ? 
            <div className="createreview">
                <CreateReview
                    updateData={updateData} update={update}
                    funcReview={updateReview} funcView={disableCreateView}
                />
            </div>
            :
            <>
                {reviewElements}
                {reviews.length > 0 && <div className="page-switches">
                    {pageNo > 1 && 
                        <button onClick={changePage} name="back" className="page-back" >◄</button>}
                    {!(lastPage && pageNo === 1) && pageNo}
                    {!lastPage && 
                        <button onClick={changePage} name="next" className="page-next" >►</button>}
                </div>}            
            </>}
        </div>
    )
}