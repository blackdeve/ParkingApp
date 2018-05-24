//import liraries
import React, { Component } from 'react';
import {
  View,
  Text,
  Platform,
  Image,
  StyleSheet,
  TouchableOpacity,
  Picker,
  ImageBackground,
  Modal,
  BackHandler
} from 'react-native';
import { width, height } from 'react-native-dimension'
import images from '../utils/images'
import ModalDropdown from 'react-native-modal-dropdown'
import Carousel from 'react-native-snap-carousel'
import apiConfig from '../api/config';
import RNImmediatePhoneCall from 'react-native-immediate-phone-call'
import SendBird from 'sendbird'
import DatePicker from 'react-native-datepicker'
import * as RealmDB from '../redux/realm';

// Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ActionCreators } from '../redux/actions';

const shadowOpt = {
  width: 100,
  height: 100,
  color: "#000",
  border: 2,
  radius: 3,
  opacity: 0.2,
  x: 0,
  y: 3,
  style: {
    marginVertical: 5
  }
}

// create a component
class ReservationScreen extends Component {
  constructor(props) {
    super(props)

    const { spot } = this.props.navigation.state.params;

    this.state = {
      tab: 0,
      showConfirmModal: false,
      spot,
      date: null,
      from: null,
      to: null,
      owner: null,
      reservations: null
    }
    const { getUserInfo, GetReservations } = this.props;
    getUserInfo(spot.username)
    .then((owner) => {
      this.setState({owner})
    }, (err) => {
      alert(err)
    })

    GetReservations(spot.id)
    .then((reservations) => {
      this.setState({reservations});
    }, (err) => {
      alert(err)
    })
  }

  componentDidMount() {
    const { navigation } = this.props
    BackHandler.addEventListener('hardwareBackPress', function() {
      navigation.goBack()
      return true
    });
  }

  callContactOwner() {
    const { owner } = this.state
    RNImmediatePhoneCall.immediatePhoneCall(owner.phone);
  }

  messageContactOwner() {
    const { user, navigation } = this.props;
    const { owner } = this.state;
    if (user.username === owner.username) {
      alert('This is your spot')
      return
    }
    var sb = SendBird.getInstance();
    var userIds = [user.username, owner.username];
    sb.GroupChannel.createChannelWithUserIds(userIds, true, function(createdChannel, error) {
      if (error) {
          console.error(error);
          return;
      }
      navigation.navigate('ChatScreen', {channelUrl: createdChannel.url})
    });
  }

  getDate(date, time) {
    const _year = parseInt(date.slice(0, 4))
    const _month = parseInt(date.slice(5, 7))
    const _date = parseInt(date.slice(8, 10))
    const _hour = time !== undefined ? parseInt(time.slice(0, 2)) : 0
    const _minute = time !== undefined ? parseInt(time.slice(3, 5)) : 0
    return new Date(_year, _month - 1, _date, _hour, _minute)
  }

  onReserveButtonPress() {
    this.setState({showConfirmModal: true})
  }

  onReserveSpot() {
    const {user, reserveSpot} = this.props;
    const {spot, date, from, to} = this.state;
    const vehicles = RealmDB.getVehicles()
    if (vehicles.length === 0) {
      alert('You should have at lease 1 vehicle to reseve spot')
      return
    }

    reserveSpot(user.username, spot.id, date, from, to)
    .then(() => {
      this.setState({showConfirmModal: false}, () => {
        this.props.navigation.navigate('DashboardScreen')
      })
    }, (err) => {
      alert(err);
    })
  }
/*
  _renderDropdown(listData, initialValue, index) {
    return (
      <ModalDropdown
        ref={(ref) => {
          index === 0 ? this.startTime = ref : this.endTime = ref;
        }}
        style={styles.timePicker}
        dropdownStyle={styles.dropdownList}
        dropdownTextStyle={styles.dropdownText}
        options={listData}
        onSelect={(idx, value) => {
          if (index === 0) {
            this.setState({from: value})
          } else {
            this.setState({to: value})
          }
        }}
      >
        <View style={styles.inner}>
          <Text style={styles.pickerValue}>{initialValue === null ? '-----' : initialValue}</Text>
          <View style={styles.downarrowview}>
          <Image
            source={images.downArrow}
            style={styles.downarrow}
            resizeMode='stretch'
          />
          </View>
        </View>
      </ModalDropdown>
    )
  }
*/
  _renderReservationImage({item, index}) {
    return (
      <View style={{
        width: width(75),
        height: '100%',
        backgroundColor: 'white'
      }}>
        <Image
          source={item}
          style={{width: '100%', height: '100%'}}
          resizeMode='stretch'
        />
      </View>
    )
  }

