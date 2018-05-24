//import liraries
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
  ImageBackground,
  TouchableOpacity,
  TouchableHighlight,
  ScrollView,
  Modal,
  TextInput,
  Keyboard,
  PanResponder,
  TouchableWithoutFeedback,
  BackHandler
} from 'react-native';
// Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ActionCreators } from '../redux/actions';
import apiConfig from '../api/config';

import { NavigationActions } from 'react-navigation'
import { width, height } from 'react-native-dimension'
import ImagePicker from 'react-native-image-picker'
import ImageResizer from 'react-native-image-resizer'
import QuickSearchButton from './quickSearchButton'
import images from '../utils/images'
import ModalDropdown from 'react-native-modal-dropdown'
import MapView from 'react-native-maps';
import RNGooglePlaces from 'react-native-google-places';
import SendBird from 'sendbird';
import { EventRegister } from 'react-native-event-listeners'
import DatePicker from 'react-native-datepicker'

import * as RealmDB from '../redux/realm';

var sb = null;

// create a component
class VehicleScreen extends Component {

  constructor(props) {
    super(props)
    
    sb = SendBird.getInstance();
    this.state = {
      unreadCount: 0,
      channelList: [],
      listQuery:sb.GroupChannel.createMyGroupChannelListQuery(),
      vehicles: [],
      spots: [],
      addVehicle: false,
      editVehicle: false,
      vehicle: null,
      deleteVehicle: false,
      deleteSpot: false,
      deleteIndex: -1,
      buttonRect: null,
      searchSpot: true,
      makeDropdownWidth: 100,
      makes: [],
      makeIndex: -1,
      models: [],
      modelIndex: -1,
      plate: '',
      color: '',
      newVehicleImage: images.imagePickerPlaceholder,
      // ADD SPOT
      addSpot: false,
      addSpotStep: 0,
      editSpot: false,
      _spot: null,
      setupAvailability: false,
      findSpot: true,
      filter: '',
      spot: {
        latitude: 37.78825,
        longitude: -122.4324
      },
      region: {
        longitude: -122.4324,
        latitude: 37.78825,
        longitudeDelta: 0.0421,
        latitudeDelta: 0.0922,
      },
      searchResults: [],
      selectedID: 0,
      propertyName: '',
      spotType: 1,
      spotDescription: '',
      spotImage: images.imagePickerPlaceholder,
      availability: [false, false, false, false, false, false, false],
      from: '',
      to: '',
      startDate: null,
      endDate: null,
      rate: 0,
      descriptionActive: false
    }

    this.getCarMakeList();
  }

