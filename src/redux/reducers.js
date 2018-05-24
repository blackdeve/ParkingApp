
import { combineReducers } from 'redux';
import * as types from './types';

const user = (state = {}, action) => {
    switch (action.type) {
        case types.SET_USER_SESSION:
            return action.user;
        default:
            return state;
    }
};

export default combineReducers({user});
