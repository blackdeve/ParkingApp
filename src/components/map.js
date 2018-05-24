//import liraries
import React, { Component } from 'react';
import {
  View,
  Text,
  Platform,
  Image,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  BackHandler
} from 'react-native';
import MapView from 'react-native-maps';
import geolib from 'geolib';
import Carousel from 'react-native-snap-carousel';
import images from '../utils/images';
import {width, height} from 'react-native-dimension';
import RNGooglePlaces from 'react-native-google-places'
import SendBird from 'sendbird';
import { EventRegister } from 'react-native-event-listeners';
import DatePicker from 'react-native-datepicker'
// Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ActionCreators } from '../redux/actions';

import * as RealmDB from '../redux/realm';

var sb = null;

// create a component
class MapScreen extends Component {

  constructor(props) {
    super(props)

    sb = SendBird.getInstance();
    this.state = {
      unreadCount: 0,
      channelList: [],
      listQuery: sb.GroupChannel.createMyGroupChannelListQuery(),
      findSpot: false,
      spots: [],
      filteredSpots: [],
      reservations: [],
      _filter: '',
      filter: '',
      _date: null,
      date: null,
      _startTime: null,
      _endTime: null,
      startTime: null,
      endTime: null,
      currentPosition: null,
      searchResults: [],
      addressSuggests: [],
      spot: null,
      region: {
        longitude: -122.4324,
        latitude: 37.78825,
        longitudeDelta: 0.0421,
        latitudeDelta: 0.0922,
      },
    }
  }

  componentWillMount() {
    this.listener = EventRegister.addEventListener('customEvent', (unreadCount) => {
      this.setState({
        unreadCount,
      })
    })
  }

