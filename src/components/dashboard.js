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
  FlatList,
  BackHandler
} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { NavigationActions } from 'react-navigation';
import { width } from 'react-native-dimension';
import images from '../utils/images'
import * as RealmDB from '../redux/realm'
import apiConfig from '../api/config'
import ChartView from 'react-native-highcharts'

// Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ActionCreators } from '../redux/actions';

// create a component
class DashboardScreen extends Component {

  constructor(props) {
    super(props);

    this.state = {
      tab: 1,
      topSpotInfo: [],
      reservations: [],
      loaded1: false,
      renterReservations: [],
      loaded2: false,
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

  componentDidMount() {
    const { navigation } = this.props
    BackHandler.addEventListener('hardwareBackPress', function() {
      navigation.goBack()
      return true
    });

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

      var countObj = {}
      const keys = []
      visited.map((item) => {
        const key = item.spotId.toString()
        if (countObj[key] === undefined) {
          countObj[key] = visited.filter((x) => {return x.spotId === parseInt(key)}).length
          keys.push(key)
        }
      })
      keys.sort((a, b) => {
        return countObj[b] - countObj[a]
      })
      const topSpotInfo = keys.map((key) => {
        return {id: parseInt(key), count: countObj[key]}
      })
      this.setState({topSpotInfo, reservations: visited, loaded2: true})
    }, (err) => {
      alert('Cannot get data from server!')
    })
  }

  _navigationTitle() {
    const { tab } = this.state;
    if (tab == 0)
      return 'My Wallet';
    else if (tab == 1)
      return 'My Savings';
    return 'History';
  }

  calcDuration(item) {
    const from = this.getDate(item.date, item.from)
    const to = this.getDate(item.date, item.to)
    
    return (to - from) / (1000 * 60 * 60)
  }

  getReservationDate(item) {
    const dateStr = item.date
    const year = parseInt(dateStr.slice(0, 4))
    const month = parseInt(dateStr.slice(5, 7))
    const day = parseInt(dateStr.slice(8, 10))
    return new Date(year, month - 1, day)
  }
  
