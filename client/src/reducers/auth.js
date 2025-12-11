import { REGISTER_SUCCESSFUL, REGISTER_FAILED, USER_LOADED, AUTH_ERROR, LOGIN_SUCCESSFUL, LOGIN_FAILED } from '../actions/constants';

const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null
};

export default function(state = initialState, action) {
    const { type, payload } = action; //payload inc. user, email, avatar -password
    switch (type) {
        case REGISTER_SUCCESSFUL:
        case LOGIN_SUCCESSFUL:
            localStorage.setItem('token', payload.token);
            return {
                ...state,
                ...payload,
                isAuthenticated: true,
                loading: false 
            }
        case REGISTER_FAILED:
        case AUTH_ERROR:
        case LOGIN_FAILED:
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false
            }
        case USER_LOADED:
            return { ...state,
            isAuthenticated: true,
            loading: false,
            user: payload
            }
        default:
            return state;

    }
}