//import liraries
import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Platform,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Modal,
  BackHandler
} from 'react-native';
import { NavigationActions } from 'react-navigation'
import { width } from 'react-native-dimension';
import Switch from 'react-native-switch-pro';
import QuickSearchButton from './quickSearchButton';
import GridView from 'react-native-super-grid';
import images from '../utils/images';
import SendBird from 'sendbird';
import { EventRegister } from 'react-native-event-listeners'
import apiConfig from '../api/config';
import RNImmediatePhoneCall from 'react-native-immediate-phone-call'
import * as RealmDB from '../redux/realm';

// Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ActionCreators } from '../redux/actions';

var sb = null;

// create a component
class HomeScreen extends Component {

  constructor(props) {
    super(props);

    sb = SendBird.getInstance();
    this.state = {
      unreadCount: 0,
      channelList: [],
      listQuery:sb.GroupChannel.createMyGroupChannelListQuery(),
      newSpot: false,
      newSpotData: {
        name: 'Coppins Well',
        image: images.testSpotImage,
      },
      mine: true,
      renterData: ['Shiru Sun', 'Yan Cheng', 'Robin', 'Lun li', 'HaiMian Zhang'],
      mineReservations: [],
      renterReservations: [],
      showDetail: false,
      detailItem: null,
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

  componentWillMount() {
    this.listener = EventRegister.addEventListener('customEvent', (unreadCount) => {
      this.setState({
        unreadCount,
      })
    })

    const { user, GetMyReservations, GetRenterReservations } = this.props
    GetMyReservations(user.username)
    .then((mineReservations) => {
      const current = []
      const date = new Date()
      mineReservations.map((item) => {
        const _date = this.getDate(item.date, item.to)
        if (_date > date) {
          current.push(item)
        }
      })
      this.setState({mineReservations: current})
    }, (err) => {
      alert('Cannot get data from server!')
    })
    GetRenterReservations(user.username)
    .then((renterReservations) => {
      const current = []
      const date = new Date()
      renterReservations.map((item) => {
        const _date = this.getDate(item.date, item.to)
        if (_date > date) {
          current.push(item)
        }
      })
      this.setState({renterReservations: current})
    }, (err) => {
      alert('Cannot get data from server!')
    })
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', function() {
      return true
    });

    this._getChannelList();
    
    // channel handler
    var _SELF = this;
    var ChannelHandler = new sb.ChannelHandler();
    ChannelHandler.onChannelChanged = function(channel) {
      _SELF._channelUpdate(channel);
    };
    sb.addChannelHandler('ChannelHandlerInListHome', ChannelHandler);

    var ConnectionHandler = new sb.ConnectionHandler();
    ConnectionHandler.onReconnectSucceeded = function(){
      _SELF._refreshChannelList();
    }
    sb.addConnectionHandler('ConnectionHandlerInListHome', ConnectionHandler);
  }

