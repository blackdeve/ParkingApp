//import liraries
import React, { Component } from 'react';
import { DrawerNavigator, StackNavigator } from 'react-navigation';
import PropTypes from 'prop-types';
import { width } from 'react-native-dimension';
import SideBar from './sidebar';
import HomeScreen from './home';
import MessagesScreen from './messages';
import DashboardScreen from './dashboard';
import MapScreen from './map';
import ReservationScreen from './reservation';
import VehicleScreen from './vehicle';
import SpotScreen from './spot';
import ChatScreen from './chat';
import HistoryItemScreen from './historyItem'
import ProfileScreen from './profile'

const getNavigationOptions = () => ({drawerLockMode: 'locked-closed'});

const getDrawerNavigator = Screen => DrawerNavigator({
    Main: {
        screen: Screen,
        navigationOptions: getNavigationOptions()
    }
},{
    drawerWidth: width(80),
    drawerPosition: 'left',
    contentComponent: SideBar,
    drawerLockMode: 'locked-closed',
});

const Drawer = StackNavigator({
    HomeScreen: {
        screen: getDrawerNavigator(HomeScreen),
        navigationOptions: {
            gesturesEnabled: false
        }
    },
    MessagesScreen: {
        screen: MessagesScreen,
        navigationOptions: {
            gesturesEnabled: false
        }
    },
    DashboardScreen: {
        screen: DashboardScreen,
        navigationOptions: {
            gesturesEnabled: false
        }
    },
    MapScreen: {
        screen: getDrawerNavigator(MapScreen),
        navigationOptions: {
            gesturesEnabled: false
        }
    },
    ReservationScreen: {
        screen: ReservationScreen,
        navigationOptions: {
            gesturesEnabled: false
        }
    },
    VehicleScreen: {
        screen: getDrawerNavigator(VehicleScreen),
        navigationOptions: {
            gesturesEnabled: false
        }
    },
    SpotScreen: {
        screen: SpotScreen,
        navigationOptions: {
            gesturesEnabled: false
        }
    },
    HistoryItemScreen: {
        screen: HistoryItemScreen,
        navigationOptions: {
            gesturesEnabled: false
        }
    },
    ChatScreen: {
        screen: ChatScreen,
        navigationOptions: {
            gesturesEnabled: false
        }
    },
    ProfileScreen: {
        screen: ProfileScreen,
        navigationOptions: {
            gesturesEnabled: false
        }
    }
},{
    initialRouteName: 'HomeScreen',
    headerMode: 'none'
})

export default Drawer;