import React, {useEffect} from 'react';
import './App.css';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Alert from './components/layout/Alert';
import { loadUser } from './actions/auth';
import setAuthToken from './utils/setAuthToken';

const App = () => {return (
    useEffect(() => {
        store.dispatch(loadUser())
    }, []),
    <Provider store={store}>
        <Router>
            <>
                <Navbar />
                <section className='container'>
                    <Alert />
                    <Routes>
                        <Route path="/" element={<Landing />} />  
                        <Route path="/register" element={<Register />}/>
                        <Route path="/login" element={<Login />}/>
                    </Routes>
                </section>
            </>
        </Router>
    </Provider>
)};

export default App;