  componentWillMount() {
    this.listener = EventRegister.addEventListener('customEvent', (unreadCount) => {
      this.setState({
        unreadCount,
      })
    })
/*
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        const {buttonRect} = this.state;
        alert(JSON.stringify(buttonRect))
        const x = evt.nativeEvent.pageX;
        const y = evt.nativeEvent.pageY;
        if (buttonRect.x <= x && x <= buttonRect.x + buttonRect.width && buttonRect.y <= y && y <= buttonRect.y + buttonRect.height) {
          if (this.state.deleteVehicle) {
            this.deleteVehicle()
          } else {
            this.deleteSpot()
          }
        } else {
          alert('sdfsd')
          this.setState({deleteVehicle: false, deleteSpot: false, deleteIndex: -1})
        }
        // gestureState.d{x,y} will be set to zero now
      },
    });*/
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', function() {
      return true
    });

    const vehicles = RealmDB.getVehicles();
    const spots = RealmDB.getSpotsByUsername(this.props.user.username);
    this.setState({vehicles, spots})

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

  getCarMakeList() {
    const {getCarMakes} = this.props;
    getCarMakes()
      .then((makes) => {
        this.setState({makes})
      });
  }

  onAddVehicle() {
    this.setState({
      addVehicle: true,
      plate: '',
      color: '',
      newVehicleImage: null,
      makeIndex: -1,
      modelIndex: -1,
      models: [],
    })
  }

  editVehicle(vehicle) {
    const {makes, models} = this.state;
    let makeNames = [];
    makeNames = makes.map(make => {
      return make.make_display
    })
    const makeId = makeNames.indexOf(vehicle.make);
    const {getCarModels} = this.props;
    getCarModels(this.state.makes[makeId].make_id)
      .then(models => {
        let modelNames = [];
        modelNames = models.map(model => {
          return model.model_name
        })
        const modelId = modelNames.indexOf(vehicle.model);
        this.setState({
          editVehicle: true,
          plate: vehicle.plate,
          color: vehicle.color,
          newVehicleImage : {uri: apiConfig.url + vehicle.picture},
          makeIndex: makeId,
          modelIndex: modelId,
          models,
          vehicle,
        });
      })
  }

  deleteVehicle() {
    const {vehicles, deleteIndex} = this.state;
    const vehicle = vehicles[deleteIndex];
    const {deleteVehicle} = this.props;
    deleteVehicle(vehicle.id)
      .then(() => {
        const vehicles = RealmDB.getVehicles();
        this.setState({vehicles, deleteVehicle: false, deleteIndex: -1})
      }, (err) => {
        alert(err)
      });
  }

  onAddSpot() {
    this.setState({
      addSpot: true,
      findSpot: true,
      addSpotStep: 0,
      filter: '',
      searchResults: [],
      selectedID: 0,
      propertyName: '',
      spotType: 1,
      spotDescription: '',
      spotImage: images.imagePickerPlaceholder,
      availability: [
        false,
        false,
        false,
        false,
        false,
        false,
        false
      ],
      from: '',
      to: '',
      startDate: null,
      endDate: null,
      rate: 0,
      descriptionActive: false
    });
  }

  closeAddSpotModals() {
    this.setState({
      addSpot: false,
      editSpot: false,
      setupAvailability: false,
      findSpot: true,
      filter: '',
      searchResults: [],
      selectedID: 0,
      propertyName: '',
      spotType: 1,
      spotDescription: '',
      spotImage: images.imagePickerPlaceholder,
      availability: [false, false, false, false, false, false, false],
      from: '',
      to: '',
      rate: 0,
    })
  }

  editSpot(spot) {
    this.setState({editSpot: true, findSpot: true, addSpotStep: 0, _spot: spot,
      propertyName: spot.name, spotType: spot.type, spotDescription: spot.description,
      spotImage: {uri: apiConfig.url + spot.image}, from: spot.from, to: spot.to ,rate: spot.rate,
      availability: spot.availability
    });
    this.onChangeFilter(spot.location)
  }

  deleteSpot() {
    const { spots, deleteIndex } = this.state;
    const { user } = this.props;
    const spot = spots[deleteIndex];
    const {deleteSpot} = this.props;
    deleteSpot(spot.id)
      .then(() => {
        const spots = RealmDB.getSpotsByUsername(user.username);
        this.setState({spots, deleteSpot: false, deleteIndex: -1})
      }, (err) => {
        alert(err)
      });
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

  _renderInformation(title, listData, renderItemFunc, onAddFunc) {
    return (
      <View style={{
        alignItems: 'center',
        flex: 1
      }}>
        <Text style={{color: '#476772', fontSize: 22, fontWeight: 'bold', marginTop: 12}}>{title}</Text>
        <Text style={{color: '#aaa', fontSize: 15, marginTop: 10}}>{listData.length} Total</Text>
        <View style={{
          flex: 1,
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          paddingLeft: 12,
          paddingRight: 12,
        }}>
          <View style={{height: 150, width: '100%'}}>
          <ScrollView
            style={{
              width: '100%',
            }}
            horizontal
          >
            <View style={{height: '100%', alignItems: 'center', flexDirection: 'row'}}>
              {
                listData.map( (item, index) => {
                  return renderItemFunc(item, index)
                })
              }
              <View style={{width: 180, alignItems: 'center'}}>
              <TouchableOpacity
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  borderWidth: 3,
                  borderColor: '#888',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onPress={()=>{onAddFunc()}}
              >
                <Image
                  source={images.vehicleAdd}
                  style={{width: 30, height: 30}}
                />
              </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          </View>
        </View>
      </View>
    )
  }

  _renderVehicleItem(vehicle, index) {
    const {deleteVehicle, deleteIndex} = this.state;
    return (
      <View key={index} style={{
        marginRight: 3,
        justifyContent: 'center',
      }}>
        <ImageBackground
          source={images.gridItemBox}
          style={{height: '100%', width: 180}}
          resizeMode='contain'
        >
        <TouchableOpacity
          style={{width: '100%', height: '100%'}}
          onPress={() => {this.editVehicle(vehicle)}}
          onLongPress={() => {this.setState({deleteVehicle: true, deleteIndex: index})}}
        >
          <View style={{
            margin: 23,
            marginRight: 0,
            flex: 1,
            justifyContent: 'space-around',
          }}>
            <Text style={styles.itemName}>{vehicle.make}</Text>
            <View>
              <Text style={styles.itemDetail}>Color: {vehicle.color}</Text>
              <Text style={styles.itemDetail}>Plate number: {vehicle.plate}</Text>
            </View>
            <Image
              source={{uri: apiConfig.url + vehicle.picture}}
              style={styles.vehicleImage}
            />
          </View>
        </TouchableOpacity>
        {
          (deleteVehicle && deleteIndex === index) ?
          <View
            style={{position: 'absolute', width: 35, height: 35, right: 10, top: 0}}
          >
            <TouchableOpacity
              style={{width: '100%', height: '100%'}}
              onPress={() => {
                this.deleteVehicle()
              }}
            >
            <Image
              source={images.deleteIcon}
              style={{width: '100%', height: '100%'}}
              resizeMode='stretch'
            />
            </TouchableOpacity>
          </View>
          :
          null
        }
        </ImageBackground>
      </View>
    )
  }

  _renderSpotItem(spot, index) {
    const {deleteSpot, deleteIndex} = this.state;
    return (
      <View key={index} style={{
        marginRight: 3,
        justifyContent: 'center',
      }}>
        <ImageBackground
          source={images.gridItemBox}
          style={{height: '100%', width: 180}}
          resizeMode='contain'
        >
        <TouchableOpacity
          style={{width: '100%', height: '100%'}}
          onPress={() => {this.editSpot(spot)}}
          onLongPress={() => {this.setState({deleteSpot: true, deleteIndex: index})}}
        >
          <View style={{
            margin: 23,
            marginRight: 15,
            marginBottom: 20,
            flex: 1,
            justifyContent: 'space-around',
          }}>
            <Text style={styles.itemName}>{spot.name}</Text>
            <View>
              <Text style={styles.itemDetail} numberOfLines={2}>Location: {spot.location}</Text>
              <Text style={styles.itemDetail}>Spot #{spot.id+1}</Text>
              <Text style={styles.itemDetail}>Description: {spot.description}</Text>
            </View>
          </View>
        </TouchableOpacity>
        {
          (deleteSpot && deleteIndex === index) ?
          <View
            style={{position: 'absolute', width: 35, height: 35, right: 10, top: 0}}
          >
            <TouchableOpacity
              style={{width: '100%', height: '100%'}}
              onPress={() => {
                this.deleteSpot()
              }}
            >
            <Image
              source={images.deleteIcon}
              style={{width: '100%', height: '100%'}}
              resizeMode='stretch'
            />
            </TouchableOpacity>
          </View>
          :
          null
        }
        </ImageBackground>
      </View>
    )
  }

  _renderModalCloseButton(onPress) {
    return (
      <TouchableOpacity
        style={styles.modalCloseButton}
        onPress={onPress}
      >
        <Image
          source={images.modalCloseButton}
          style={{width: 24, height: 24}}
          resizeMode='stretch'
        />
      </TouchableOpacity>
    )
  }

  _renderModalTitle(title) {
    return (
      <Text style={styles.modalTitle}>
        { title }
      </Text>
    )
  }

  onMakeSelect(index) {
    var changed = this.state.makeIndex !== index
    this.setState({makeIndex: index})
    const {getCarModels} = this.props;
    getCarModels(this.state.makes[index].make_id)
      .then(models => {
        const prevModelIndex = this.state.modelIndex
        this.setState({models, modelIndex: changed ? -1 : prevModelIndex})
      })
    Keyboard.dismiss();
  }

  onModelSelect(index) {
    this.setState({modelIndex: index})
    Keyboard.dismiss();
  }

  selectVehicleImage() {
    ImagePicker.showImagePicker({}, (response)  => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else {
        let source = { uri: response.uri };

        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };

        this.setState({
          newVehicleImage: source
        });
        Keyboard.dismiss();
      }
    });
  }
  
  saveVehicle() {
    const { makes, makeIndex, models, modelIndex, plate, color, newVehicleImage } = this.state;
    const { user, addVehicle, updateVehicle } = this.props;

    if (makeIndex === -1) {
      alert('Please choose vehicle make!');
      return;
    }
    if (modelIndex === -1) {
      alert('Please choose vehicle model!');
      return;
    }
    if (plate === '') {
      alert('License Plate cannot be empty!');
      return;
    }
    if (color === '') {
      alert('Color cannot be empty!');
      return;
    }
    if (newVehicleImage === images.imagePickerPlaceholder) {
      alert('Please select vehicle image!');
      return;
    }

    ImageResizer.createResizedImage(newVehicleImage.uri, 512, 512, 'PNG', 100).then((res) => {
      let source = { uri: res.uri, type: 'image/jpg', name: res.name };
      if (this.state.addVehicle) {
        addVehicle(user.username, makes[makeIndex].make_display, models[modelIndex].model_name, plate, color, source)
          .then(() => {
            const vehicles = RealmDB.getVehicles();
            this.setState({addVehicle: false, vehicles})
          }, (err) => {
            alert(err)
          });
      } else {
        updateVehicle(this.state.vehicle.id, user.username, makes[makeIndex].make_display, models[modelIndex].model_name, plate, color, source)
          .then(() => {
            const vehicles = RealmDB.getVehicles();
            this.setState({editVehicle: false, vehicles})
          }, (err) => {
            alert(err)
          })
      }
    }).catch((err) => {
      alert(err)
    })
  }

  saveSpot() {
    const { editSpot, spot, searchResults, selectedID, propertyName, spotType, spotDescription, spotImage, from, to, startDate, endDate, rate, availability } = this.state;
    if (from === '') {
      alert('From cannot be empty');
      return;
    }
    if (to === '') {
      alert('To cannot be empty');
      return;
    }
    let fromHr, fromMin, toHr, toMin
    fromHr = parseInt(from.slice(0, 2))
    fromMin = parseInt(from.slice(3, 5))
    toHr = parseInt(to.slice(0, 2))
    toMin = parseInt(to.slice(3, 5))
    if (fromHr > toHr) {
      alert('End time must be bigger than start time')
      return
    }
    if (fromHr === toHr && fromMin >= toMin) {
      alert('End time must be bigger than start time')
      return
    }
    if (startDate === undefined) {
      alert('Please choose start date')
      return
    }
    if (endDate === undefined) {
      alert('Please choose start date')
      return
    }
    const { user, addSpot, updateSpot } = this.props;
    ImageResizer.createResizedImage(spotImage.uri, 512, 512, 'PNG', 100).then((res) => {
      let source = { uri: res.uri, type: 'image/jpg', name: res.name };
      if (this.state.addSpot) {
        addSpot(user.username, spot, propertyName, searchResults[selectedID].fullText, spotType,
          spotDescription, source, availability, from, to, startDate, endDate, rate)
          .then(() => {
            const spots = RealmDB.getSpotsByUsername(user.username);
            this.setState({addSpot: false, spots})
          }, (err) => {
            alert(err)
          });
      } else {
        updateSpot(this.state._spot.id, spot, propertyName, searchResults[selectedID].fullText, spotType,
          spotDescription, source, availability, from, to, startDate, endDate, rate)
          .then(() => {
            const spots = RealmDB.getSpotsByUsername(user.username);
            this.setState({editSpot: false, spots})
          }, (err) => {
            alert(err)
          });
      }
    }).catch((err) => {
      alert(err)
    })
  }

  _renderAddSpotContent() {
    const { addSpotStep, filter, searchResults, propertyName, unreadCount, addSpot, editSpot } = this.state;
    const canMoveNext = searchResults.length !== 0 && !this.state.findSpot;
    
    if (addSpotStep === 0) {
      return (
        <View style={styles.mapView}>
          <MapView
            style={styles.map}
            region={this.state.region}
            onRegionChangeComplete={(region) => {this.setState({region})}}
          >
          {
            searchResults.length != 0 ?
            <MapView.Marker
              coordinate={this.state.spot}
            />
            : null
          }
          </MapView>
          { this._renderMenuButton(unreadCount) }
          <Text style={styles.mapViewTitle}>Add spot</Text>
          <TouchableOpacity
            style={styles.findButton}
            onPress={()=>{this.setState({findSpot: true})}}
          >
            <Image
              source={images.mapSearch}
              style={{flex: 1}}
              resizeMode='contain'
            />
          </TouchableOpacity>
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
              marginTop: Platform.select({ios: 20, android: 0}) + 50,
            }}>
              <View style={{
                padding: 17,
                paddingLeft: 30,
                borderRadius: 15,
                width: '100%',
                backgroundColor: 'white',
                borderWidth: 0.5,
                borderColor: '#555'
              }}>
                <TextInput
                  style={styles.textInput}
                  underlineColorAndroid='transparent'
                  placeholder='Enter address here'
                  value={filter}
                  onChangeText={(e) => {this.onChangeFilter(e)}}
                  autoCorrect={false}/>
              </View>
              {
                searchResults.map((spot, index) => {
                  return this._renderSearchResultItem(spot, index)
                })
              }
            </View>
          </Modal>
          {
            canMoveNext ?
            <TouchableOpacity
              style={styles.addSpotNextButton}
              onPress={() => {this.setState({addSpotStep: 1, setupAvailability: false})}}
            >
              <Text style={{color: 'white', fontSize: 20, fontWeight: 'bold'}}>Next</Text>
            </TouchableOpacity>
            : null
          }
        </View>
      )
    }
    if (addSpotStep === 1) {
      return (
        <Modal
          animationType='none'
          visible={addSpot || editSpot}
          onRequestClose={() => {this.setState({addSpot: false, editSpot: false})}}
        >
          <ScrollView scrollEnabled={false} style={{flex: 1}}>
          <View style={{
            width: width(100),
            height: height(100) - Platform.select({ios: 0, android: 25}),
            padding: 15,
            paddingTop: Platform.select({ios: 80, android: 60}),
          }}>
            <ImageBackground
              source={images.modalFrame}
              style={{
                flex: 1,
                padding: 35,
                paddingLeft: 25,
                paddingRight: 45,
              }}
              resizeMode='stretch'
            >
              <View style={{flex: 1}}>
                <Text style={styles.addSpotLabel}>Property Nickname:</Text>
                <TextInput
                  style={{
                    padding: 0,
                    borderBottomColor: '#aaa',
                    borderBottomWidth: 1,
                    marginTop: 5,
                    marginBottom: 10,
                    color: '#888',
                    fontSize: 18
                  }}
                  underlineColorAndroid='transparent'
                  autoCorrect={false}
                  value={propertyName}
                  onChangeText={(e) => {this.setState({propertyName: e})}}
                />
                <Text style={styles.addSpotLabel}>What type of spot are you listing:</Text>
                <View style={{flexDirection: 'row', borderWidth: 1, borderColor: '#aaa', borderRadius: 3, marginTop: 5, marginBottom: 10}}>
                  <TouchableOpacity
                    style={[this.state.spotType === 0 ? styles.spotTypeActive : styles.spotTypeInactive,
                      {borderRightColor: '#aaa', borderRightWidth: 1}]}
                    onPress={()=>{this.setState({spotType: 0})}}
                  >
                    <Text style={styles.addSpotLabel}>Garage</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={this.state.spotType === 1 ? styles.spotTypeActive : styles.spotTypeInactive}
                    onPress={()=>{this.setState({spotType: 1})}}
                  >
                    <Text style={styles.addSpotLabel}>Open spot</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.addSpotLabel}>Description:</Text>
                <TextInput
                  style={{
                    marginTop: 5,
                    width: '100%',
                    height: 100,
                    padding: 0,
                    borderWidth: 1,
                    borderColor: '#888',
                    padding: 7,
                    textAlignVertical: 'top',
                    color: '#888',
                    fontSize: 18
                  }}
                  placeholder='Optional'
                  multiline={true}
                  value={this.state.spotDescription}
                  onChangeText={(e) => this.setState({spotDescription: e})}
                  onFocus={() => {this.setState({descriptionActive: true})}}
                  autoCorrect={false}
                />
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {this.selectSpotImage()}}
                  >
                    <Image
                      source={this.state.spotImage}
                      style={{width: 240, height: 160, borderWidth: 1, borderColor: '#aaa'}}
                      resizeMode='stretch'
                    />
                  </TouchableOpacity>
                </View>
                <View style={{
                  width: width(70),
                  height: 50,
                  alignSelf: 'center',
                  justifyContent: 'space-between',
                }}>
                  <TouchableOpacity
                    style={styles.addSpotBottomButton}
                    onPress={()=>{ this.onSetupAvailability() }}
                  >
                    <Text style={styles.buttonText}>Set up availability</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          </View>
          { 
            this._renderModalCloseButton(() => {
              this.closeAddSpotModals()
            })
          }
          { this._renderModalTitle(addSpot ? 'Add Spot' : 'Edit Spot') }
          </ScrollView>
        </Modal>
      )
    }
    if (addSpotStep === 2) {
      const { from, to, rate } = this.state;
      return (
        <Modal
          animationType='none'
          visible={addSpot || editSpot}
          onRequestClose={() => {this.setState({addSpot: false, editSpot: false})}}
        >
          <ScrollView scrollEnabled={false} style={{flex: 1}}>
          <View style={{
            width: width(100),
            height: height(100) - Platform.select({ios: 0, android: 25}),
            padding: 15,
            paddingTop: Platform.select({ios: 80, android: 60}),
          }}>
            <ImageBackground
              source={images.modalFrame}
              style={{
                flex: 1,
                padding: 25,
                paddingTop: 70,
                paddingBottom: 35
              }}
              resizeMode='stretch'
            >
              <View style={{flex: 1}}>
                <View style={{height: 100, justifyContent: 'space-between'}}>
                  <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between'}}>
                    { this._renderDayOfWeekButton(0, 'Mon') }
                    { this._renderDayOfWeekButton(1, 'Tue') }
                    { this._renderDayOfWeekButton(2, 'Wed') }
                    { this._renderDayOfWeekButton(3, 'Thu') }
                    { this._renderDayOfWeekButton(4, 'Fri') }
                  </View>
                  <View style={{width: '40%', flexDirection: 'row', alignSelf: 'center', justifyContent: 'space-between'}}>
                    { this._renderDayOfWeekButton(5, 'Sat') }
                    { this._renderDayOfWeekButton(6, 'Sun') }
                  </View>
                </View>

                <View style={{flexDirection: 'row', justifyContent: 'space-around', marginTop: 27, marginBottom: 27}}>
                  <View>
                    <Text style={styles.addSpotLabel}>From</Text>
                    <DatePicker
                      style={{width: width(25), height: 35,}}
                      customStyles={{dateInput:{
                        width: width(25), height: 30
                      }}}
                      date={from}
                      mode="time"
                      minuteInterval={30}
                      showIcon={false}
                      placeholder="Select Time"
                      confirmBtnText="Confirm"
                      cancelBtnText="Cancel"
                      onDateChange={(time) => {
                        let _min = parseInt(time.slice(3, 5))
                        _min -= _min % 30
                        const _minStr = _min < 10 ? '0' + _min.toString() : _min.toString()
                        this.setState({from: time.slice(0, 3) + _minStr})
                      }}
                    />
                  </View>
                  <View>
                    <Text style={styles.addSpotLabel}>To</Text>
                    <DatePicker
                      style={{width: width(25), height: 35,}}
                      customStyles={{dateInput:{
                        width: width(25), height: 30
                      }}}
                      date={to}
                      minuteInterval={30}
                      mode="time"
                      showIcon={false}
                      placeholder="Select Time"
                      confirmBtnText="Confirm"
                      cancelBtnText="Cancel"
                      onDateChange={(time) => {
                        let _min = parseInt(time.slice(3, 5))
                        _min -= _min % 30
                        const _minStr = _min < 10 ? '0' + _min.toString() : _min.toString()
                        this.setState({to: time.slice(0, 3) + _minStr})
                      }}
                    />
                  </View>
                </View>

                <View style={{flexDirection: 'row', justifyContent: 'space-around', marginBottom: 27}}>
                  <View>
                    <Text style={styles.addSpotLabel}>Date from</Text>
                    <DatePicker
                      style={{width: width(25), height: 35,}}
                      customStyles={{dateInput:{
                        width: width(25), height: 30
                      }}}
                      date={this.state.startDate}
                      mode="date"
                      showIcon={false}
                      placeholder="Select Date"
                      format="YYYY-MM-DD"
                      confirmBtnText="Confirm"
                      cancelBtnText="Cancel"
                      onDateChange={(date) => {this.setState({startDate: date})}}
                    />
                  </View>
                  <View>
                    <Text style={styles.addSpotLabel}>Date to</Text>
                    <DatePicker
                      style={{width: width(25), height: 35,}}
                      customStyles={{dateInput:{
                        width: width(25), height: 30
                      }}}
                      date={this.state.endDate}
                      mode="date"
                      showIcon={false}
                      placeholder="Select Date"
                      minDate={this.state.startDate}
                      format="YYYY-MM-DD"
                      confirmBtnText="Confirm"
                      cancelBtnText="Cancel"
                      onDateChange={(date) => {this.setState({endDate: date})}}
                    />
                  </View>
                </View>

                <Text style={{textAlign: 'center', color: '#aaa', fontSize: 20}}>Hourly rate</Text>
                <View style={{
                  justifyContent: 'center',
                  height: 50,
                  marginTop: 5,
                }}>
                  <View style={{flexDirection: 'row', marginLeft: 25, marginRight: 25, height: 12}}>
                    <View style={rate >= 1 ? styles.fill : styles.unfill}/>
                    <View style={rate >= 1.5 ? styles.fill : styles.unfill}/>
                    <View style={rate >= 2 ? styles.fill : styles.unfill}/>
                    <View style={rate >= 2.5 ? styles.fill : styles.unfill}/>
                    <View style={rate >= 3 ? styles.fill : styles.unfill}/>
                  </View>
                  <View style={{position: 'absolute', width: '100%', height: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    { this._renderRateButton(0, 50) }
                    { this._renderRateButton(1, 30) }
                    { this._renderRateButton(1.5, 30) }
                    { this._renderRateButton(2, 30) }
                    { this._renderRateButton(2.5, 30) }
                    { this._renderRateButton(3, 58) }
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.bottomButton, {bottom: 0}]}
                  onPress={()=>{this.saveSpot()}}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
          { this._renderModalCloseButton(()=>{this.setState({addSpot: false, editSpot: false})}) }
          { this._renderModalTitle('Set up availability') }
          </ScrollView>
        </Modal>
      )
    }
  }

  _renderRateButton(v, d) {
    const {rate} = this.state;
    return (
      <TouchableOpacity
        onPress={() => this.setState({rate: v})}
        activeOpacity={0.9}
      >
        <View
          style={{
            width: d,
            height: d,
            borderRadius: d/2,
            borderWidth: 1,
            borderColor: '#aaa',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: rate >= v ? '#aaa' : 'white'
          }}
        >
          <Text style={{
            color: rate >= v ? 'white' : 'black',
            backgroundColor: 'transparent',
            fontSize: 15,
            fontWeight: 'bold'
          }}>{v}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  _renderDayOfWeekButton(i, label) {
    const { availability } = this.state;
    return (
      <TouchableOpacity
        onPress={() => {
          availability[i] = !availability[i];
          this.setState({availability})
        }}
        style={{
          width: 50,
          height: 35,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 7,
          borderWidth: 1,
          borderColor: '#aaa',
          backgroundColor: availability[i] ? '#e8e8e8' : '#fff'
        }}
      >
        <Text style={{color: '#aaa', fontSize: 18}}>{label}</Text>
      </TouchableOpacity>
    )
  }

  selectSpotImage() {
    ImagePicker.showImagePicker({}, (response)  => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else {
        let source = { uri: response.uri };

        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };

        this.setState({
          spotImage: source
        });
      }
    });
  }

  onSetupAvailability() {
    const { propertyName, spotImage } = this.state;
    if (propertyName === '') {
      alert('Property Nickname cannot be empty');
      return;
    }
    if (spotImage === images.imagePickerPlaceholder) {
      alert('Please choose spot image');
      return;
    }
    this.setState({addSpotStep: 2});
  }

  onChangeFilter(filter) {
    this.setState({filter})
    RNGooglePlaces.getAutocompletePredictions(filter, {
      type: 'address',
      country: 'US'
    })
      .then((place) => {
        this.setState({searchResults: place})
        RNGooglePlaces.lookUpPlaceByID(place[0].placeID)
          .then((results) => {
            const spot = {
              latitude: results.latitude,
              longitude: results.longitude
            }
            const region = {
              ...spot,
              latitudeDelta: this.state.region.latitudeDelta,
              longitudeDelta: this.state.region.longitudeDelta
            }
            this.setState({spot, region})
          })
          .catch((error) => alert(error.message));
      })
      .catch(error => this.setState({searchResults: []}));
  }

  onSpotSelect(index) {
    this.setState({selectedID: index})
    RNGooglePlaces.lookUpPlaceByID(this.state.searchResults[index].placeID)
      .then((results) => {
        const spot = {
          latitude: results.latitude,
          longitude: results.longitude
        }
        const region = {
          ...spot,
          latitudeDelta: this.state.region.latitudeDelta,
          longitudeDelta: this.state.region.longitudeDelta
        }
        this.setState({spot, region})
      })
      .catch((error) => console.log(error.message));
  }

  _renderSearchResultItem(spot, index) {
    const address = spot.primaryText + ' ' + spot.secondaryText
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
            this.onSpotSelect(index)
          }}
        >
          <Text style={{color: 'white', fontSize: 20}}>{address}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    const { unreadCount, makes, makeIndex, models, modelIndex, plate, color, newVehicleImage, vehicles, addVehicle, editVehicle, addSpot, editSpot } = this.state;
    let makeNames = [];
    makeNames = makes.map(make => {
      return make.make_display
    })
    let modelNames = [];
    modelNames = models.map(model => {
      return model.model_name
    })
    return (
      <View style={styles.container}>
        { this._renderMenuButton(unreadCount) }
        <View style={{
          flex: 1,
        }}>
          { this._renderInformation('Vehicles', vehicles, this._renderVehicleItem.bind(this), this.onAddVehicle.bind(this)) }
        </View>
        <View style={styles.separator}></View>
        <View style={{
          flex: 1,
        }}>
          { this._renderInformation('Parking spots', this.state.spots, this._renderSpotItem.bind(this), this.onAddSpot.bind(this)) }
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
        {/*   Add Vehicle   */}
        <Modal
          //transparent
          visible={addVehicle || editVehicle}
          onRequestClose={() => {this.setState({addVehicle: false})}}
        >
          <ScrollView scrollEnabled={false} contentContainerStyle={{height: height(100) - Platform.select({android: 24, ios: 0})}}>
            { this._renderModalCloseButton(()=>{this.setState({addVehicle: false, editVehicle: false})}) }
            { this._renderModalTitle(addVehicle ? 'Add Vehicle' : 'Edit Vehicle') }
            <ImageBackground
              source={images.modalFrame}
              style={{
                flex: 1,
                margin: 15,
                marginTop: Platform.select({ios: 80, android: 60}),
                padding: 35,
                paddingLeft: 25,
                paddingRight: 45,
              }}
              resizeMode='stretch'
            >
              <View style={[styles.inputLine, {marginRight: 20, alignItems: 'flex-end'}]}>
                <Text style={styles.inputLabel}>Make:</Text>
                <View
                  style={styles.selectMakeOuter}
                  onLayout={(event) => {
                    var {width} = event.nativeEvent.layout;
                    this.setState({makeDropdownWidth: width})
                  }}
                >
                  <ModalDropdown
                    options={makeNames}
                    enableEmptySections={true}
                    style={styles.selectMake}
                    dropdownStyle={{width: this.state.makeDropdownWidth}}
                    dropdownTextStyle={[styles.inputLabel, {paddingRight: 0}]}
                    onSelect={(index) => {this.onMakeSelect(index)}}
                  >
                    <View style={styles.selectMakeInner}>
                      <View style={{flex: 1, justifyContent: 'center', paddingLeft: 6}}>
                        <Text style={[styles.inputLabel, {paddingRight: 0}]}>
                          {
                            makeIndex === -1 ? 'Select make' : makes[makeIndex].make_display
                          }
                        </Text>
                      </View>
                      <View style={styles.selectMakeDownArrowView}>
                        <Image
                          style={styles.selectMakeDownArrow}
                          source={images.downArrow}
                          resizeMode='stretch'
                        />
                      </View>
                    </View>
                  </ModalDropdown>
                </View>
              </View>
              <View style={styles.inputLine}>
                <Text style={styles.inputLabel}>Model:</Text>
                <View
                  style={styles.selectMakeOuter}
                  onLayout={(event) => {
                    var {width} = event.nativeEvent.layout;
                    this.setState({makeDropdownWidth: width})
                  }}
                >
                  <ModalDropdown
                    disabled={makeIndex === -1}
                    options={modelNames}
                    enableEmptySections={true}
                    style={styles.selectMake}
                    dropdownStyle={{width: this.state.makeDropdownWidth}}
                    dropdownTextStyle={[styles.inputLabel, {paddingRight: 0}]}
                    onSelect={(index) => {this.onModelSelect(index)}}
                  >
                    <View style={styles.selectMakeInner}>
                      <View style={{flex: 1, justifyContent: 'center', paddingLeft: 6}}>
                        <Text style={[styles.inputLabel, {paddingRight: 0}]}>
                          {
                            modelIndex === -1 ? 'Select model' : models[modelIndex].model_name
                          }
                        </Text>
                      </View>
                      <View style={styles.selectMakeDownArrowView}>
                        <Image
                          style={styles.selectMakeDownArrow}
                          source={images.downArrow}
                          resizeMode='stretch'
                        />
                      </View>
                    </View>
                  </ModalDropdown>
                </View>
              </View>
              <View style={styles.inputLine}>
                <Text style={styles.inputLabel}>License Plate:</Text>
                <TextInput
                  style={styles.inputValue}
                  underlineColorAndroid='transparent'
                  value={plate}
                  onChangeText={(e)=>{this.setState({plate: e})}}
                  autoCorrect={false}
                />
              </View>
              <View style={styles.inputLine}>
                <Text style={styles.inputLabel}>Color:</Text>
                <TextInput
                  style={styles.inputValue}
                  underlineColorAndroid='transparent'
                  value={color}
                  onChangeText={(e)=>{this.setState({color: e})}}
                  autoCorrect={false}
                />
              </View>
              <TouchableOpacity
                onPress={() => { this.selectVehicleImage() }}
                style={styles.newVehicleImage}
              >
                <Image
                  source={newVehicleImage}
                  style={{flex: 1}}
                  resizeMode='cover'
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bottomButton}
                onPress={()=>{this.saveVehicle()}}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </ImageBackground>
          </ScrollView>
        </Modal>
        {/*   Add Spot   */}
        { 
          addSpot || editSpot ? this._renderAddSpotContent() : null
        }
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    // flex: 1,
    width: width(100),
    height: height(100) - Platform.select({android: 24, ios: 0}),
    paddingTop: Platform.select({ios: 20, android: 0}),
    paddingBottom: Platform.select({ios: 20, android: 0}) + 40,
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
  separator: {
    marginLeft: 30,
    marginRight: 30,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd'
  },
  itemName: {
    fontSize: 18,
    color: '#48757f',
    backgroundColor: 'transparent'
  },
  itemDetail: {
    fontSize: 12,
    color: '#888',
    backgroundColor: 'transparent'
  },
  vehicleImage: {
    width: 56,
    height: 28,
    borderRadius: 14,
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
  modalCloseButton: {
    position: 'absolute',
    top: Platform.select({ios: 28, android: 8}),
    left: 23,
  },
  modalTitle: {
    color: '#3a6a75',
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    position: 'absolute',
    top: Platform.select({ios: 30, android: 10}),
  },
  inputLine: {
    paddingBottom: 25,
    flexDirection: 'row',
  },
  inputLabel: {
    paddingRight: 24,
    fontSize: 21,
    color: '#666',
    backgroundColor: 'transparent'
  },
  inputValue : {
    flex: 1,
    fontSize: 15,
    padding: 0,
    borderBottomColor: '#666',
    borderBottomWidth: 0.5
  },
  newVehicleImage: {
    width: width(70),
    height: width(35),
    alignSelf: 'center',
    borderWidth: 0.5,
    borderColor: '#aaa',
    marginTop: 20,
  },
  bottomButton : {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
    width: width(70),
    height: 50,
    borderRadius: 25,
    backgroundColor: '#479ac8',
    borderWidth: 0.5,
    borderColor: '#aaa',
    alignSelf: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold'
  },
  selectMakeOuter: {
    flex: 1,
    height: 32,
  },
  selectMake: {
    height: 32,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#aaa'
  },
  selectMakeInner: {
    flexDirection: 'row'
  },
  selectMakeDownArrowView: {
    width: 40,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#aaa',
    backgroundColor: '#0001'
  },
  selectMakeDownArrow: {
    width: 32,
    height: 24,
  },
  mapView: {
    width: width(100),
    height: height(100) - Platform.select({ios: 0, android: 25}),
    paddingTop: Platform.select({ios: 20}),
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapViewTitle: {
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
  addSpotNextButton: {
    alignSelf: 'center',
    position: 'absolute',
    bottom: 80,
    width: width(82),
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#479ac8'
  },
  addSpotLabel: {
    color: '#aaa',
    fontSize: 18
  },
  spotTypeActive: {
    flex: 1,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8e8e8'
  },
  spotTypeInactive: {
    flex: 1,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addSpotBottomButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#479ac8',
    borderWidth: 0.5,
    borderColor: '#aaa',
    justifyContent: 'center',
    alignItems: 'center'
  },
  availabilityInput: {
    width: width(25),
    height: 35,
    marginTop: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 7,
    color: '#aaa',
    fontSize: 18,
  },
  fill: {
    flex: 1,
    backgroundColor: '#aaa'
  },
  unfill: {
    flex: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#aaa',
    backgroundColor: 'white'
  }
});

const mapStateToProps = state => ({
  user: state.user,
})

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(ActionCreators, dispatch);
}

//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(VehicleScreen);