  componentWillUnmount() {
    sb.removeChannelHandler('ChannelHandlerInListHome');
    sb.removeChannelHandler('ConnectionHandlerInListHome');
    EventRegister.removeEventListener(this.listener)
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
      unreadCount,
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

  isActiveReservation(item) {
    const date = item.date
    const endTime = item.to
    const year = parseInt(date.slice(0, 4))
    const month = parseInt(date.slice(5, 7))
    const day = parseInt(date.slice(8, 10))
    const hour = parseInt(endTime.slice(0, 2))
    const _date = new Date(year, month, day, hour)
    const today = new Date()
    return today <= _date
  }

  _renderMenuButton(unreadCount) {
    const {user} = this.props;
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

  renderMineItem(item) {
    const name = item.owner.firstname + ' ' + item.owner.lastname
    return (
      <View>
        <TouchableOpacity
          style={{flex:1}}
          onPress={() => {this.showDetail(item)}}
        >
        <ImageBackground
          source={images.gridItemBox}
          style={styles.gridItem}
          resizeMode='cover'
        >
          <View style={styles.infoBox}>
            <Text style={styles.driverName}>{name}</Text>
            <View>
              <View style={styles.renterActionView}>
                <TouchableOpacity
                  style={styles.renterActionButton}
                  onPress={() => {}}
                >
                  <Text style={styles.renterActionText}>start</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.renterActionButton}
                  onPress={() => {}}
                >
                  <Text style={styles.renterActionText}>end</Text>
                </TouchableOpacity>
              </View>
              <Text style={{marginLeft: 40, color: '#666'}}>{item.spotInfo.name}</Text>
            </View>
            <View style={styles.picView}>
              <Image
                source={{uri: apiConfig.url + item.owner.photo}}
                style={styles.profilePic}
              />
              <Image
                source={{uri: apiConfig.url + item.spotInfo.image}}
                style={styles.carPic}
              />
            </View>
          </View>
        </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  }

  renderRenterItem(item) {
    const name = item.renter.firstname + ' ' + item.renter.lastname
    const vehicle = item.vehicle;
    return (
      <View>
        <TouchableOpacity
          style={{flex:1}}
          onPress={() => {this.showDetail(item)}}
        >
        <ImageBackground
          source={images.gridItemBox}
          style={styles.gridItem}
          resizeMode='cover'
        >
          <View style={styles.infoBox}>
            <Text style={styles.driverName}>{name}</Text>
            <View style={styles.driverInfo}>
              <Text style={styles.infoText} numberOfLines={3}>{item.spotInfo.location}</Text>
              <Text style={styles.infoText}>Spot #: {item.spotInfo.id + 1}</Text>
            </View>
            <View style={styles.picView}>
              <Image
                source={{uri: apiConfig.url + item.renter.photo}}
                style={styles.profilePic}
              />
              {
                vehicle.length !== 0 ?
                <Image
                  source={{uri: apiConfig.url + vehicle[0].picture}}
                  style={styles.carPic}
                />
                : null
              }
            </View>
          </View>
        </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  }

  showDetail(item) {
    this.setState({
      showDetail: true,
      detailItem: item
    })
  }
  
  callUser(phone) {
    RNImmediatePhoneCall.immediatePhoneCall(phone);
  }

  messageUser(username) {
    const { user, navigation } = this.props;
    if (user.username === username) {
      alert("It's you!")
      return
    }
    var sb = SendBird.getInstance();
    var userIds = [user.username, username];
    sb.GroupChannel.createChannelWithUserIds(userIds, true, function(createdChannel, error) {
      if (error) {
          console.error(error);
          return;
      }
      navigation.navigate('ChatScreen', {channelUrl: createdChannel.url})
    });
  }

  getName(item) {
    if (item === null) {
      return ''
    }
    const { mine } = this.state
    const user = mine ? item.owner : item.renter
    return user.firstname + ' ' + user.lastname
  }

  getVehicle(item) {
    if (item === null)
      return ''
    const { mine } = this.state;
    let vehicles
    if (mine) {
      vehicles = RealmDB.getVehicles()
    } else {
      vehicles = item.vehicle
    }
    return vehicles.length > 0 ? vehicles[0].make + ' ' + vehicles[0].model : '---'
  }

  getColor(item) {
    if (item === null)
      return ''
    const { mine } = this.state;
    let vehicles
    if (mine) {
      vehicles = RealmDB.getVehicles()
    } else {
      vehicles = item.vehicle
    }
    return vehicles.length > 0 ? vehicles[0].color : '---'
  }

  getPhone(item) {
    if (item === null) {
      return null
    }
    const { mine } = this.state
    const user = mine ? item.owner : item.renter
    return user.phone
  }

  getUsername(item) {
    if (item === null) {
      return null
    }
    const { mine } = this.state
    const user = mine ? item.owner : item.renter
    return user.username
  }

  render() {
    const gridItemWidth = (width(100) - 41) / 2;
    const renderItems = this.state.mine ? this.state.mineReservations : this.state.renterReservations;
    const renderFunc = this.state.mine ? this.renderMineItem.bind(this) : this.renderRenterItem.bind(this);
    const renderItemsList = [];
    renderItems.map((item) => {
      if (this.isActiveReservation(item)) {
        renderItemsList.push(item)
      }
    })
    const { detailItem } = this.state;

    return (
      <View style={styles.container}>
        { this._renderMenuButton(this.state.unreadCount) }

        <View style={styles.header}>
          <Text style={styles.heading}>Reservations</Text>
          <Text style={[styles.subHeading, styles.grayText]}>{renderItemsList.length} Total</Text>
        </View>

        <View style={styles.optionView}>
          <View style={styles.innerOption}>
            <Text style={this.state.mine ? styles.blueText : styles.grayText}>Mine</Text>
            <Switch
              value={!this.state.mine}
              onSyncPress={val => {this.setState({mine: !val, detailItem: null})}}
              width={60}
              height={30}
              backgroundActive='#2980b9'
              backgroundInactive='#2980b9'
            />
            <Text style={this.state.mine ? styles.grayText : styles.blueText}>Renters</Text>
          </View>
        </View>

        <View style={styles.scrollView}>
          {
            renderItemsList.length != 0 ?
              <ScrollView style={{flex:1, backgroundColor: 'transparent'}}>
                <GridView
                  itemWidth={gridItemWidth}
                  items={renderItemsList}
                  renderItem={item => renderFunc(item)}
                />
              </ScrollView>
              :
              <View style={styles.emptyTextView}>
                <Text style={styles.emptyText}>You have no reservation</Text>
              </View>
          }
        </View>
        <QuickSearchButton
          onPress={() => {
            resetAction = NavigationActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({ routeName: 'MapScreen'})
              ]
            })
            this.props.navigation.dispatch(resetAction)
          }}
        />
        <Modal
          transparent={true}
          visible={this.state.showDetail}
          onRequestClose={() => {this.setState({showDetail: false})}}
        >
          <View style={styles.modalBackground}>
            <TouchableOpacity
              style={styles.modalExit}
              onPress={() => { this.setState({showDetail: false}) }}
            >
            </TouchableOpacity>
            <View style={styles.detailView}>
              <TouchableOpacity
                style={styles.detailViewCloseButton}
                onPress={() => { this.setState({showDetail: false}) }}
              >
                <Image
                  source={images.modalCloseButton}
                  style={{width: 22, height: 22}}
                  resizeMode='stretch'
                />
              </TouchableOpacity>
              <Text style={styles.detailText}>{this.state.mine ? 'Owner:' :  'Renter:'} {this.getName(detailItem)}</Text>
              <View>
                <Text style={styles.detailText} numberOfLines={3}>
                  Spot: {detailItem === null ? '' : detailItem.spotInfo.location}
                </Text>
                <Text style={styles.detailText}>
                  spot #{detailItem === null ? '' : detailItem.spotInfo.id + 1}
                </Text>
              </View>
              <View>
                <Text style={styles.detailText}>
                  Vehicle: {this.getVehicle(detailItem)}
                </Text>
                <Text style={styles.detailText}>
                  Color: {this.getColor(detailItem)}
                </Text>
              </View>
              <View>
                <Text style={styles.detailText}>Date : {detailItem === null ? '' : detailItem.date}</Text>
                <Text style={styles.detailText}>Time : {detailItem === null ? '' : detailItem.from} - {detailItem === null ? '' : detailItem.to}</Text>
              </View>
              <View style={styles.detailButtonBox}>
                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() => this.callUser(this.getPhone(detailItem))}
                >
                  <Text style={styles.detailButtonText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() => this.messageUser(this.getUsername(detailItem))}
                >
                  <Text style={styles.detailButtonText}>Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/*-----New Spot Notification-----*/}
        <Modal
          transparent
          animationType='fade'
          visible={this.state.newSpot}
          onRequestClose={()=>{this.setState({newSpot: false})}}
        >
          <View style={styles.modalBackground}>
            <TouchableOpacity
              style={styles.modalExit}
              onPress={() => { this.setState({newSpot: false}) }}
            />
            <View style={{
              backgroundColor: 'white',
              borderRadius: 50,
              borderWidth: 0.5,
              borderColor: '#666',
              width: width(80),
              height: 220,
              padding: 30,
              paddingLeft: 40,
              paddingRight: 40,
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Text style={styles.newSpotName}>{this.state.newSpotData.name} Just joint!</Text>
              <Image
                style={styles.newSpotImage}
                source={this.state.newSpotData.image}
                resizeMode='stretch'
              />
              <TouchableOpacity
                style={styles.newSpotCheckButton}
                onPress={()=>{
                  this.setState({newSpot: false})
                  this.props.navigation.navigate('SpotScreen')
                }}
              >
                <Text style={styles.newSpotCheckText}>Check it !</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: 'white'
  },
  // Menu Button Styles //
  menuButtonContainer: {
    height: 40,
    paddingTop: 5,
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
  header: {
    marginTop: 15,
    alignItems: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#34495e'
  },
  subHeading: {
    marginTop: 10,
  },
  grayText: {
    fontSize: 15,
    color: '#666'
  },
  blueText: {
    fontSize: 15,
    color: '#3498db'
  },
  optionView: {
    width: '100%',
    paddingTop: 10,
  },
  innerOption: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '50%',
    paddingRight: 20,
  },
  scrollView: {
    flex: 1,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 25,
    paddingBottom: 40,
  },
  emptyTextView: {
    flex: 1,
    marginBottom: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    width: width(50),
    fontSize: 25,
    color: '#999'
  },
  gridItem: {
    height: (width(100) - 41) / 32 * 15,
    // backgroundColor: 'blue'
  },
  infoBox: {
    flex: 1,
    marginTop: 24,
    marginBottom: 18,
    marginLeft: 15,
  },
  driverName: {
    fontSize: 18,
    color: '#34495e',
  },
  driverInfo: {
    flex: 1,
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 35,
  },
  infoText: {
    fontSize: 12,
    color: '#95a5a6',
  },
  picView: {
    alignSelf: 'flex-end',
    width: '100%',
    height: 30,
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
  },
  profilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  carPic: {
    marginLeft: 10,
    width: 50,
    height: 30,
    borderRadius: 15,
  },
  keyPic: {
    marginLeft: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalExit: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  detailView: {
    width: width(70),
    height: 350,
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: 'black',
    backgroundColor: 'white',
    padding: 30,
    justifyContent: 'space-between'
  },
  detailViewCloseButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 30,
    height: 30,
    borderRadius: 3,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center'
  },
  detailText: {
    fontSize: 18,
    color: '#888',
    backgroundColor: 'transparent'
  },
  detailButtonBox: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  detailButton: {
    width: (width(70) - 80) / 2,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#aaa',
    backgroundColor: '#2980b9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  detailButtonText: {
    color: 'white',
    fontSize: 18,
    backgroundColor: 'transparent'
  },
  renterActionView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 5,
    paddingRight: 20,
  },
  renterActionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 20,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 5,
  },
  renterActionText: {
    fontSize: 15,
    color: '#666',
    backgroundColor: 'transparent',
  },
  popup: {
    marginBottom: 40,
    width: '100%',
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  popupButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  popupNormal: {
    backgroundColor: '#2980b9'
  },
  exitPopup: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#EC407A'
  },
  popupTop: {
    width: 150,
    height: 65,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  popupBottom: {
    width: 270,
    height: 60,
    marginBottom: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  //   New Spot Notification
  newSpotName: {
    color: '#aaa',
    fontSize: 20,
  },
  newSpotImage: {
    width: '85%',
    height: 60,
  },
  newSpotCheckButton: {
    width: '100%',
    height: 40,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#aaa',
    backgroundColor: '#479ac8',
    justifyContent: 'center',
    alignItems: 'center'
  },
  newSpotCheckText: {
    color: 'white',
    fontSize: 20
  }
});

const mapStateToProps = state => ({
  user: state.user
})

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(ActionCreators, dispatch);
}

//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
