//import liraries
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  TextInput,
  TouchableOpacity,
  Platform,
  Image,
  FlatList,
  BackHandler
} from 'react-native';
import {width, height} from 'react-native-dimension';
import SendBird from 'sendbird';
import moment from 'moment';
import images from '../utils/images';

// Redux
import { connect } from 'react-redux';

var sb = null;
var channel = null;

// create a component
class ChatScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      keyboardOffset: Platform.select({ios: 0, android: 24}),
      message: '',
      messages: [],
      title: '',
    }

    sb = SendBird.getInstance();

    this.handleKeyboardShow = this.handleKeyboardShow.bind(this);
    this.handleKeyboardHide = this.handleKeyboardHide.bind(this);
  }

  componentWillUnmount() {
    sb.removeChannelHandler('ChatView');
    sb.removeConnectionHandler('ChatView')
  }

  componentDidMount() {
    const { navigation } = this.props
    BackHandler.addEventListener('hardwareBackPress', function() {
      navigation.goBack()
      return true
    });

    Keyboard.addListener('keyboardDidShow', this.handleKeyboardShow);
    Keyboard.addListener('keyboardDidHide', this.handleKeyboardHide);
    Keyboard.addListener('keyboardWillShow', this.handleKeyboardShow);
    Keyboard.addListener('keyboardWillHide', this.handleKeyboardHide);

    const { channelUrl } = this.props.navigation.state.params;
    var _SELF = this;
    sb.GroupChannel.getChannel(channelUrl, function(_channel, error) {
      if (error) {
          console.error(error);
          return;
      }

      // Successfully fetched the channel.
      channel = _channel;
      channel.markAsRead();
      console.log('~~~~CHANNEL~~~~~~');
      console.log(channel)
      const {user} = _SELF.props;
      if (channel.members[0].userId === user.username) {
        _SELF.setState({title: channel.members[1].nickname})
      } else {
        _SELF.setState({title: channel.members[0].nickname})
      }

      // channel handler
      var ChannelHandler = new sb.ChannelHandler();
      ChannelHandler.onMessageReceived = function(channel1, message){
        // _SELF._getChannelMessage(true);
        if (channel1.url === channel.url) {
          _SELF.addNewMessage(message);
          channel1.markAsRead();
        }
      };

      sb.addChannelHandler('ChatView', ChannelHandler);

      var ConnectionHandler = new sb.ConnectionHandler();
      ConnectionHandler.onReconnectSucceeded = function(){
        _SELF._getChannelMessage(true);
        channel.refresh();
      }
      sb.addConnectionHandler('ChatView', ConnectionHandler);

      _SELF.setState({messageQuery: channel.createPreviousMessageListQuery()},() => {_SELF._getChannelMessage(false)})

    });
  }

  handleKeyboardShow(e) {
    let offset = Platform.select({ios: 0, android: 25});
    this.setState({keyboardOffset: e.endCoordinates.height + offset});
  }
  
  handleKeyboardHide() {
    let offset = Platform.select({ios: 0, android: 24});
    this.setState({keyboardOffset: offset});
  }

  addNewMessage(message) {
    var { messages } = this.state;
    var _newMessageList = [];
    if (messages.length === 0) {
      _newMessageList = [[message]]
    } else if (messages[messages.length-1][0]._sender.userId === message._sender.userId) {
      messages[messages.length-1].push(message);
      _newMessageList = messages.slice(0);
    } else {
      _newMessageList = messages.concat([[message]]);
    }
    this.setState({messages: _newMessageList}, () => {
      setTimeout(() => this.flatlist.scrollToEnd(), 100);
    });
  }

  sendMessage() {
    if (channel === null) {
      return;
    }
    const { user } = this.props;
    var { messages } = this.state;
    const { message } = this.state;
    if (message.length === 0)
      return;
    var _SELF = this;
    channel.sendUserMessage(message, function(msg, error){
      if (error) {
          console.error(error);
          return;
      }
      _SELF.addNewMessage(msg)
    });
    this.setState({message: ''})
  }

  _getChannelMessage(refresh) {
    var _SELF = this;

    if(refresh){
      _SELF.state.messageQuery = channel.createPreviousMessageListQuery();
      _SELF.state.messages = [];
    }
    if (!this.state.messageQuery.hasMore) {
      return;
    }
    this.state.messageQuery.load(30, false, function(response, error){
      if (error) {
        console.log('Get Message List Fail.', error);
        return;
      }

      var _messages = [];
      var banch = [response[0]];
      var newUser = false;
      for (var i = 0 ; i < response.length ; i++) {
        _SELF.addNewMessage(response[i]);
      }
    });
  }

  _renderListItem(rowData) {
    const {user} = this.props;
    const isMine = rowData[0]._sender.userId === user.username;
    if (isMine) {
      return this._renderMineMessage(rowData);
    }
    return this._renderOthersMessage(rowData);
  }

  _renderMineMessage(rowData) {
    return (
      <View style={{marginLeft: 70, marginTop: 10}}>
        {
          rowData.map((message, index) => {
            return (
              <View key={index} style={{marginTop: index !== 0 ? 1 : 0, flexDirection: 'row'}}>
                <View style={{flex: 1}} />
                <View style={{
                  backgroundColor: '#E0E0E0',
                  borderRadius: 10,
                  borderBottomRightRadius: 0,
                  borderTopRightRadius: index === 0 ? 10 : 0,
                }}>
                  <Text style={{
                    color: 'black',
                    fontSize: 18,
                    margin: 10,
                    backgroundColor: 'transparent'
                  }}>
                    {message.message}
                  </Text>
                </View>
              </View>
            )
          })
        }
      </View>
    )
  }

  _renderOthersMessage(rowData) {
    return (
      <View style={{marginRight: 30, marginTop: 10, flexDirection: 'row'}}>
        <Image
          source={{uri: rowData[0]._sender.profileUrl}}
          style={styles.photo}
          resizeMode='stretch'
        />
        <View>
        {
          rowData.map((message, index) => {
            return (
              <View key={index} style={{marginTop: index !== 0 ? 1 : 0, flexDirection: 'row'}}>
                <View style={{
                  backgroundColor: '#3498db',
                  borderRadius: 10,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: index === (rowData.length-1) ? 10 : 0,
                }}>
                  <Text style={{
                    color: 'black',
                    fontSize: 18,
                    margin: 10,
                    backgroundColor: 'transparent'
                  }}>
                    {message.message}
                  </Text>
                </View>
                <View style={{flex: 1}} />
              </View>
            )
          })
        }
        </View>
      </View>
    )
  }

  _renderChatHistory() {
    if (channel === null) {
      return;
    }
    const { messages } = this.state;
    return (
      <View style={{flex: 1, paddingLeft: 10, paddingRight: 10, paddingTop: 8}}>
        <FlatList
        //  onEndReached={() => this._getChannelMessage(false)}
          ref={(r) => {this.flatlist = r}}
          data={messages}
          keyExtractor={(item, index) => index}
          renderItem={({item}) => this._renderListItem(item)}
          showsVerticalScrollIndicator={false}
        />
      </View>
    )
  }

  render() {
    return (
      <View style={[styles.container, {height: height(100) - this.state.keyboardOffset}]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => this.props.navigation.goBack()}
          >
            <Image
              source={images.backIcon}
              style={{width: 25, height: 25, margin: 2.5}}
              resizeMode='stretch'
            />
          </TouchableOpacity>
          <Text style={{color: 'black', fontSize: 24}}>{this.state.title}</Text>
          <View style={{width: 30}}/>
        </View>
        <View style={styles.content}>
          { this._renderChatHistory() }
        </View>
        <View style={styles.messageInputContainer}>
          <TextInput
            value={this.state.message}
            onChangeText={(e)=>this.setState({message: e})}
            style={styles.messageInput}
            underlineColorAndroid='transparent'
            autoCapitalize='none'
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={()=>{this.sendMessage()}}
          >
            <Image
              source={images.sendIcon}
              style={styles.sendIcon}
              resizeMode='stretch'
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

// define your styles
const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'white'
  },
  header: {
    height: 60 + Platform.select({ios: 20, android: 0}),
    paddingTop: Platform.select({ios: 20, android: 0}),
    backgroundColor: '#f0f0f0',
    elevation: 10,
    shadowOffset: {width: 0, height: 4},
    shadowColor: '#000',
    shadowOpacity: 0.3,
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  content: {
    flex: 1,
  },
  messageInputContainer: {
    height: 60,
    padding: 10,
    backgroundColor: '#0007',
    flexDirection: 'row',
    alignItems: 'center'
  },
  messageInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 3,
    backgroundColor: 'white'
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: 'transparent'
  },
  sendIcon: {
    width: 34,
    height: 34,
  },
  photo: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 8,
  }
});

const mapStateToProps = state => ({
  user: state.user
})

//make this component available to the app
export default connect(mapStateToProps)(ChatScreen);