  render() {
    const {spot, date, from, to, owner, reservations} = this.state;

    if (reservations === null) {
      return null;
    }

    let ownerName = ''
    let money = 0
    if (owner !== null) {
      ownerName = owner.firstname + ' ' + owner.lastname
    }

    let reservationImages = [];
    reservationImages.push({uri: apiConfig.url + spot.image})

    const validTextStyle = { color: '#2ecc71' },
          invalidTextStyle = { color: '#e74c3c', fontWeight: 'bold' }

    const today = new Date()
    today.setHours(0)
    today.setMinutes(0)
    today.setSeconds(0)
    today.setMilliseconds(0)

    let validDate = false, validFrom = false, validTo = false
    if (date !== null) {
      let _date = this.getDate(date)
      validDate = spot.availability[(_date.getDay() + 6) % 7] && _date >= today
      if (validDate && from !== null) {
        const _start = this.getDate(date, from)
        validFrom = _start >= new Date() && _start >= this.getDate(date, spot.from) && _start < this.getDate(date, spot.to)

        if (validFrom) {
          reservations.map((reservation) => {
            const resFrom = this.getDate(reservation.date, reservation.from)
            const resTo = this.getDate(reservation.date, reservation.to)
            if (resFrom <= _start && resTo > _start) {
              validFrom = false
            }
          })
        }

        if (validFrom && to !== null) {
          const _end = this.getDate(date, to)
          validTo = _end > _start && _end <= this.getDate(date, spot.to)
          
          if (validTo) {
            reservations.map((reservation) => {
              const resFrom = this.getDate(reservation.date, reservation.from)
              const resTo = this.getDate(reservation.date, reservation.to)
              if ((resFrom < _end && resTo >= _end) || (_start < resFrom && resTo < _end)) {
                validTo = false
              }
            })
          }

          money = spot.rate * (_end - _start) / (1000 * 60 * 60)
        }
      }
    }

    return (
      <View style={styles.container}>
        <ImageBackground
          source={images.messageBackground}
          style={{flex: 1}}
        >
          <View style={{
            flex: 1,
            marginTop: Platform.select({ios: 20}),
          }}>
            {/*-----Image Slide && Contact owner photo-----*/}
            <View style={{
              height: this.state.tab == 0 ? 230 : 180,
              justifyContent: 'center',
            }}>
            {
              this.state.tab == 0 ?
              <View style={styles.reservationImageSlider}>
                <Carousel
                  sliderWidth={width(100)}
                  itemWidth={width(75)}
                  data={reservationImages}
                  renderItem={this._renderReservationImage.bind(this)}
                  inactiveSlideOpacity={1}
                  inactiveSlideScale={0.87}
                />
              </View>
              :
              <Image
                source={owner !== null ? {uri: apiConfig.url + owner.photo} : null}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  alignSelf: 'center',
                }}
                resizeMode='stretch'
              />
            }
            </View>
            {/*-----Tab Bar-----*/}
            <View style={{
              height: 57,
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              alignItems: 'center'
            }}>
              <View style={{
                width: width(40),
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <TouchableOpacity
                  style={{
                    width: 60,
                    height: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={()=>{this.setState({tab: 0})}}
                >
                  <Text style={{
                    color: 'white',
                    fontWeight: this.state.tab == 0 ? '500' : '200',
                    textAlign: 'center',
                  }}>
                    Edit time
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    width: 60,
                    height: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={()=>{this.setState({tab: 1})}}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: this.state.tab == 0 ? '200' : '500',
                      textAlign: 'center',
                      lineHeight: 15
                    }}
                    numberOfLines={2}
                  >
                    Contact owner
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{
                width: width(40),
                height: 2.5,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
                <View style={{
                  width: 50,
                  marginLeft: 5,
                  backgroundColor: this.state.tab == 0 ? '#2cbf96' : 'transparent'
                }}/>
                <View style={{
                  width: 50,
                  marginRight: 5,
                  backgroundColor: this.state.tab == 1 ? '#2cbf96' : 'transparent'
                }}/>
              </View>
            </View>

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
            {
              this.state.tab == 0 ?
              /*-----Spot Information-----*/
              <View style={{
                backgroundColor: 'white',
                flex: 1,
                padding: 20,
                paddingTop: 40,
                paddingBottom: 0,
              }}>
                <View style={{
                  height: 110,
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Text style={{
                    color: '#999',
                    fontSize: 19,
                    fontWeight: 'bold',
                    fontStyle: 'italic'
                  }}>
                    {spot.name}
                  </Text>
                  <View style={{alignItems: 'center'}}>
                    <Text style={{color: '#999', textAlign: 'center', paddingLeft: 50, paddingRight: 50}}>{spot.location}</Text>
                    <Text style={{color: '#999'}}>Spot# {spot.id + 1}</Text>
                  </View>
                  <Text style={{color: '#999'}}>Owner's instruction: {spot.description}</Text>
                </View>
                <View style={{
                  height: 28,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text style={{color: '#999'}}>Price: $ {spot.rate} per hour</Text>
                </View>
                <View zIndex={1} style={{
                  height: 60,
                  borderColor: '#ddd',
                  borderTopWidth: 0.5,
                  borderBottomWidth: 0.5,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-around'
                }}>
                  <DatePicker
                    style={{width: 100, height: 30, justifyContent: 'center'}}
                    customStyles={{
                      dateInput:{
                        width: 100, height: 30
                      },
                      dateText: validDate ? validTextStyle : invalidTextStyle,
                      placeholderText: {
                        color: '#777'
                      }
                    }}
                    date={this.state.date}
                    mode="date"
                    showIcon={false}
                    placeholder="Date"
                    minDate={spot.startDate}
                    maxDate={spot.endDate}
                    format="YYYY-MM-DD"
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    onDateChange={(date) => {this.setState({date: date})}}
                  />
                  <DatePicker
                    style={{width: 60, height: 30, justifyContent: 'center'}}
                    customStyles={{
                      dateInput:{
                        width: 60, height: 30
                      },
                      dateText: validFrom ? validTextStyle : invalidTextStyle,
                      placeholderText: {
                        color: '#777'
                      }
                    }}
                    date={from}
                    mode="time"
                    disabled={!validDate}
                    minuteInterval={30}
                    showIcon={false}
                    placeholder="From"
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    onDateChange={(time) => {
                      let _min = parseInt(time.slice(3, 5))
                      _min -= _min % 30
                      const _minStr = _min < 10 ? '0' + _min.toString() : _min.toString()
                      this.setState({from: time.slice(0, 3) + _minStr})
                    }}
                  />
                  <DatePicker
                    style={{width: 60, height: 30, justifyContent: 'center'}}
                    customStyles={{
                      dateInput:{
                        width: 60, height: 30
                      },
                      dateText: validTo ? validTextStyle : invalidTextStyle,
                      placeholderText: {
                        color: '#777'
                      }
                    }}
                    date={to}
                    mode="time"
                    disabled={!(validDate && validFrom)}
                    minuteInterval={30}
                    showIcon={false}
                    placeholder="To"
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
                <View zIndex={0} style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <TouchableOpacity
                    disabled={!(validDate && validFrom && validTo)}
                    onPress={()=>{this.onReserveButtonPress()}}
                  >
                    <View style={{
                      width: 200,
                      height: 45,
                      borderRadius: 22.5,
                      backgroundColor: '#479ac8',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Text style={{
                        color: 'white',
                        fontSize: 20,
                        fontWeight: 'bold',
                      }}>Make Reservation</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              :
              /*-----Contact owner information-----*/
              <View style={{
                flex: 1,
                backgroundColor: 'white',
                padding: 20,
                paddingTop: 40,
                paddingBottom: 0,
              }}>
                <View style={{
                  height: 70,
                  marginBottom: 20,
                  borderBottomColor: '#ddd',
                  borderBottomWidth: 0.5,
                  justifyContent: 'space-between'
                }}>
                  <Text style={styles.contactInfoText}>Phone number:</Text>
                  <View style={{
                    flexDirection: 'row',
                    height: 40,
                    marginBottom: 3
                  }}>
                    <Image
                      source={owner !== null ? {uri: apiConfig.url + owner.photo} : null}
                      style={{width: 30, height: 30, borderRadius: 15, marginTop: 3, marginRight: 12}}
                      resizeMode='stretch'
                    />
                    <View style={{
                      height: '100%',
                      justifyContent: 'space-between',
                    }}>
                      <Text style={{color: 'black', fontSize:15}}>{ownerName}</Text>
                      <Text style={styles.contactInfoText}>{owner.phone}</Text>
                    </View>
                  </View>
                </View>
                <View style={{
                  height: 70,
                  marginBottom: 20,
                  borderBottomColor: '#ddd',
                  borderBottomWidth: 0.5,
                }}>
                  <Text style={styles.contactInfoText}>Description:</Text>
                  <Text style={styles.contactInfoText}>{spot.description}</Text>
                </View>
                <View style={{
                  height: 70,
                  borderBottomColor: '#ddd',
                  borderBottomWidth: 0.5,
                }}>
                  <Text style={styles.contactInfoText}>Other contact info:</Text>
                  <Text style={[styles.contactInfoText, {marginTop: 18}]}>Email: {spot.email}</Text>
                </View>
                <View style={{
                  flex: 1,
                  marginLeft: width(15),
                  marginRight: width(15),
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <TouchableOpacity
                    onPress={()=>{this.callContactOwner()}}
                  >
                    <View style={{
                      width: width(25),
                      height: 45,
                      borderRadius: 22.5,
                      backgroundColor: '#479ac8',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{color: 'white', fontSize: 18}}>Call</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={()=>{this.messageContactOwner()}}
                  >
                    <View style={{
                      width: width(25),
                      height: 45,
                      borderRadius: 22.5,
                      backgroundColor: '#479ac8',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{color: 'white', fontSize: 18}}>Message</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            }
            {/*-----Confirm Modal-----*/}
            <Modal
              animationType='fade'
              transparent={true}
              visible={this.state.showConfirmModal}
              onRequestClose={() => {this.setState({showConfirmModal: false})}}
            >
              <TouchableOpacity
                style={{flex: 1, backgroundColor: 'rgba(150, 150, 150, 0.4)',}}
                onPress={()=>{this.setState({showConfirmModal: false})}}
              />
              <View style={{
                margin: 20,
                position: 'absolute',
                bottom: 0,
                width: width(100)-40,
                height: 260,
                borderRadius: 7,
                backgroundColor: 'white'
              }}>
                <View style={{justifyContent: 'space-around', alignItems: 'center', height: 180}}>
                  <View style={{width: '100%', height: 45, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{color: 'black', fontSize: 16}}>Reservation Summary</Text>
                  </View>
                  <View style={{width: '100%', flex: 1, paddingLeft: 40, paddingRight: 40, justifyContent: 'space-between', marginBottom: 14}}>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.confirmText, {width: 120}]}>Property name:</Text>
                      <Text style={[styles.confirmText, {flex: 1}]} numberOfLines={2}>{spot.name}</Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.confirmText, {width: 120}]}>Location:</Text>
                      <Text style={[styles.confirmText, {flex: 1}]} numberOfLines={2}>{spot.location}</Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.confirmText, {width: 120}]}>Spot#:</Text>
                      <Text style={[styles.confirmText, {flex: 1}]} numberOfLines={2}>{spot.id + 1}</Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.confirmText, {width: 120}]}>Total cost:</Text>
                      <Text style={[styles.confirmText, {flex: 1}]} numberOfLines={2}>${money}</Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.confirmText, {width: 120}]}>Date:</Text>
                      <Text style={[styles.confirmText, {flex: 1}]}>{date}</Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={[styles.confirmText, {width: 120}]}>Time:</Text>
                      <Text style={[styles.confirmText, {flex: 1}]} numberOfLines={2}>{from} - {to}</Text>
                    </View>
                  </View>
                </View>
                <View style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderTopWidth: 0.5,
                  borderTopColor: '#479ac899'}}>
                  <TouchableOpacity
                    onPress={()=>{
                      this.onReserveSpot()
                    }}
                  >
                    <View style={{
                      width: 200,
                      height: 45,
                      borderRadius: 22.5,
                      backgroundColor: '#479ac8',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{
                        color: 'white',
                        fontSize: 20,
                        fontWeight: 'bold',
                      }}>Confirm</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
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
  contactInfoText: {
    color: '#999',
    fontSize: 15,
  },
  confirmText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: 'bold'
  },
  timePicker: {
    width: 72,
    height: 27,
    borderWidth: 1,
    borderColor: '#aaa'
  },
  pickerValue: {
    // width: 45,
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 25,
  },
  dropdownList: {
    width: 72,
  },
  dropdownText: {
    fontSize: 15
  },
  downarrow: {
    width: 25,
    height: 25,
  },
  downarrowview : {
    width: 25,
    height: 25,
    borderLeftWidth: 1,
    borderLeftColor: '#aaa',
  },
  inner: {
    flexDirection: 'row',
  },
  reservationImageSlider: {
    marginTop: '3%',
    height: '76%',
  },
});

const mapStateToProps = state => ({
  user: state.user,
})

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(ActionCreators, dispatch);
}

//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(ReservationScreen);