  _renderMainView() {
    const { tab, topSpotInfo, reservations } = this.state;
    const { user } = this.props
    const name = user.firstname + ' ' + user.lastname
    
    const defaultData = [];
    defaultData.push({ key: 0, name: 'Chase', type: 'Visa', cardNumber: '**** **** **** 8870'})

    const walletData = [];
    walletData.push({ key: 0, name: 'BOA', type: 'Mastercard', cardNumber: '**** **** **** 1060'})
    walletData.push({ key: 1, name: 'Citi', type: 'Mastercard', cardNumber: '**** **** **** 1060'})

    const topSpotsData = [];
    topSpotInfo.map((spotInfo, idx) => {
      const spot = RealmDB.getSpotById(spotInfo.id)
      var item = {key: idx}
      item.name = spot.name
      var money = 0
      reservations.filter((a) => {
        return a.spotId === spotInfo.id && a.username === user.username
      }).map((reservation) => {
        const duration = this.calcDuration(reservation)
        money += duration * spot.rate
        item.date = reservation.date
      })
      item.money = money
      item.count = spotInfo.count
      topSpotsData.push(item)
    })

    /**
     * Calculate balance history
     */
    if (!this.state.loaded1 || !this.state.loaded2) {
      return
    }
    const { renterReservations } = this.state;
    var earning = new Array(7).fill(0)
    const date = new Date()
    var one_day = 1000 * 60 * 60 * 24;
    date.setDate(date.getDate() - 6)
    reservations.map((item) => {
      const _date = this.getReservationDate(item)
      const cost = this.calcDuration(item) * item.spotInfo.rate
      const index = Math.round((_date - date) / one_day) + 1
      if (index >= 0) {
        earning[index] -= cost
      }
    })
    renterReservations.map((item) => {
      const _date = this.getReservationDate(item)
      const cost = this.calcDuration(item) * item.spotInfo.rate
      const index = Math.round((_date - date) / one_day) + 1
      if (index >= 0) {
        earning[index] += cost
      }
    })

    const allReservations = []
    reservations.map((item) => allReservations.push({...item, mine: true}))
    renterReservations.map((item) => allReservations.push({...item, mine: false}))

    /**
     * Config Chart
     */
    var Highcharts='Highcharts';
    const categories = []
    var dateFormat = require('dateformat')
    for (var i = 0; i < 7; i ++) {
      const _date = new Date(date.getTime())
      _date.setDate(_date.getDate() + i)
      categories.push(dateFormat(_date, 'm-d'))
    }
    var balance = user.balance
    const data = earning.map((money) => {
      balance += money
      return balance
    })
    var conf = {
      chart: {
        type: 'line',
        backgroundColor: '#2d3742'
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: categories
      },
      yAxis: {
        title: {
          text: ''
        },
        labels: {
          formatter: function () {
            return ''
          }
        },
        gridLineWidth: 0
      },
      tooltip: {
        formatter: function () {
          return null
        }
      },
      legend: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      plotOptions: {
        line: {
          dataLabels: {
            enabled: true
          },
          enableMouseTracking: false,
          color: '#2cc298',
        }
      },
      series: [
        {
          data: data,
          lineWidth: 5
        }
      ]
    };

    if (tab == 2) {     // History Tab
      return (
        <View style={{
          marginTop: 60,
          marginBottom: 56,
          marginLeft: 25,
          marginRight: 25,
          flex: 1,
        }}>
          <View style={{paddingRight: 10, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{justifyContent: 'center', backgroundColor: 'transparent'}}>
              <Text style={{fontSize: 24, marginTop: 10, color: 'white'}}>{name}</Text>
              <Text style={{fontSize: 15, marginTop: 5, color: 'white'}}>Current balance: ${balance}</Text>
            </View>
            <Image
              source={{uri: apiConfig.url + user.photo}}
              style={{width: 100, height: 100, borderRadius: 50}}
              resizeMode='stretch'
            />
          </View>
          <View style={{flex: 1}}>
            <FlatList
              data={allReservations}
              keyExtractor={(item, index) => index}
              renderItem={this._renderHistoryItem.bind(this)}
            />
          </View>
        </View>
      );
    }

    return (
      <View style={{
        marginTop: 60,
        marginBottom: 56,
        flex: 1,
      }}>
        <View style={{flex: 1}}>
          {/*-------Profile-------*/}
          <View style={{
            position: 'absolute',
            top: 20,
            paddingLeft: 20,
            width: width(100),
            height: 60,
            flexDirection: 'row'
          }}>
            {
              this.state.tab == 0 ?
            <Image
              source={{uri: apiConfig.url + user.photo}}
              style={{width: 60, height: 60, borderRadius: 30, marginRight: 18}}
              resizeMode='stretch'
            />
            : null
            }
            <View style={{justifyContent: 'space-around', backgroundColor: 'transparent'}}>
              <Text style={{color: 'white', fontSize: 26}}>{name}</Text>
              <Text style={{color: 'white', fontSize: 15}}>Current Ballance: ${balance}</Text>
            </View>
          </View>
          {/*--------Chart--------*/}
          <View style={{flex: 1, marginTop: 80, marginBottom: 60, backgroundColor: '#0f03'}}>
            <ChartView
              style={{width: '100%', height: '100%'}}
              config={conf}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          </View>
          {/*---------------------*/}
        </View>
        <View style={{height: 220, backgroundColor: '#f6f9fc'}}>
          <View style={{flex:1}}/>
          <View style={{height: 145, marginLeft: 20, marginRight: 20, paddingTop: 5, borderTopColor: '#e3ebf3', borderTopWidth: 2}}>
            <FlatList
              data={this.state.tab == 0 ? walletData : allReservations}
              keyExtractor={(item, index) => index}
              renderItem={this.state.tab == 0 ? this._renderWalletItem.bind(this) : this._renderSavingItem.bind(this)}
            />
          </View>
        </View>
        <View style={{
          position: 'absolute',
          width: '100%',
          height: 100,
          bottom: 170,
        }}>
          <Carousel
            sliderWidth={width(100)}
            itemWidth={width(80)}
            data={this.state.tab == 0 ? defaultData : topSpotsData}
            renderItem={this.state.tab == 0 ? this._renderWalletScrollItem : this._renderSavingScrollItem}
            inactiveSlideOpacity={1}
            inactiveSlideScale={0.87}
          />
        </View>
      </View>
    )
  }

  _renderWalletItem({item}) {
    const paymentImage = item.type == 'Visa' ? images.visa : images.mastercard
    return (
      <View style={{paddingTop: 10}}>
        <TouchableOpacity
          onPress={() => {this.onWalletItemPress(item)}}
        >
          <View style={{height: 60, padding: 10, borderRadius: 8, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{justifyContent: 'space-around'}}>
              <Text style={{color: 'black'}}>{item.name}</Text>
              <Text style={{color: '#aaa', fontSize: 12}}>Card Number: {item.cardNumber}</Text>
            </View>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Image
                source={paymentImage}
                style={{width: 40, height: 28, /*borderWidth: 1, borderColor: '#ccc'*/}}
                resizeMode='contain'
              />
              <Text style={{color: '#aaa', fontSize: 12}}>{item.type}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  _renderWalletScrollItem({item, index}) {
    const paymentImage = item.type == 'Visa' ? images.visa : images.mastercard
    return (
      <View style={{
        width: width(80),
        height: 100,
        borderRadius: 7,
        backgroundColor: 'white',
        padding: 15,
        paddingBottom: 12,
        paddingRight: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
      }}>
        <View>
          <Text style={{color: 'black', fontSize: 17, paddingBottom: 15}}>Default card: {item.name}</Text>
          <Text style={{color: '#aaa', fontSize: 13}}>Card Number: {item.cardNumber}</Text>
        </View>
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <Image
            source={paymentImage}
            style={{width: 40, height: 28, /*borderWidth: 1, borderColor: '#ccc'*/}}
            resizeMode='contain'
          />
          <Text style={{color: '#aaa', fontSize: 13, paddingTop: 10}}>{item.type}</Text>
        </View>
      </View>
    )
  }

  _renderSavingItem({item}) {
    const money = this.calcDuration(item) * item.spotInfo.rate
    return (
      <View style={{paddingTop: 10}}>
        <View style={{height: 60, padding: 10, borderRadius: 8, backgroundColor: 'white', justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{color: 'black', fontSize: 15}}>{item.spotInfo.name}</Text>
            <View style={{flexDirection: 'row'}}>
              <Text style={{color: 'black', fontSize: 15}}>{item.mine ? 'Spend:' : 'Earned:'}</Text>
              <Text style={{color: item.mine ? '#c0392b' : '#2ecc71', fontSize: 15}}> ${money}</Text>
            </View>
          </View>
          <Text style={{color: '#aaa', fontSize: 13}}>{item.date}</Text>
        </View>
      </View>
    )
  }

  _renderSavingScrollItem({item, index}) {
    return (
      <View style={{
        width: width(80),
        height: 80,
        borderRadius: 7,
        backgroundColor: 'white',
        padding: 15,
        paddingBottom: 12
      }}>
        <View style={{flex: 1, justifyContent: 'space-between'}}>
          <Text style={{color: 'black', fontSize: 20}}>{item.name}</Text>
          <Text style={{fontSize: 16, color: '#888'}}>Visited {item.count}times</Text>
        </View>
      </View>
    )
  }

  _renderHistoryItem({item}) {
    const money = this.calcDuration(item) * item.spotInfo.rate
    return (
      <View style={{marginTop: 10, marginBottom: 10, borderRadius: 5, height: 80, backgroundColor: 'white'}}>
        <TouchableOpacity
          style={{flex: 1, paddingLeft: 25, paddingRight: 25, paddingTop: 18, paddingBottom: 10, justifyContent: 'space-between'}}
          onPress={() => {this.onHistoryItemPress(item)}}
        >
          <Text style={{color: 'black', fontSize: 16}}>{item.spotInfo.name}</Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flexDirection: 'row'}}>
              <Text style={{color: '#aaa'}}>{item.mine ? 'Spend:' : 'Earned:'}</Text>
              <Text style={{color: item.mine ? '#c0392b' : '#2ecc71'}}> ${money}</Text>
            </View>
            <Text style={{color: '#aaa'}}>{item.date}</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  onWalletItemPress(item) {
    
  }

  onSavingItemPress(item) {
    
  }

  onHistoryItemPress(item) {
    this.props.navigation.navigate('HistoryItemScreen', item)
  }

  _renderTabBar() {
    return (
      [<View key={0} style={{
        width: '100%',
        height: 56,
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
      }}>
        <View style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}>
          <View style={styles.tabButtonContainer}>
            <TouchableOpacity onPress={() => {this.onFindPress()}}>
              <View style={[styles.tabButton, styles.tabButtonNormal]}>
                <Image
                  source={images.dashboardFind}
                  style={{width: 18, height: 18}}
                  resizeMode='contain'
                />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.tabButtonContainer}>
            <TouchableOpacity onPress={()=>{this.onTabPress(0)}}>
              <View style={[styles.tabButton, this.state.tab == 0 ? styles.tabButtonSelect : styles.tabButtonNormal]}>
                <Image
                  source={this.state.tab == 0 ? images.dashboardWalletSelect : images.dashboardWallet}
                />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.tabButtonContainer}/>
          <View style={styles.tabButtonContainer}>
            <TouchableOpacity onPress={()=>{this.onTabPress(1)}}>
              <View style={[styles.tabButton, this.state.tab == 1 ? styles.tabButtonSelect : styles.tabButtonNormal]}>
                <Image
                  source={this.state.tab == 1 ? images.dashboardSavingSelect : images.dashboardSaving}
                />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.tabButtonContainer}>
            <TouchableOpacity onPress={()=>{this.onTabPress(2)}}>
              <View style={[styles.tabButton, this.state.tab == 2 ? styles.tabButtonSelect : styles.tabButtonNormal]}>
                <Image
                  source={this.state.tab == 2 ? images.dashboardHistorySelect : images.dashboardHistory}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>,
      <View key={1} style={styles.tabHome}>
        <TouchableOpacity
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
          onPress={() => {this.onHomePress()}}
        >
          <Image source={images.dashboardHome}/>
        </TouchableOpacity>
      </View>]
    );
  }

  onFindPress() {
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: 'MapScreen'})
      ]
    })
    this.props.navigation.dispatch(resetAction)
  }

  onHomePress() {
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: 'HomeScreen'})
      ]
    })
    this.props.navigation.dispatch(resetAction)
  }

  onTabPress(index) {
    this.setState({tab: index});
  }

  render() {
    const {navigation} = this.props;

    return (
      <View style={styles.container}>
        <ImageBackground
          source={images.historyBackground}
          style={{flex:1}}
          resizeMode='stretch'
        >
        <View style={styles.safeArea}>
          {/*-----Navigation Bar-----*/}
            <TouchableOpacity
              style={[styles.navigationButton, styles.buttonLeft]}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Image
                source={images.navigationBack}
                style={{width: 20, height: 20}}
                resizeMode='contain'
              />
            </TouchableOpacity>
            <Text style={styles.navigationTitle}>
              { this._navigationTitle() }
            </Text>
            {
              this.state.tab == 0 ?
              <TouchableOpacity
                style={[styles.navigationButton, styles.buttonRight]}
                onPress={() => {
                  
                }}
              >
                <Image
                  source={images.sideMenuAdd}
                  style={{width: 20, height: 20}}
                  resizeMode='contain'
                />
              </TouchableOpacity>
              : null
            }
          {/*------------------------*/}
          { this._renderMainView() }
          { this._renderTabBar() }
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
    left: 20,
  },
  buttonRight: {
    right: 20,
  },
  navigationTitle: {
    color: 'white',
    fontSize: 20,
    position: 'absolute',
    marginTop: 18,
    alignSelf: 'center',
    backgroundColor: 'transparent'
  },
  tabButtonContainer: {
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButton: {
    width: 56,
    height: 56,
  },
  tabButtonNormal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonSelect: {
    justifyContent: 'flex-end'
  },
  tabHome: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#30c299',
    bottom: 8,
    position: 'absolute',
    alignSelf: 'center'
  }
});

const mapStateToProps = state => ({
  user: state.user
})

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(ActionCreators, dispatch);
}

//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(DashboardScreen);
