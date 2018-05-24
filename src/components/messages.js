//import liraries
import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  BackHandler
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import images from '../utils/images';
import SendBird from 'sendbird';
import Swipeout from 'react-native-swipeout';
import apiConfig from '../api/config';
import { EventRegister } from 'react-native-event-listeners'

// Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ActionCreators } from '../redux/actions';

var sb = null;

// create a component
class MessagesScreen extends Component {

  constructor(props) {
    super(props);

    sb = SendBird.getInstance();
    this.state = {
      unreadCount: 0,
      channelList: [],
      listQuery:sb.GroupChannel.createMyGroupChannelListQuery(),
    }
    sb.GroupChannel.createMyGroupChannelListQuery().next();
    this._getChannelList();

    // channel handler
    var _SELF = this;
    var ChannelHandler = new sb.ChannelHandler();
    ChannelHandler.onChannelChanged = function(channel) {
      _SELF._channelUpdate(channel);
    };
    sb.addChannelHandler('ChannelHandlerInList', ChannelHandler);

    var ConnectionHandler = new sb.ConnectionHandler();
    ConnectionHandler.onReconnectSucceeded = function(){
      _SELF._refreshChannelList();
    }
    sb.addConnectionHandler('ConnectionHandlerInList', ConnectionHandler);
  }

  componentDidMount() {
    const { navigation } = this.props
    BackHandler.addEventListener('hardwareBackPress', function() {
      navigation.goBack()
      return true
    });
  }

  componentWillUnmount() {
    sb.removeChannelHandler('ChannelHandlerInList');
    sb.removeChannelHandler('ConnectionHandlerInList');
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
    EventRegister.emit('customEvent', unreadCount)
  }

  _refreshChannelList() {
    var _SELF = this;
    var listQuery = sb.GroupChannel.createMyGroupChannelListQuery();
    listQuery.next(function(channelList, error){
      if (error) {
        console.log(error);
        return;
      }
      var unreadCount = 0;
      channelList.map((list) => {
        unreadCount += list.unreadMessageCount;
      })
      _SELF.setState({ listQuery: listQuery, channelList: channelList, unreadCount});
      EventRegister.emit('customEvent', unreadCount)
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
      _SELF.setState({ channelList: newList, unreadCount });
      EventRegister.emit('customEvent', unreadCount)
    })
  }

  onChannelView(channel) {
    this.props.navigation.navigate('ChatScreen', {channelUrl: channel.url});
  }

  onDeleteChannel(channel) {
    const apiUrl = apiConfig.sendbirdUrl + 'group_channels/' + channel.url
    fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Api-Token' : apiConfig.sendbirdToken
      }
    })
      .then(() => {
        this._refreshChannelList()
      })
      .catch((err) => {
        console(err)
      })
  }

  onPhotoPress(index) {
    alert(index);
  }

  _renderMessage = ({item}) => {
    const {user} = this.props;
    const otherIndex = user.username === item.members[0].userId ? 1 : 0;
    var date = new Date();
    date.setTime(item.lastMessage.createdAt);
    var time = (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes();
    
    var swipeoutBtns = [
      {
        component: (
          <View
            style={{flex: 1, backgroundColor: '#e74c3c', justifyContent: 'center', alignItems: 'center'}}
          >
            <Text style={{fontSize: 18, color: 'white', fontWeight: 'bold'}}>Delete</Text>
          </View>
        ),
        onPress: () => {
          this.onDeleteChannel(item);
        }
      }
    ]
    return (
      <Swipeout
        right={swipeoutBtns}
        backgroundColor='transparent'
      >
      <TouchableOpacity
        onPress={() => {
          this.onChannelView(item);
        }}
      >
        <View
          style={{
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 10,
            paddingBottom: 10,
            flexDirection: 'row',
          }}>
          <View style={{
            width: 55,
          }}>
            <Image
              source={{uri: item.members[otherIndex].profileUrl}}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                marginTop: 10
              }}
            />
            {
              item.unreadMessageCount != 0 ?
              <ImageBackground
                source={images.notification}
                style={{
                  position: 'absolute',
                  width: 30,
                  height: 33,
                  marginLeft: 20,
                  alignItems: 'center'
                }}
                resizeMode='stretch'
              >
                <Text
                  style={{
                    color: 'white',
                    marginTop: Platform.select({ios: 1}),
                    backgroundColor: 'transparent'
                  }}>
                  {item.unreadMessageCount}
                </Text>
              </ImageBackground>
              : null
            }
          </View>
          <View style={{
            flex: 1,
            paddingTop: 10,
          }}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{fontSize: 16, color: 'white', fontWeight: 'bold'}}>{item.members[otherIndex].nickname}</Text>
              <Text style={{fontSize: 16, color: '#9E9E9E'}}>{time}</Text>
            </View>
            <View style={{height: 55, marginRight: 10}}>
              <Text
                style={{fontSize: 16, color: '#9E9E9E', lineHeight: 22}}
                numberOfLines={2}
                ellipsizeMode='tail'
              >
                {item.lastMessage.message}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      </Swipeout>
    );
  }

  render() {
    const { navigation } = this.props;

    const {channelList, unreadCount} = this.state;
    const messageList = channelList.map((channel, index) => {
      channel.key = index;
      return channel;
    })

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
                navigation.dispatch(NavigationActions.back());
                EventRegister.emit('customEvent', unreadCount)
              }}
            >
              <Image
                source={images.navigationBack}
                style={{width: 20, height: 20}}
                resizeMode='contain'
              />
            </TouchableOpacity>
            <Text style={styles.navigationTitle}>Messages</Text>
            {/*------------------------*/}
            {/*-------Photo List-------*/}
            <View style={styles.photoList}>
              <FlatList
                horizontal
                data={messageList}
                renderItem={({item}) => {
                  const {user} = this.props;
                  const otherIndex = user.username === item.members[0].userId ? 1 : 0;
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        this.onChannelView(item);
                      }}
                    >
                      <ImageBackground
                        source={images.messagePhotoFrame}
                        style={{
                          width: 90,
                          height: 90,
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Image
                          source={{uri: item.members[otherIndex].profileUrl}}
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                          }}
                          resizeMode='stretch'
                        />
                      </ImageBackground>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
            {/*------------------------*/}
            {/*------Message List------*/}
            <View style={{flex: 1, marginTop: 10, marginBottom: 30}}>
              <FlatList
                data={messageList}
                renderItem={this._renderMessage}
              />
            </View>
            {/*------------------------*/}
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
  buttonRight: {
    marginRight: 20,
  },
  navigationTitle: {
    color: 'white',
    fontSize: 20,
    position: 'absolute',
    marginTop: 18,
    alignSelf: 'center'
  },
  photoList: {
    marginTop: 50,
    paddingLeft: 40,
    paddingRight: 0,
    height: 90,
  }
});

const mapStateToProps = state => ({
  user: state.user
})

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(ActionCreators, dispatch);
}

//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(MessagesScreen);
