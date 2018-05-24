//import liraries
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Platform,
  TouchableOpacity,
  Image,
  ScrollView,
  BackHandler
} from 'react-native';
import images from '../utils/images'
import apiConfig from '../api/config'
import SendBird from 'sendbird'
import * as RealmDB from '../redux/realm'

// Redux
import { connect } from 'react-redux';

// create a component
class HistoryItemScreen extends Component {

  componentDidMount() {
    const { navigation } = this.props
    BackHandler.addEventListener('hardwareBackPress', function() {
      navigation.goBack()
      return true
    });
  }

  messageOwner(_user) {
    const { user, navigation } = this.props;
    if (user.username === _user.username) {
      alert("It's your spot")
      return
    }
    var sb = SendBird.getInstance();
    var userIds = [user.username, _user.username];
    sb.GroupChannel.createChannelWithUserIds(userIds, true, function(createdChannel, error) {
      if (error) {
          console.error(error);
          return;
      }
      navigation.navigate('ChatScreen', {channelUrl: createdChannel.url})
    });
  }

  calcDuration(item) {
    const dateStr = item.date
    const year = parseInt(dateStr.slice(0, 4))
    const month = parseInt(dateStr.slice(5, 7))
    const day = parseInt(dateStr.slice(8, 10))
    const from = parseInt(item.from.slice(0, item.from.length - 3))
    const to = parseInt(item.to.slice(0, item.to.length - 3))
    
    return to - from
  }
  
  _renderLineItem(label, text) {
    return (
      <View style={{flexDirection: 'row'}}>
        <Text style={{flex: 1, color: '#333', fontSize: 15, fontWeight: 'bold'}}>{label}</Text>
        <Text style={{width: 90, color: '#333', fontSize: 15, fontWeight: 'bold'}}>{text}</Text>
      </View>
    )
  }

  render() {
    const reservation = this.props.navigation.state.params
    const vehicles = RealmDB.getVehicles()
    const vehicle = vehicles[0]
    const _user = reservation.mine ? reservation.owner : reservation.renter
    const _userName = _user.firstname + ' ' + _user.lastname
    money = this.calcDuration(reservation) * reservation.spotInfo.rate
    return (
      <View style={styles.container}>
        <ImageBackground
          source={images.messageBackground}
          style={{flex:1}}
          resizeMode='stretch'
        >
          <View style={styles.safeArea}>
            {/*-----Navigation Bar-----*/}
            <TouchableOpacity
              style={[styles.navigationButton, styles.buttonLeft]}
              onPress={() => {
                this.props.navigation.goBack();
              }}
            >
              <Image
                source={images.navigationBack}
                style={{width: 20, height: 20}}
                resizeMode='contain'
              />
            </TouchableOpacity>
            <Text style={styles.navigationTitle}>{reservation.spotInfo.name}</Text>
            {/*------------------------*/}
            <View style={{
              marginTop: 55,
              marginBottom: 20,
              marginLeft: 25,
              marginRight: 25,
            }}>
              <Image
                source={{uri: apiConfig.url + reservation.spotInfo.image}}
                style={{width: '100%', height: 110}}
                resizeMode='stretch'
              />
            </View>
            <View style={{
              flex: 1,
              backgroundColor: '#f6f9fc',
              paddingLeft: 22,
              paddingRight: 22,
            }}>
              <View style={styles.spotInfoContainer}>
                <Text style={[styles.spotInfoText, {color: '#555'}]} numberOfLines={2}>Address:</Text>
                <Text style={styles.spotInfoText} numberOfLines={2}>{reservation.spotInfo.location}</Text>
                <Text style={styles.spotInfoText}>Spot # {reservation.spotInfo.id + 1}</Text>
                <View style={styles.managerInfoContainer}>
                  <Image
                    source={{url: apiConfig.url + _user.photo}}
                    style={styles.managerPhoto}
                    resizeMode='stretch'
                  />
                  <View style={styles.managerInfo}>
                    <Text style={styles.managerInfoText}>Spot Owner</Text>
                    <Text style={styles.managerInfoText}>{_userName}</Text>
                  </View>
                  <TouchableOpacity
                    style={{alignSelf: 'flex-end'}}
                    onPress={() => this.messageOwner(_user)}
                  >
                    <Image
                      source={images.messageIcon}
                      style={styles.message}
                      resizeMode='stretch'
                    />
                  </TouchableOpacity>
                </View>
              </View>
              {/*-----Spot Info-----*/}
              <View style={{flex: 1, padding: 20, justifyContent: 'space-around'}}>
                { this._renderLineItem('Date:', reservation.date) }
                { this._renderLineItem('Time:', reservation.from + ' - ' + reservation.to) }
                { this._renderLineItem('Plate #:', vehicle !== undefined ? vehicle.plate : '-----') }
                <View style={{flexDirection: 'row'}}>
                  <Text style={{flex: 1, color: '#333', fontSize: 15, fontWeight: 'bold'}}>Spend:</Text>
                  <Text style={{width: 70, color: 'red', fontSize: 15, fontWeight: 'bold'}}>${money}</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Text style={{flex: 1, color: '#333', fontSize: 15, fontWeight: 'bold'}}>Payment:</Text>
                  <View style={{width: 90, flexDirection: 'row'}}>
                    <Image
                      style={{width: 24, height: 20, backgroundColor: 'red', marginRight: 10}}
                      source={images.visa}
                      resizeMode='stretch'
                    />
                    <Text style={{color: '#333', fontSize: 15, fontWeight: 'bold'}}>8879</Text>
                  </View>
                </View>
                { this._renderLineItem('Vehicle:', vehicle !== undefined ? vehicle.make + ' ' + vehicle.model : '-----') }
              </View>
            </View>
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
    backgroundColor: 'transparent'
  },
  safeArea: {
    flex: 1,
    marginTop: Platform.select({ios: 20}),
  },
  navigationButton: {
    position: 'absolute',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLeft: {
    marginLeft: 20,
  },
  navigationTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    position: 'absolute',
    marginTop: 18,
    alignSelf: 'center'
  },
  spotInfoContainer: {
    justifyContent: 'space-between',
    height: 185,
    paddingLeft: 10,
    paddingRight: 40,
    paddingTop: 15,
    paddingBottom: 25,
    borderBottomWidth: 1.5,
    borderBottomColor: '#ddd'
  },
  spotInfoText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 15
  },
  managerInfoContainer: {
    flexDirection: 'row',
  },
  managerPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 20,
  },
  managerInfo: {
    flex: 1,
    marginTop: 5,
    marginBottom: 5,
    justifyContent: 'space-around'
  },
  managerInfoText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 15,
  },
  message: {
    width: 24,
    height: 24,
  },
  spotScroll: {
    flex: 1,
    margin: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  spotBox: {
    marginBottom: 20,
    width: '100%',
    height: 80,
    borderRadius: 7,
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 15
  },
  spotNo: {
    color: 'black',
    fontSize: 17,
  },
  spotDetail: {
    color: '#aaa',
    fontSize: 14,
  }
});

const mapStateToProps = state => ({
  user: state.user
})

//make this component available to the app
export default connect(mapStateToProps)(HistoryItemScreen);
