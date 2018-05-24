import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StackNavigator } from 'react-navigation';
import LoginScreen from './login';
import Drawer from './drawer';

const createStackNavigator = (user) => {
    return StackNavigator({
        LoginScreen: {
            screen: LoginScreen
        },
        Drawer: {
            screen: Drawer
        }
    }, {
        initialRouteName: isEmpty(user)
            ? 'LoginScreen'
            : 'Drawer',
        headerMode: 'none'
    });
}

class Root extends Component {

    render() {
        const { user } = this.props;
        const Navigator = createStackNavigator(user);
        return (<Navigator/>);
    }
}

const mapStateToProps = store => ({
    user: store.user,
});

export default connect(mapStateToProps)(Root);
