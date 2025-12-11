import React, { useState } from "react";
import axios from 'axios';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from "react-redux";
import { login } from '../../actions/auth';

const Login = ({ login, isAuth }) => { //props declared below
    const [formData, setFormData] = useState({email: '', password: ''});
    const { email, password } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const onSubmit = async e => {
        e.preventDefault();
        login(email, password); //calls actions/auth.js 
            // const newUser = {
            //     name,
            //     email,
            //     password
            // }
            // try {
            //     const config = {
            //         headers: {
            //             'Content-Type': 'application/json'
            //         }
            //     }
            //     const body = JSON.stringify(newUser);
            //     const res = await axios.post('/api/users', body, config); //axios returns promise -> consumed on backend
            //     console.log(res.data);
            // } catch (error) {
            //     console.error(error.response.data);
            // }
        }
    

    return (
    <>
        <h1 className="large text-primary">Sign In</h1>
        <p className="lead"><i className="fas fa-user"></i> Log Into Your Account</p>
        <form className="form" onSubmit={e => onSubmit(e)}>
            <div className="form-group">
            <input type="email" placeholder="Email Address" name="email" value={email} onChange={e => onChange(e)} required />
            </div>
            <div className="form-group">
            <input
                type="password"
                placeholder="Password"
                name="password"
                minLength="6"
                value={password} onChange={e => onChange(e)}
            />
            </div>
            <input type="submit" className="btn btn-primary" value="Login" />
        </form>
        <p className="my-1">
            Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
    </>
    );
}

const mapStateToProps = state => ({
    isAuth: state.auth.isAuthenticated
});

login.propTypes = {
    isAuth: PropTypes.bool,
    login: PropTypes.func.isRequired
};


export default connect(null, { login })(Login);