//import liraries
import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Platform,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  AsyncStorage
} from 'react-native';
// REDUX
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ActionCreators } from '../redux/actions';

import { NavigationActions } from 'react-navigation';
import * as Actions from '../redux/actions';
import images from '../utils/images';
import apiConfig from '../api/config';
import * as RealmDB from '../redux/realm';
import MessagesScreen from './messages';
import { EventRegister } from 'react-native-event-listeners'

// create a component
class SideBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      unreadCount: 0,
      balance: 0,
      renterReservations: [],
      reservations: [],
      loaded1: false,
      loaded2: false
    }
  }

  getDate(date, time) {
    const _year = parseInt(date.slice(0, 4))
    const _month = parseInt(date.slice(5, 7))
    const _date = parseInt(date.slice(8, 10))
    const _hour = time !== undefined ? parseInt(time.slice(0, 2)) : 0
    const _minute = time !== undefined ? parseInt(time.slice(3, 5)) : 0
    return new Date(_year, _month - 1, _date, _hour, _minute)
  }

  calcDuration(item) {
    const from = this.getDate(item.date, item.from)
    const to = this.getDate(item.date, item.to)
    
    return (to - from) / (1000 * 60 * 60)
  }

  componentWillMount() {
    this.listener = EventRegister.addEventListener('customEvent', (unreadCount) => {
      this.setState({
        unreadCount,
      })
    })

    const { user, GetMyReservations, GetRenterReservations } = this.props
    GetRenterReservations(user.username)
    .then((res) => {
      const visited = []
      const date = new Date()
      res.map((item) => {
        const _date = this.getDate(item.date, item.to)
        if (_date < date) {
          visited.push(item)
        }
      })
      this.setState({renterReservations: visited, loaded1: true})
    }, (err) => {
      alert('Cannot get data from server!')
    })
    GetMyReservations(user.username)
    .then((res) => {
      const visited = []
      const date = new Date()
      res.map((item) => {
        const _date = this.getDate(item.date, item.to)
        if (_date < date) {
          visited.push(item)
        }
      })
      this.setState({reservations: visited, loaded2: true})
    }, (err) => {
      alert('Cannot get data from server!')
    })
  }
  
  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener)
  }

  logout() {
    RealmDB.removeAll();
    AsyncStorage.clear()
    this.props.logout();
  }

  onUpdateProfile() {
    this.props.navigation.navigate('DrawerClose')
    this.props.navigation.navigate('ProfileScreen')
  }

  renderMenuButton(icon, messageCount, label, callback) {
    return (
      <TouchableOpacity
        style={styles.menuButton}
        onPress={callback}
      >
        <ImageBackground
          source={icon}
          style={styles.menuButtonIcon}
          resizeMode='stretch'
        >
          { this.renderMessageNotification(messageCount) }
        </ImageBackground>
        <Text style={styles.menuButtonLabel}>{ label }</Text>
      </TouchableOpacity>
    );
  }

  renderMessageNotification(count) {
    if (count == 0)
      return null;
    return (
      <ImageBackground
        source={images.notification}
        style={styles.notification}
        resizeMode='stretch'
      >
        <Text style={styles.number}>{count}</Text>
      </ImageBackground>
    );
  }

  onMenuButtonPress(index) {
    var resetAction;
    switch(index) {
      case 0:     // Find Parking
        resetAction = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({ routeName: 'MapScreen'})
          ]
        })
        this.props.navigation.dispatch(resetAction)
        break;
      case 1:     // Main Menu
        resetAction = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({ routeName: 'HomeScreen'})
          ]
        })
        this.props.navigation.dispatch(resetAction)
        break;
      case 2:     // Messages
        this.props.navigation.navigate('MessagesScreen');
        break;
      case 3:     // Dashboard
        this.props.navigation.navigate('DashboardScreen');
        break;
      case 4:     // Vehicles and spots
        resetAction = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({ routeName: 'VehicleScreen'})
          ]
        })
        this.props.navigation.dispatch(resetAction)
        break;
      case 5:     // Contact us
        break;
      case 6:     // Settings
        break;
      case 7:     // Log out
        this.logout();
        break;
    }
  }

  render() {
    const { reservations, renterReservations } = this.state
    const { user } = this.props;
    var balance = user.balance
    const name = user.firstname + ' ' + user.lastname;

    if (!this.state.loaded1 || !this.state.loaded2) {
      return null
    }

    var earning = new Array(7).fill(0)
    const date = new Date()
    var one_day = 1000 * 60 * 60 * 24;
    date.setDate(date.getDate() - 6)
    reservations.map((item) => {
      const _date = this.getDate(item.date)
      const cost = this.calcDuration(item) * item.spotInfo.rate
      const index = Math.round((_date - date) / one_day) + 1
      if (index >= 0) {
        earning[index] -= cost
      }
    })
    renterReservations.map((item) => {
      const _date = this.getDate(item.date)
      const cost = this.calcDuration(item) * item.spotInfo.rate
      const index = Math.round((_date - date) / one_day) + 1
      if (index >= 0) {
        earning[index] += cost
      }
    })

    earning.map((money) => {
      balance += money
    })
    return (
      <View style={styles.container}>
        <ImageBackground
          source={images.loginBackground}
          style={styles.background}
          resizeMode='stretch'
        >
          <View style={styles.profileView}>
            <TouchableOpacity
              onPress={()=>{this.onUpdateProfile()}}
            >
            <Image
              source={{uri: apiConfig.url + user.photo}}
              style={styles.profilePic}
            />
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <TouchableOpacity
                onPress={()=>{this.onUpdateProfile()}}
              >
                <Text style={styles.profileName}>{name}</Text>
              </TouchableOpacity>
              <Text style={styles.ballanceInfo}>Ballance: ${balance}</Text>
            </View>
          </View>
          <View style={styles.menu}>
            { this.renderMenuButton(images.sideMenuFind, 0, "Find Parking", () => {this.onMenuButtonPress(0)}) }
            { this.renderMenuButton(images.sideMenuHome, 0, "Main Menu", () => {this.onMenuButtonPress(1)}) }
            { this.renderMenuButton(images.sideMenuMessages, this.state.unreadCount, "Messages", () => {this.onMenuButtonPress(2)}) }
            { this.renderMenuButton(images.sideMenuDashboard, 0, "Dashboard", () => {this.onMenuButtonPress(3)}) }
            { this.renderMenuButton(images.sideMenuAdd, 0, "Vehicles and spots", () => {this.onMenuButtonPress(4)}) }
            { this.renderMenuButton(images.sideMenuContact, 0, "Contact us", () => {this.onMenuButtonPress(5)}) }
            { this.renderMenuButton(images.sideMenuSetting, 0, "Settings", () => {this.onMenuButtonPress(6)}) }
          </View>
          <View style={{flex: 1}}></View>
          <View>
            {
              this.renderMenuButton(images.sideMenuLogout, 0, "Log out", () => {this.onMenuButtonPress(7)})
            }
          </View>
        </ImageBackground>
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  background: {
    flex: 1,
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: 80,
    paddingBottom: 100,
  },
  profileView: {
    marginLeft: -20,
    flexDirection: 'row',
    height: 56,
  },
  profilePic: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  profileInfo: {
    marginLeft: 20,
    height: 56,
    justifyContent: 'space-around'
  },
  profileName: {
    color: 'white',
    fontSize: 22,
    backgroundColor: 'transparent'
  },
  ballanceInfo: {
    color: 'white',
    fontSize: 12,
    backgroundColor: 'transparent'
  },
  menu: {
    marginTop: 30,
    height: 280,
    justifyContent: 'space-between',
  },
  menuButton: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    alignItems: 'center',
    height: 40,
  },
  menuButtonIcon: {
    width: 24,
    height: 24
  },
  menuButtonLabel: {
    marginLeft: 15,
    color: 'white',
    fontSize: 20,
    backgroundColor: 'transparent'
  },
  notification: {
    width: 30,
    height: 33,
    marginLeft: 8,
    marginTop: -8,
    alignItems: 'center',
    paddingTop: Platform.select({ios: 1})
  },
  number: {
    color: 'white',
    fontSize: 15,
  }
});

const mapStateToProps = state => ({
  user: state.user,
})

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(ActionCreators, dispatch);
}

//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(SideBar);
