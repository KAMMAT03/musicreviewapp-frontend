import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import vinyl from '../assets/vinyl.svg';
import headphones from '../assets/headphones.svg'
import '../styles/login.css';
import { BACKEND_URL } from '../App';

export default function Login(){
    const [registered, setRegistered] = React.useState(true);

    const location = useLocation();

    const [message, setMessage] = React.useState(location.state?.message);

    const navigate = useNavigate();

    const [credentials, setCredentials] = React.useState({
        username: "",
        password: "",
        confpassword: ""
    })

    function toggleRegistered(){
        setCredentials({
            username: "",
            password: "",
            confpassword: ""
        });
        setMessage("");
        setRegistered(prev => !prev);
    }

    function submitRegister(event){
        event.preventDefault();

        if (credentials.password !== credentials.confpassword){
            setMessage("Passwords do not match!");
            return;
        }

        fetch(`${BACKEND_URL}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: credentials.username,
                password: credentials.password
            })
        }).then((response) => response.json())
        .then(json => {
            console.log(json);
            if (json.code === '200'){
                navigate("/search", { state: {username: credentials.username, token: json.token} });
            } else {
                setMessage(json.message);
                setCredentials(prev => ({
                    ...prev,
                    password: "",
                    confpassword: ""
                }));
            }
        });
    }

    function submitLogin(event){
        event.preventDefault();

        fetch(`${BACKEND_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: credentials.username,
                password: credentials.password
            })
        }).then(response => response.json())
        .then(json => {
            if (json.accessToken !== undefined){
                navigate("/search", { state: {username: credentials.username, token: json.accessToken} });
            } else{
                setMessage("Wrong username or password!");
            }
        });
    }

    function goToMain(){
        navigate('/search');
    }

    function handleChange(event){
        const {name, value} = event.target;

        setCredentials(prev => ({
            ...prev,
            [name]: value
        }))
    }


    return (
        <div className='login-div'>
            <img className='login-vinyl' src={vinyl} alt="" />
            <img className='login-headphones' src={headphones} alt="" />
            <h1 className='login-welcome'>Welcome to Music Review APP!</h1>
            <div className="login">
                <h1>{registered ? 'Login' : 'Register'}</h1>
                <p className='login-info' >For access to all functionalities!</p>
                <p style={{color: 'red'}}>{message}</p>
                <form className="login-form" action="">
                    <input
                        className='login-input'
                        name='username'
                        value={credentials.username}
                        type="text"
                        placeholder="username"
                        onChange={handleChange}
                    />
                    <input
                        className='login-input'
                        name='password'
                        value={credentials.password}
                        type="password"
                        placeholder="password"
                        onChange={handleChange}
                    />
                    {!registered &&
                    <input
                        className='login-input'
                        name='confpassword'
                        value={credentials.confpassword}
                        type="password"
                        placeholder="confirm password"
                        onChange={handleChange}
                    />}
                    <button onClick={registered ? submitLogin : submitRegister} className='login-button'>{registered ? 'Login' : 'Register'}</button>
                </form>
                <div className='login-toggle'>
                    <span>
                        {registered ? 'Don\'t have an account yet?' : 'Already registered?'}
                    </span>
                    <button onClick={toggleRegistered} className='register-button'>
                        {registered ? 'Register' : 'Login'}
                    </button>
                </div>
                <button onClick={goToMain} className='login-continue'>Continue without an account</button>
            </div>
        </div>
    )
}