  getDate(date, time) {
    const _year = parseInt(date.slice(0, 4))
    const _month = parseInt(date.slice(5, 7))
    const _date = parseInt(date.slice(8, 10))
    const _hour = time !== undefined ? parseInt(time.slice(0, 2)) : 0
    const _minute = time !== undefined ? parseInt(time.slice(3, 5)) : 0
    return new Date(_year, _month - 1, _date, _hour, _minute)
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', function() {
      return true
    });

    const spots = []
    const date = new Date()

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {latitude, longitude} = position.coords;
        const currentPosition = {
          latitude,
          longitude,
        }
        this.calculateDistances(currentPosition)
        const region = {
          ...currentPosition,
          longitudeDelta: 0.0421,
          latitudeDelta: 0.0922,
        }

        RealmDB.getSpots()
        .map((spot, index) => {
          const endTime = this.getDate(spot.endDate, spot.to)
          if (date < endTime) {
            const distance = geolib.convertUnit('mi', geolib.getDistance(currentPosition, spot.position))
            spots.push({key: spots.length, ...spot, distance})
          }
        });
        spots.sort((a, b) => {
          return a.distance > b.distance
        })
        this.setState({spots, filteredSpots: spots})

        this.setState({currentPosition, region});
      },
      (error) => alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );

    // get reservations
    const { GetAllReservations } = this.props
    GetAllReservations()
    .then((reservations) => {
      this.setState({reservations})
    })

    this._getChannelList();
    
    // channel handler
    var _SELF = this;
    var ChannelHandler = new sb.ChannelHandler();
    ChannelHandler.onChannelChanged = function(channel) {
      _SELF._channelUpdate(channel);
    };
    sb.addChannelHandler('ChannelHandlerInListMap', ChannelHandler);

    var ConnectionHandler = new sb.ConnectionHandler();
    ConnectionHandler.onReconnectSucceeded = function(){
      _SELF._refreshChannelList();
    }
    sb.addConnectionHandler('ConnectionHandlerInListMap', ConnectionHandler);
  }

  componentWillUnmount() {
    sb.removeChannelHandler('ChannelHandlerInListMap');
    sb.removeChannelHandler('ConnectionHandlerInListMap');
    EventRegister.removeEventListener(this.listener);
  }

  _channelUpdate(channel) {
    if(!channel) return;

    var _SELF = this;
    var _exist = false;
    var _list = _SELF.state.channelList.filter(function(ch) {
      return channel.url != ch.url
    });

    _list.unshift(channel);
    var unreadCount = 0;
    _list.map((list) => {
      unreadCount += list.unreadMessageCount;
    })

    _SELF.setState({
      channelList: _list,
      unreadCount
    });
  }

  _refreshChannelList() {
    var _SELF = this;
    var listQuery = sb.GroupChannel.createMyGroupChannelListQuery();
    listQuery.next(function(channelList, error){
      if (error) {
        console.log(error);
        return;
      }
      _SELF.setState({ listQuery: listQuery, channelList: channelList});
    });
  }

  _getChannelList() {
    var _SELF = this;
    _SELF.state.listQuery.next((channelList, error) => {
      if (error) {
        console.log(error);
        return;
      }
      var newList = _SELF.state.channelList.concat(channelList);
      var unreadCount = 0;
      newList.map((list) => {
        unreadCount += list.unreadMessageCount;
      })
      _SELF.setState({ channelList: newList, unreadCount});
    })
  }

  calculateDistances(position) {
    let { spots } = this.state;
    const newSpots = spots.map((spot) => {
      const dist = geolib.convertUnit('mi', geolib.getDistance(position, spot.position))
      return {...spot, distance: dist}
    })
    this.setState({spots: newSpots})
  }

  onMakeReservation(spot) {
    this.props.navigation.navigate('ReservationScreen', {spot});
  }

  onChangeFilter(filter) {
    this.setState({_filter: filter})
    RNGooglePlaces.getAutocompletePredictions(filter, {
      type: 'address',
      country: 'US'
    })
      .then((place) => {
        this.setState({addressSuggests: place})
      })
      .catch(error => this.setState({addressSuggests: []}));
  }

  applyFilter() {
    const {spots, _filter, _date, _startTime, _endTime} = this.state
    if (_date === null) {
      alert('Please select Date')
      return
    }
    if (_startTime === null) {
      alert('Please select Start Time')
      return
    }
    if (_endTime === null) {
      alert('Please select End Time')
      return
    }
    let filteredSpots = []
    const filter = _filter.toLowerCase()
    spots.map((spot, index) => {
      if (this.isAvailable(spot, _date, _startTime, _endTime)) {
        filteredSpots.push(spot)
      }
    })

    const {addressSuggests} = this.state;
    const address = addressSuggests[0]

    RNGooglePlaces.lookUpPlaceByID(address.placeID)
    .then((res) => {
      const spot = {
        latitude: res.latitude,
        longitude: res.longitude
      }
      const region = {
        ...spot,
        latitudeDelta: this.state.region.latitudeDelta,
        longitudeDelta: this.state.region.longitudeDelta
      }
      filteredSpots.map((item) => {
        item.distance = geolib.convertUnit('mi', geolib.getDistance(spot, item.position))
      })
      filteredSpots.sort((a, b) => {
        return a.distance > b.distance
      })
      this.setState({filter: _filter, date: _date, startTime: _startTime, endTime: _endTime, filteredSpots, spot, region, findSpot: false})
    })
    .catch((error) => console.log(error.message));
  }

  _renderMenuButton(unreadCount) {
    return (
      <View style={styles.menuButtonContainer}>
        <TouchableOpacity
          style={styles.menuButtonArea}
          onPress={() => {
            this.props.navigation.navigate('DrawerOpen')
            EventRegister.emit('customEvent', unreadCount)
          }}
        >
          <Image
            source={images.menuIcon}
            style={styles.menuIcon}
            resizeMode='stretch'
          />
          { this._renderNotification(unreadCount) }
        </TouchableOpacity>
      </View>
    )
  }

  _renderNotification(unreadCount) {
    if (unreadCount === 0)
      return;
    return (
        <ImageBackground
          source={images.notification}
          style={styles.menuNotification}
          resizeMode='stretch'
          onPress={this.props.onPress}
        >
          <Text style={styles.menuNotificationCount}>
            {unreadCount}
          </Text>
        </ImageBackground>
    );
  }

  _renderSpotItem({item, index}) {
    let today = new Date();
    dayOfWeek = today.getDay();         // 0 - Sunday, 6 - Saturday
    dayOfWeek = (dayOfWeek + 6) % 7;    // 0 - Monday, 6 - Sunday
    return (
      <View style={{
        width: width(80),
        height: 175,
        borderRadius: 7,
        backgroundColor: 'white',
        padding: 15
      }}>
        <Text style={{color: '#333', fontSize: 17, alignSelf: 'center'}}>{item.name}</Text>
        <View style={{
          flex: 1,
          marginTop: 15,
          marginBottom: 10,
          marginRight: width(20),
          justifyContent: 'space-between',
          backgroundColor: 'transparent'
        }}>
          <Text style={{color: '#555'}}>{item.location}</Text>
          <Text style={{color: '#555'}}>{item.phone}</Text>
          <View style={{flexDirection: 'row'}}>
          {
            item.availability[dayOfWeek] === true ?
            [<Text key={0} style={{color: '#555'}}>Available: </Text>,
            <Text key={1} style={{color: '#12c9a5'}}>{item.from} - </Text>,
            <Text key={2} style={{color: '#12c9a5'}}>{item.to}</Text>]
            :
            <Text style={{color: '#e74c3c'}}>Not available today</Text>
          }
          </View>
        </View>
        <View style={{
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'absolute',
          top: 20,
          right: 10,
          height: 33
        }}>
          <Text style={{color: '#888', fontSize: 15}}>{item.distance.toFixed(2)} mile</Text>
          <Text style={{color: '#888', fontSize: 11}}>${item.rate} per hour</Text>
        </View>
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 20,
            right: 30,
          }}
          onPress={() => {this.onMakeReservation(item)}}
        >
          <View style={{alignItems: 'center', backgroundColor: 'transparent'}}>
            <Text style={{color: '#12c9a5', fontSize: 14, fontWeight: '400'}}>Make</Text>
            <Text style={{color: '#12c9a5', fontSize: 13, fontWeight: '400'}}>reservation</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  _renderSearchResultItem(place, index) {
    const address = place.fullText
    return (
      <View key={index} style={{
        height: 55,
        borderBottomColor: 'white',
        borderBottomWidth: 1,
        backgroundColor: 'transparent',
      }}>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingLeft: 10,
            justifyContent: 'center'
          }}
          onPress={() => {
            this.onChangeFilter(address)
          }}
        >
          <Text style={{color: 'white', fontSize: 20}}>{address}</Text>
        </TouchableOpacity>
      </View>
    )//*/
  }

  _renderSearchResults(places) {
    if (places.length === 0) {
      return (
        <View style={{
          height: 55,
          backgroundColor: 'transparent',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{color: 'white', fontSize: 20, fontWeight: 'bold'}}>No results found</Text>
        </View>
      )
    }
    return (
      places.map((place, index) => {
        return this._renderSearchResultItem(place, index)
      })
    )
  }

  isAvailable(spot, date, startTime, endTime) {
    let _date = this.getDate(date)
    const startDate = this.getDate(spot.startDate)
    const endDate = this.getDate(spot.endDate)
    if (!spot.availability[(_date.getDay() + 6) % 7]) {
      return false
    }
    if (_date < startDate || _date >= endDate) {
      return false
    }
    let _start = this.getDate(date, startTime)
    let _end = this.getDate(date, endTime)
    let _startTime = this.getDate(date, spot.from)
    let _endTime = this.getDate(date, spot.to)
    if (_start < _startTime || _start >= _endTime) {
      return false
    }
    if (_end <= _startTime || _end > _endTime) {
      return false
    }

    // check if already reserved
    const { reservations } = this.state
    let reserved = false
    reservations.map((reservation) => {
      if (reservation.spotId === spot.id) {
        _startTime = this.getDate(reservation.date, reservation.from)
        _endTime = this.getDate(reservation.date, reservation.to)
        if (_start >= _startTime && _start < _endTime) {
          reserved = true
        } else if (_end > _startTime && _end <= _endTime) {
          reserved = true
        } else if ((_start <= _startTime && _end >= _endTime) || (_startTime <= _start && _endTime >= _end)) {
          reserved = true
        }
      }
    })
    if (reserved) {
      return false
    }
    return true
  }

  render() {
    const { spots, currentPosition, searchResults, addressSuggests, filteredSpots } = this.state;
    let { filter, date, time, spot } = this.state
    
    const pickerStyle = {
      padding: 0,
      margin: 0,
      borderRadius: 5,
      justifyContent: 'center',
      backgroundColor: 'white'
    }

    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={this.state.region}
          onRegionChangeComplete={(region) => {this.setState({region})}}
        >
          {
            currentPosition !== null ?
            <MapView.Marker
              pinColor='#2ecc71'
              coordinate={currentPosition}
            />
            : null
          }
          {
            spot !== null ?
            <MapView.Marker
              coordinate={spot}
            />
            :
            null
          }
          {
            filteredSpots.map((spot, index) => {
              return (
                <MapView.Marker
                  key={index}
                  pinColor='#3498db'
                  coordinate={spot.position}
                  onPress={() => {
                    this.slider.snapToItem(index)
                  }}
                />
              )
            })
          }
          {
            filteredSpots.length === 0 && searchResults.length != 0 ?
            <MapView.Marker
              coordinate={this.state.spot}
            />
            : null
          }
        </MapView>
        { this._renderMenuButton(this.state.unreadCount) }
        <Text style={styles.navigationTitle}>Find Parking Spots</Text>
        <TouchableOpacity
          style={styles.findButton}
          onPress={() => {
            const { filter, date, time } = this.state
            this.setState({findSpot: true, _filter: filter, _date: date, _time: time})
          }}
        >
          <Image
            source={images.mapSearch}
            style={{flex: 1}}
            resizeMode='contain'
          />
        </TouchableOpacity>
        <View style={{
          position: 'absolute',
          width: '100%',
          height: 175,
          bottom: 30,
        }}>
          <Carousel
            ref={(ref) => {this.slider = ref;}}
            sliderWidth={width(100)}
            itemWidth={width(80)}
            data={filteredSpots}
            renderItem={this._renderSpotItem.bind(this)}
            inactiveSlideOpacity={1}
            inactiveSlideScale={0.87}
          />
        </View>
        {/*-----Search Spot-----*/}
        <Modal
          transparent
          visible={this.state.findSpot}
          onRequestClose={()=>{this.setState({findSpot: false})}}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#7777'
            }}
            onPress={()=>{this.setState({findSpot: false})}}
          />
          <View style={{
            position: 'absolute',
            width: width(100) - 66,
            marginLeft: 33,
            marginTop: Platform.select({ios: 20, android: 0}) + 30,
          }}>
            <View style={{
              padding: 5,
              paddingLeft: 14,
              borderRadius: 10,
              width: '100%',
              backgroundColor: 'white',
              borderWidth: 0.5,
              borderColor: '#555'
            }}>
              <TextInput
                style={styles.textInput}
                underlineColorAndroid='transparent'
                value={this.state._filter}
                onChangeText={(_filter) => {this.onChangeFilter(_filter)}}
                autoCorrect={false}/>
            </View>
            <View style={{width: '100%', height: 60, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
              <DatePicker
                style={[{width: 100, height: 30}, pickerStyle]}
                customStyles={{
                  dateInput: {
                    width: 100, height: 30, borderWidth: 0
                  }
                }}
                date={this.state._date}
                minDate={new Date()}
                mode="date"
                placeholder="Date"
                showIcon={false}
                format="YYYY-MM-DD"
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                onDateChange={(_date) => {this.setState({_date})}}
              />
              <DatePicker
                style={[{width: 60, height: 30}, pickerStyle]}
                customStyles={{
                  dateInput: {
                    width: 60, height: 30, borderWidth: 0
                  }
                }}
                date={this.state._startTime}
                mode="time"
                placeholder="Time"
                showIcon={false}
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                onDateChange={(_time) => {this.setState({_startTime: _time})}}
              />
              <DatePicker
                style={[{width: 60, height: 30}, pickerStyle]}
                customStyles={{
                  dateInput: {
                    width: 60, height: 30, borderWidth: 0
                  }
                }}
                date={this.state._endTime}
                mode="time"
                placeholder="Time"
                showIcon={false}
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                onDateChange={(_time) => {this.setState({_endTime: _time})}}
              />
              <TouchableOpacity
                style={[{width: 60, height: 30, alignItems: 'center'}, pickerStyle]}
                onPress={() => {
                  this.applyFilter()
                }}
              >
                <Text>Search</Text>
              </TouchableOpacity>
            </View>
            {
              this._renderSearchResults(addressSuggests)
            }
          </View>
        </Modal>
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.select({ios: 20}),
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  // Menu Button Styles //
  menuButtonContainer: {
    height: 40,
    paddingTop: Platform.select({ios: 25, android: 5}),
    position: 'absolute',
  },
  menuButtonArea: {
    width: 35,
    height: 30,
    marginLeft: 20,
    justifyContent: 'flex-end',
  },
  menuIcon: {
    width: 17,
    height: 17,
  },
  menuNotification: {
    position: 'absolute',
    left: 10,
    width: 27.5,
    height: 30,
    alignItems: 'center'
  },
  menuNotificationCount : {
    fontSize: 12,
    color: 'white',
    backgroundColor: 'transparent',
    fontWeight: 'bold',
    marginTop: Platform.select({ios: 2, android: 1})
  },
  ////////////////////////
  navigationTitle: {
    position: 'absolute',
    marginTop: Platform.select({ios: 35, android: 15}),
    color: 'black',
    fontSize: 18,
    alignSelf: 'center',
    backgroundColor: 'transparent'
  },
  findButton: {
    width: 20,
    height: 20,
    position: 'absolute',
    right: 20,
    marginTop: Platform.select({ios: 40, android: 20}),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    color: '#666',
    width: '100%',
    fontSize: 20,
    padding: 0,
  },
});

const mapStateToProps = state => ({
  user: state.user,
})

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(ActionCreators, dispatch);
}

//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(MapScreen);

